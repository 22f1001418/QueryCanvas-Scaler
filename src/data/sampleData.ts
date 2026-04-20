// Sample data tables used across visualizations

export interface TableData {
  name: string;
  columns: string[];
  rows: (string | number | null)[][];
}

export const employees: TableData = {
  name: 'employees',
  columns: ['id', 'name', 'department', 'salary', 'hire_date', 'manager_id'],
  rows: [
    [1, 'Alice', 'Engineering', 95000, '2020-03-15', null],
    [2, 'Bob', 'Engineering', 88000, '2021-06-01', 1],
    [3, 'Carol', 'Marketing', 72000, '2019-11-20', null],
    [4, 'Dave', 'Marketing', 68000, '2022-01-10', 3],
    [5, 'Eve', 'Sales', 78000, '2020-08-05', null],
    [6, 'Frank', 'Sales', 65000, '2023-02-14', 5],
    [7, 'Grace', 'Engineering', 102000, '2018-07-22', 1],
    [8, 'Hank', 'HR', 71000, '2021-09-30', null],
  ],
};

export const users: TableData = {
  name: 'users',
  columns: ['user_id', 'first_name', 'last_name', 'email', 'signup_date', 'origin_city'],
  rows: [
    [1, 'Aarav', 'Shah', 'aarav.shah@rapido.in', '2022-01-15', 'Mumbai'],
    [2, 'Priya', 'Mehta', 'priya.mehta@gmail.com', '2022-03-20', 'Delhi'],
    [3, 'Ravi', 'Kumar', 'ravi.kumar@gmail.com', '2022-05-10', 'Bangalore'],
    [4, 'Sneha', 'Patel', 'sneha.patel@yahoo.in', '2022-07-08', 'Ahmedabad'],
    [5, 'Arjun', 'Nair', 'arjun.nair@gmail.com', '2023-01-12', 'Kochi'],
    [6, 'Divya', 'Iyer', 'divya.iyer@rapido.in', '2023-03-25', 'Chennai'],
    [7, 'Karan', 'Singh', 'karan.singh@yahoo.in', '2023-06-18', 'Delhi'],
    [8, 'Meera', 'Joshi', 'meera.joshi@gmail.com', '2023-09-05', 'Mumbai'],
  ],
};

export const rides: TableData = {
  name: 'rides',
  columns: ['ride_id', 'user_id', 'start_time', 'end_time', 'start_location', 'end_location', 'distance_km', 'vehicle_type', 'captain_rating'],
  rows: [
    [101, 1, '2024-01-10 08:30', '2024-01-10 08:52', 'Andheri', 'Bandra', 8.5, 'Bike', 4.8],
    [102, 2, '2024-01-10 09:00', '2024-01-10 09:35', 'CP', 'Lajpat Nagar', 12.3, 'Auto', 4.5],
    [103, 3, '2024-01-11 10:15', '2024-01-11 10:45', 'Indiranagar', 'Whitefield', 15.7, 'Cab', 4.9],
    [104, 1, '2024-01-12 18:00', '2024-01-12 18:20', 'Bandra', 'Andheri', 7.2, 'Bike', 4.7],
    [105, 4, '2024-01-13 07:45', '2024-01-13 08:10', 'Navrangpura', 'Vastrapur', 6.8, 'Auto', 4.6],
    [106, 5, '2024-01-14 11:30', '2024-01-14 12:00', 'MG Road', 'Fort Kochi', 9.1, 'Cab', 4.4],
    [107, 2, '2024-01-15 17:00', '2024-01-15 17:30', 'Karol Bagh', 'Dwarka', 18.4, 'Auto', 4.2],
    [108, 6, '2024-01-16 09:00', '2024-01-16 09:25', 'Anna Nagar', 'T Nagar', 11.2, 'Bike', null],
  ],
};

export const departments: TableData = {
  name: 'departments',
  columns: ['id', 'dept_name', 'location', 'budget'],
  rows: [
    [1, 'Engineering', 'Building A', 500000],
    [2, 'Marketing', 'Building B', 250000],
    [3, 'Sales', 'Building C', 300000],
    [4, 'HR', 'Building A', 150000],
    [5, 'Finance', 'Building D', 200000],
  ],
};

export const orders: TableData = {
  name: 'orders',
  columns: ['order_id', 'customer_id', 'product', 'amount', 'order_date'],
  rows: [
    [101, 1, 'Laptop', 1200, '2024-01-15'],
    [102, 2, 'Phone', 800, '2024-01-16'],
    [103, 1, 'Tablet', 500, '2024-01-18'],
    [104, 3, 'Laptop', 1200, '2024-02-01'],
    [105, 2, 'Monitor', 350, '2024-02-05'],
    [106, 4, 'Phone', 800, '2024-02-10'],
    [107, 1, 'Keyboard', 120, '2024-03-01'],
    [108, 5, 'Laptop', 1200, '2024-03-15'],
  ],
};

export const customers: TableData = {
  name: 'customers',
  columns: ['id', 'name', 'city', 'signup_date'],
  rows: [
    [1, 'Acme Corp', 'New York', '2023-01-10'],
    [2, 'GlobalTech', 'London', '2023-03-22'],
    [3, 'StartupXYZ', 'Berlin', '2023-06-15'],
    [4, 'MegaStore', 'Tokyo', '2023-08-01'],
    [5, 'DataFlow', 'Paris', '2023-11-20'],
    [6, 'CloudNine', 'Sydney', '2024-01-05'],
  ],
};
