// sql.js is loaded lazily — no top-level import so it can't crash the app

let db: any = null;
let initPromise: Promise<any> | null = null;
let initError: string | null = null;

const SEED_SQL = `
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY,
  name TEXT,
  department TEXT,
  salary INTEGER,
  hire_date TEXT,
  manager_id INTEGER
);
INSERT INTO employees VALUES (1, 'Alice', 'Engineering', 95000, '2020-03-15', NULL);
INSERT INTO employees VALUES (2, 'Bob', 'Engineering', 88000, '2021-06-01', 1);
INSERT INTO employees VALUES (3, 'Carol', 'Marketing', 72000, '2019-11-20', NULL);
INSERT INTO employees VALUES (4, 'Dave', 'Marketing', 68000, '2022-01-10', 3);
INSERT INTO employees VALUES (5, 'Eve', 'Sales', 78000, '2020-08-05', NULL);
INSERT INTO employees VALUES (6, 'Frank', 'Sales', 65000, '2023-02-14', 5);
INSERT INTO employees VALUES (7, 'Grace', 'Engineering', 102000, '2018-07-22', 1);
INSERT INTO employees VALUES (8, 'Hank', 'HR', 71000, '2021-09-30', NULL);

CREATE TABLE IF NOT EXISTS departments (
  id INTEGER PRIMARY KEY,
  dept_name TEXT,
  location TEXT,
  budget INTEGER
);
INSERT INTO departments VALUES (1, 'Engineering', 'Building A', 500000);
INSERT INTO departments VALUES (2, 'Marketing', 'Building B', 250000);
INSERT INTO departments VALUES (3, 'Sales', 'Building C', 300000);
INSERT INTO departments VALUES (4, 'HR', 'Building A', 150000);
INSERT INTO departments VALUES (5, 'Finance', 'Building D', 200000);

CREATE TABLE IF NOT EXISTS orders (
  order_id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  product TEXT,
  amount INTEGER,
  order_date TEXT
);
INSERT INTO orders VALUES (101, 1, 'Laptop', 1200, '2024-01-15');
INSERT INTO orders VALUES (102, 2, 'Phone', 800, '2024-01-16');
INSERT INTO orders VALUES (103, 1, 'Tablet', 500, '2024-01-18');
INSERT INTO orders VALUES (104, 3, 'Laptop', 1200, '2024-02-01');
INSERT INTO orders VALUES (105, 2, 'Monitor', 350, '2024-02-05');
INSERT INTO orders VALUES (106, 4, 'Phone', 800, '2024-02-10');
INSERT INTO orders VALUES (107, 1, 'Keyboard', 120, '2024-03-01');
INSERT INTO orders VALUES (108, 5, 'Laptop', 1200, '2024-03-15');

CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY,
  name TEXT,
  city TEXT,
  signup_date TEXT
);
INSERT INTO customers VALUES (1, 'Acme Corp', 'New York', '2023-01-10');
INSERT INTO customers VALUES (2, 'GlobalTech', 'London', '2023-03-22');
INSERT INTO customers VALUES (3, 'StartupXYZ', 'Berlin', '2023-06-15');
INSERT INTO customers VALUES (4, 'MegaStore', 'Tokyo', '2023-08-01');
INSERT INTO customers VALUES (5, 'DataFlow', 'Paris', '2023-11-20');
INSERT INTO customers VALUES (6, 'CloudNine', 'Sydney', '2024-01-05');

CREATE TABLE IF NOT EXISTS user_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  event TEXT,
  event_date TEXT,
  signup_date TEXT
);
INSERT INTO user_events (user_id, event, event_date, signup_date) VALUES (1, 'login', '2024-03-15', '2024-01-10');
INSERT INTO user_events (user_id, event, event_date, signup_date) VALUES (1, 'purchase', '2024-03-18', '2024-01-10');
INSERT INTO user_events (user_id, event, event_date, signup_date) VALUES (2, 'login', '2024-02-20', '2023-11-05');
INSERT INTO user_events (user_id, event, event_date, signup_date) VALUES (2, 'login', '2024-04-01', '2023-11-05');
INSERT INTO user_events (user_id, event, event_date, signup_date) VALUES (3, 'purchase', '2024-01-25', '2024-01-20');
INSERT INTO user_events (user_id, event, event_date, signup_date) VALUES (3, 'login', '2024-05-10', '2024-01-20');

CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  city TEXT
);
INSERT INTO contacts VALUES (1, 'Alice Smith', 'alice.smith@acme.com', '  New York  ');
INSERT INTO contacts VALUES (2, 'Bob Jones', 'bob.jones@globaltech.co.uk', 'london');
INSERT INTO contacts VALUES (3, 'Carol White', 'carol@startup.io', 'BERLIN');
INSERT INTO contacts VALUES (4, 'Dave Brown-Lee', 'dave.brown@mega.store', 'Tokyo');
INSERT INTO contacts VALUES (5, 'Eve OConnor', 'eve@dataflow.paris', 'san francisco');

CREATE TABLE IF NOT EXISTS measurements (
  id INTEGER PRIMARY KEY,
  sensor TEXT,
  reading REAL,
  offset_val REAL
);
INSERT INTO measurements VALUES (1, 'Temp-A', 23.6789, -4.5);
INSERT INTO measurements VALUES (2, 'Temp-B', 18.1234, 3.2);
INSERT INTO measurements VALUES (3, 'Pressure', 101.325, -0.8);
INSERT INTO measurements VALUES (4, 'Humidity', 67.891, 12.0);
INSERT INTO measurements VALUES (5, 'Temp-C', 42.5678, -7.3);

CREATE TABLE IF NOT EXISTS users (
  user_id INTEGER PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  signup_date TEXT,
  origin_city TEXT
);
INSERT INTO users VALUES (1, 'Aarav', 'Shah', 'aarav.shah@rapido.in', '2022-01-15', 'Mumbai');
INSERT INTO users VALUES (2, 'Priya', 'Mehta', 'priya.mehta@gmail.com', '2022-03-20', 'Delhi');
INSERT INTO users VALUES (3, 'Ravi', 'Kumar', 'ravi.kumar@gmail.com', '2022-05-10', 'Bangalore');
INSERT INTO users VALUES (4, 'Sneha', 'Patel', 'sneha.patel@yahoo.in', '2022-07-08', 'Ahmedabad');
INSERT INTO users VALUES (5, 'Arjun', 'Nair', 'arjun.nair@gmail.com', '2023-01-12', 'Kochi');
INSERT INTO users VALUES (6, 'Divya', 'Iyer', 'divya.iyer@rapido.in', '2023-03-25', 'Chennai');
INSERT INTO users VALUES (7, 'Karan', 'Singh', 'karan.singh@yahoo.in', '2023-06-18', 'Delhi');
INSERT INTO users VALUES (8, 'Meera', 'Joshi', 'meera.joshi@gmail.com', '2023-09-05', 'Mumbai');

CREATE TABLE IF NOT EXISTS rides (
  ride_id INTEGER PRIMARY KEY,
  user_id INTEGER,
  start_time TEXT,
  end_time TEXT,
  start_location TEXT,
  end_location TEXT,
  distance_km REAL,
  vehicle_type TEXT,
  captain_rating REAL
);
INSERT INTO rides VALUES (101, 1, '2024-01-10 08:30', '2024-01-10 08:52', 'Andheri', 'Bandra', 8.5, 'Bike', 4.8);
INSERT INTO rides VALUES (102, 2, '2024-01-10 09:00', '2024-01-10 09:35', 'CP', 'Lajpat Nagar', 12.3, 'Auto', 4.5);
INSERT INTO rides VALUES (103, 3, '2024-01-11 10:15', '2024-01-11 10:45', 'Indiranagar', 'Whitefield', 15.7, 'Cab', 4.9);
INSERT INTO rides VALUES (104, 1, '2024-01-12 18:00', '2024-01-12 18:20', 'Bandra', 'Andheri', 7.2, 'Bike', 4.7);
INSERT INTO rides VALUES (105, 4, '2024-01-13 07:45', '2024-01-13 08:10', 'Navrangpura', 'Vastrapur', 6.8, 'Auto', 4.6);
INSERT INTO rides VALUES (106, 5, '2024-01-14 11:30', '2024-01-14 12:00', 'MG Road', 'Fort Kochi', 9.1, 'Cab', 4.4);
INSERT INTO rides VALUES (107, 2, '2024-01-15 17:00', '2024-01-15 17:30', 'Karol Bagh', 'Dwarka', 18.4, 'Auto', 4.2);
INSERT INTO rides VALUES (108, 6, '2024-01-16 09:00', '2024-01-16 09:25', 'Anna Nagar', 'T Nagar', 11.2, 'Bike', NULL);
`;

async function getDb(): Promise<any> {
  if (db) return db;
  if (initError) throw new Error(initError);
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // Dynamic import — only loaded when the user actually clicks "Run"
      const initSqlJs = (await import('sql.js')).default;
      const SQL = await initSqlJs({
        locateFile: () => `https://sql.js.org/dist/sql-wasm.wasm`,
      });
      db = new SQL.Database();
      db.run(SEED_SQL);
      return db;
    } catch (e: any) {
      initError = `Failed to load SQL engine: ${e?.message || e}`;
      initPromise = null;
      throw new Error(initError);
    }
  })();

  return initPromise;
}

export interface ExecResult {
  columns: string[];
  rows: (string | number | null)[][];
}

export async function runQuery(sql: string): Promise<ExecResult> {
  const database = await getDb();
  const results = database.exec(sql);
  if (results.length === 0) {
    return { columns: [], rows: [] };
  }
  const first = results[0];
  return {
    columns: first.columns,
    rows: first.values as (string | number | null)[][],
  };
}

export function getAvailableTables(): string[] {
  return ['users', 'rides', 'employees', 'departments', 'orders', 'customers', 'user_events', 'contacts', 'measurements'];
}

export interface ExecutionStep {
  phase: string;
  description: string;
  sql: string;
  result: ExecResult;
}

export async function explainStepByStep(sql: string): Promise<ExecutionStep[]> {
  const database = await getDb();
  const steps: ExecutionStep[] = [];

  const safeExec = (query: string): ExecResult => {
    try {
      const r = database.exec(query);
      if (r.length === 0) return { columns: [], rows: [] };
      return { columns: r[0].columns, rows: r[0].values as (string | number | null)[][] };
    } catch {
      return { columns: ['error'], rows: [['Could not execute this intermediate step']] };
    }
  };

  const tablePart = sql.match(/FROM\s+([\s\S]*?)(?:\s+WHERE\s+|\s+GROUP\s+BY\s+|\s+HAVING\s+|\s+ORDER\s+BY\s+|\s+LIMIT\s+|;|$)/i);
  const wherePart = sql.match(/WHERE\s+([\s\S]*?)(?:\s+GROUP\s+BY\s+|\s+HAVING\s+|\s+ORDER\s+BY\s+|\s+LIMIT\s+|;|$)/i);
  const groupByPart = sql.match(/GROUP\s+BY\s+([\s\S]*?)(?:\s+HAVING\s+|\s+ORDER\s+BY\s+|\s+LIMIT\s+|;|$)/i);
  const havingPart = sql.match(/HAVING\s+([\s\S]*?)(?:\s+ORDER\s+BY\s+|\s+LIMIT\s+|;|$)/i);
  const orderByPart = sql.match(/ORDER\s+BY\s+([\s\S]*?)(?:\s+LIMIT\s+|;|$)/i);
  const limitPart = sql.match(/LIMIT\s+([\s\S]*?)(?:;|$)/i);
  const selectPart = sql.match(/SELECT\s+([\s\S]*?)\s+FROM/i);

  if (!tablePart) {
    steps.push({ phase: '✓ Result', description: 'Query executed', sql, result: safeExec(sql) });
    return steps;
  }

  const fromExpr = tablePart[1].trim();

  // ① FROM
  const fromSql = `SELECT * FROM ${fromExpr} LIMIT 50`;
  steps.push({ phase: '① FROM', description: `Load rows from ${fromExpr}`, sql: fromSql, result: safeExec(fromSql) });

  // ② WHERE
  if (wherePart) {
    const w = wherePart[1].trim();
    const whereSql = `SELECT * FROM ${fromExpr} WHERE ${w} LIMIT 50`;
    steps.push({ phase: '② WHERE', description: `Filter: ${w}`, sql: whereSql, result: safeExec(whereSql) });
  }

  // ③ GROUP BY
  if (groupByPart && selectPart) {
    const g = groupByPart[1].trim();
    const sel = selectPart[1].trim();
    const groupSql = `SELECT ${sel} FROM ${fromExpr}${wherePart ? ` WHERE ${wherePart[1].trim()}` : ''} GROUP BY ${g} LIMIT 50`;
    steps.push({ phase: '③ GROUP BY', description: `Group by: ${g}`, sql: groupSql, result: safeExec(groupSql) });
  }

  // ④ HAVING
  if (havingPart && selectPart && groupByPart) {
    const h = havingPart[1].trim();
    const sel = selectPart[1].trim();
    const g = groupByPart[1].trim();
    const havingSql = `SELECT ${sel} FROM ${fromExpr}${wherePart ? ` WHERE ${wherePart[1].trim()}` : ''} GROUP BY ${g} HAVING ${h} LIMIT 50`;
    steps.push({ phase: '④ HAVING', description: `Filter groups: ${h}`, sql: havingSql, result: safeExec(havingSql) });
  }

  // ⑤ SELECT (projection — only shown when there's no GROUP BY, since GROUP BY step already includes SELECT)
  if (selectPart && !groupByPart) {
    const sel = selectPart[1].trim();
    const projSql = `SELECT ${sel} FROM ${fromExpr}${wherePart ? ` WHERE ${wherePart[1].trim()}` : ''} LIMIT 50`;
    steps.push({ phase: '③ SELECT', description: `Project: ${sel}`, sql: projSql, result: safeExec(projSql) });
  }

  // ⑥ ORDER BY
  if (orderByPart && selectPart) {
    const o = orderByPart[1].trim();
    const sel = selectPart[1].trim();
    let orderSql = `SELECT ${sel} FROM ${fromExpr}`;
    if (wherePart) orderSql += ` WHERE ${wherePart[1].trim()}`;
    if (groupByPart) orderSql += ` GROUP BY ${groupByPart[1].trim()}`;
    if (havingPart) orderSql += ` HAVING ${havingPart[1].trim()}`;
    orderSql += ` ORDER BY ${o} LIMIT 50`;
    steps.push({ phase: groupByPart ? '⑤ ORDER BY' : '④ ORDER BY', description: `Sort: ${o}`, sql: orderSql, result: safeExec(orderSql) });
  }

  // ⑦ LIMIT
  if (limitPart) {
    steps.push({ phase: 'LIMIT', description: `Limit: ${limitPart[1].trim()}`, sql, result: safeExec(sql) });
  }

  // ✓ Final
  steps.push({ phase: '✓ Final Result', description: 'Complete query output', sql, result: safeExec(sql) });

  return steps;
}
