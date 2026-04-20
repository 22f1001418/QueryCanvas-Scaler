import { useMemo } from 'react';
import { MacWindow } from '../components/MacWindow';
import { SqlTable, CellStyle } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { employees } from '../data/sampleData';
import { QueryPlayground } from '../components/QueryPlayground';
import { motion } from 'framer-motion';

// employees: manager_id is null for Alice(0), Carol(2), Eve(4), Hank(7)
// name col=1, dept col=2, salary col=3, manager_id col=5

const steps = [
  {
    sql: `SELECT name, manager_id\nFROM employees\nWHERE manager_id IS NULL;`,
    desc: 'IS NULL — find rows with no manager',
    detail: 'IS NULL matches rows where a column has no value. Four employees have no manager_id — they are team leads. You cannot use = NULL; only IS NULL works correctly for missing values.',
    test: (row: (string | number | null)[]) => row[5] === null,
    highlightCol: 5,
    resultCols: [1, 5],
  },
  {
    sql: `SELECT name, manager_id\nFROM employees\nWHERE manager_id IS NOT NULL;`,
    desc: 'IS NOT NULL — find rows that have a value',
    detail: 'IS NOT NULL is the inverse — it matches only rows where the column has a real value. These four employees each report to a manager.',
    test: (row: (string | number | null)[]) => row[5] !== null,
    highlightCol: 5,
    resultCols: [1, 5],
  },
  {
    sql: `-- Whitespace in names (exaggerated for demo)\nSELECT name,\n       TRIM(name)  AS trimmed_name\nFROM employees;`,
    desc: 'TRIM() — remove leading & trailing whitespace',
    detail: 'TRIM() strips spaces from both ends of a string. LTRIM() removes only leading spaces; RTRIM() removes only trailing. Essential when data comes from user input or CSV imports.',
    test: () => true,
    highlightCol: 1,
    resultCols: [1],
    isStaticResult: true,
    staticResult: {
      columns: ['name', 'trimmed_name'],
      rows: [
        ['Alice', 'Alice'], ['Bob', 'Bob'], ['Carol', 'Carol'],
        ['Dave', 'Dave'], ['Eve', 'Eve'], ['Frank', 'Frank'],
        ['Grace', 'Grace'], ['Hank', 'Hank'],
      ],
    },
  },
  {
    sql: `SELECT name,\n  COALESCE(manager_id, 0)\n    AS manager_id\nFROM employees;`,
    desc: 'COALESCE() — replace NULL with a fallback',
    detail: 'COALESCE(a, b, c, ...) returns the first non-NULL value in the list. Here NULLs become 0, signalling "no manager". You can chain multiple fallbacks: COALESCE(col1, col2, \'default\').',
    test: () => true,
    highlightCol: 5,
    resultCols: [1, 5],
    isStaticResult: true,
    staticResult: {
      columns: ['name', 'manager_id'],
      rows: [
        ['Alice', 0], ['Bob', 1], ['Carol', 0], ['Dave', 3],
        ['Eve', 0], ['Frank', 5], ['Grace', 1], ['Hank', 0],
      ],
    },
  },
  {
    sql: `SELECT name,\n  IFNULL(manager_id, 0)\n    AS manager_id\nFROM employees;`,
    desc: 'IFNULL() — two-argument null replacement',
    detail: 'IFNULL(value, fallback) is a simpler two-argument version of COALESCE, available in SQLite and MySQL. It returns the fallback only when the first argument is NULL. PostgreSQL uses COALESCE for the same effect.',
    test: () => true,
    highlightCol: 5,
    resultCols: [1, 5],
    isStaticResult: true,
    staticResult: {
      columns: ['name', 'manager_id'],
      rows: [
        ['Alice', 0], ['Bob', 1], ['Carol', 0], ['Dave', 3],
        ['Eve', 0], ['Frank', 5], ['Grace', 1], ['Hank', 0],
      ],
    },
  },
];

export function NullHandlingPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 2500);
  const current = steps[step];

  const matchingRows = useMemo(
    () => employees.rows.map((row, i) => ({ row, i, matches: current.test(row) })),
    [step]
  );

  const cellStyles = useMemo(() => {
    const styles: Record<string, CellStyle> = {};
    if (current.isStaticResult) {
      employees.rows.forEach((_, ri) => {
        styles[`${ri}-${current.highlightCol}`] = 'selected';
      });
    } else {
      matchingRows.forEach(({ i, matches }) => {
        employees.columns.forEach((_, ci) => {
          if (matches) {
            styles[`${i}-${ci}`] = ci === current.highlightCol ? 'selected' : 'new';
          } else {
            styles[`${i}-${ci}`] = 'removed';
          }
        });
      });
    }
    return styles;
  }, [step]);

  const resultRows = matchingRows.filter((r) => r.matches).map((r) => r.i);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">NULL Handling</h1>
        <p className="text-sm text-text-secondary mt-1">
          NULL means the absence of a value — not zero, not an empty string. SQL provides dedicated
          tools to detect NULLs (IS NULL / IS NOT NULL), replace them (COALESCE, IFNULL), and clean
          surrounding whitespace (TRIM). Mishandling NULLs is one of the most common SQL bugs.
        </p>
      </div>

      <AnimationControls
        step={step} maxSteps={steps.length - 1}
        isPlaying={isPlaying} onPlay={play} onPause={pause}
        onReset={reset} onNext={next} onPrev={prev}
        stepLabel={current.desc}
      />

      <div className="p-3 bg-surface-2 rounded-mac border border-border">
        <p className="text-sm text-text-primary">{current.detail}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <MacWindow title="Query" compact>
          <CodeBlock code={current.sql} />
        </MacWindow>

        <MacWindow title="employees — source" compact>
          <div className="p-3">
            <SqlTable table={employees} cellStyles={cellStyles} />
          </div>
        </MacWindow>
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <MacWindow title="Result">
          <div className="p-3">
            {current.isStaticResult ? (
              <SqlTable
                table={{ name: 'result', columns: current.staticResult!.columns, rows: current.staticResult!.rows }}
                animateRows
              />
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge badge-success">{resultRows.length} rows matched</span>
                  <span className="badge badge-warning">{employees.rows.length - resultRows.length} filtered out</span>
                </div>
                <SqlTable
                  table={employees}
                  visibleColumns={current.resultCols}
                  visibleRows={resultRows}
                  animateRows
                />
              </>
            )}
          </div>
        </MacWindow>
      </motion.div>

      <div className="mt-8 pt-6 border-t border-border">
        <QueryPlayground
          initialQuery={`SELECT name,\n  COALESCE(manager_id, 0) AS manager_id\nFROM employees\nWHERE manager_id IS NULL;`}
          description="Try IS NULL / IS NOT NULL in WHERE clauses, COALESCE with multiple fallbacks, IFNULL, and TRIM on string columns."
        />
      </div>
    </div>
  );
}
