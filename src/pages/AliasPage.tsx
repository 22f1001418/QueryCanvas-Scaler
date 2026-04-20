import { MacWindow } from '../components/MacWindow';
import { SqlTable } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { employees } from '../data/sampleData';
import { QueryPlayground } from '../components/QueryPlayground';
import { motion } from 'framer-motion';

const steps = [
  {
    sql: `SELECT name AS employee_name,\n       salary AS annual_pay\nFROM employees;`,
    desc: 'Column alias — rename output columns',
    detail: 'AS renames a column in the result set. "name AS employee_name" makes the output header read "employee_name" instead of "name". The original table is unchanged.',
    result: {
      columns: ['employee_name', 'annual_pay'],
      rows: [
        ['Alice', 95000], ['Bob', 88000], ['Carol', 72000], ['Dave', 68000],
        ['Eve', 78000], ['Frank', 65000], ['Grace', 102000], ['Hank', 71000],
      ],
    },
  },
  {
    sql: `SELECT name,\n       salary * 1.1 AS salary_with_raise\nFROM employees;`,
    desc: 'Expression alias — name a computed value',
    detail: 'Aliases are essential for computed columns. Without AS, the column header would show the raw expression "salary * 1.1". With AS, you give it a readable name.',
    result: {
      columns: ['name', 'salary_with_raise'],
      rows: [
        ['Alice', 104500], ['Bob', 96800], ['Carol', 79200], ['Dave', 74800],
        ['Eve', 85800], ['Frank', 71500], ['Grace', 112200], ['Hank', 78100],
      ],
    },
  },
  {
    sql: `SELECT e.name,\n       e.department,\n       e.salary\nFROM employees AS e\nWHERE e.salary > 80000;`,
    desc: 'Table alias — shorten table references',
    detail: 'Tables can also be aliased. "employees AS e" lets you write "e.column" instead of "employees.column". Table aliases become critical with JOINs where you reference multiple tables.',
    result: {
      columns: ['name', 'department', 'salary'],
      rows: [
        ['Alice', 'Engineering', 95000],
        ['Bob', 'Engineering', 88000],
        ['Eve', 'Sales', 78000],
        ['Grace', 'Engineering', 102000],
      ],
    },
  },
  {
    sql: `SELECT name,\n       salary,\n       salary - 70000 AS above_base\nFROM employees\nORDER BY above_base DESC;`,
    desc: 'Alias in ORDER BY',
    detail: 'You can reference a column alias in ORDER BY (but not in WHERE — that runs before SELECT). Here "above_base" is used to sort, making the query much easier to read than repeating the expression.',
    result: {
      columns: ['name', 'salary', 'above_base'],
      rows: [
        ['Grace', 102000, 32000],
        ['Alice', 95000, 25000],
        ['Bob', 88000, 18000],
        ['Eve', 78000, 8000],
        ['Carol', 72000, 2000],
        ['Hank', 71000, 1000],
        ['Dave', 68000, -2000],
        ['Frank', 65000, -5000],
      ],
    },
  },
];

export function AliasPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 2500);
  const current = steps[step];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Alias (AS)</h1>
        <p className="text-sm text-text-secondary mt-1">
          AS assigns a temporary name to a column or table within a query. Column aliases rename output
          headers and are required when selecting computed expressions. Table aliases shorten long table
          names and are essential when joining multiple tables.
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
            <SqlTable table={employees} visibleColumns={[1, 3]} />
          </div>
        </MacWindow>
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <MacWindow title="Result — with aliases applied">
          <div className="p-3">
            <SqlTable
              table={{ name: 'result', columns: current.result.columns, rows: current.result.rows }}
              animateRows
            />
          </div>
        </MacWindow>
      </motion.div>

      <div className="mt-8 pt-6 border-t border-border">
        <QueryPlayground
          initialQuery="SELECT name AS employee, department AS dept, salary * 1.1 AS new_salary FROM employees;"
          description="Practice using AS. Try renaming columns, aliasing computed expressions, and using a table alias in the FROM clause."
        />
      </div>
    </div>
  );
}
