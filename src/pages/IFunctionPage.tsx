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
    sql: `-- MySQL / MariaDB syntax\nSELECT name, salary,\n  IF(salary >= 80000,\n     'High',\n     'Standard'\n  ) AS pay_band\nFROM employees;`,
    desc: 'IF() — three-argument conditional',
    detail: 'IF(condition, true_value, false_value) returns the second argument when the condition is true, and the third when false. It is available in MySQL and MariaDB. SQLite uses IIF() with the same signature.',
    result: {
      columns: ['name', 'salary', 'pay_band'],
      rows: [
        ['Alice', 95000, 'High'], ['Bob', 88000, 'High'], ['Carol', 72000, 'Standard'],
        ['Dave', 68000, 'Standard'], ['Eve', 78000, 'Standard'], ['Frank', 65000, 'Standard'],
        ['Grace', 102000, 'High'], ['Hank', 71000, 'Standard'],
      ],
    },
  },
  {
    sql: `-- SQLite equivalent: IIF()\nSELECT name, salary,\n  IIF(salary >= 80000,\n      'High',\n      'Standard'\n  ) AS pay_band\nFROM employees;`,
    desc: 'IIF() — SQLite / SQL Server equivalent',
    detail: 'IIF(condition, true_value, false_value) is identical in behaviour to IF() but is the syntax used by SQLite (3.32+) and SQL Server. PostgreSQL has neither — use CASE WHEN there.',
    result: {
      columns: ['name', 'salary', 'pay_band'],
      rows: [
        ['Alice', 95000, 'High'], ['Bob', 88000, 'High'], ['Carol', 72000, 'Standard'],
        ['Dave', 68000, 'Standard'], ['Eve', 78000, 'Standard'], ['Frank', 65000, 'Standard'],
        ['Grace', 102000, 'High'], ['Hank', 71000, 'Standard'],
      ],
    },
  },
  {
    sql: `-- IF() vs CASE WHEN — same result\nSELECT name,\n  IF(manager_id IS NULL,\n     'Lead', 'Member') AS role,\n  CASE\n    WHEN manager_id IS NULL THEN 'Lead'\n    ELSE 'Member'\n  END AS role_case\nFROM employees;`,
    desc: 'IF() vs CASE WHEN — same output',
    detail: 'For a single binary condition IF() is more concise than CASE WHEN. Both produce identical results. Use CASE WHEN when you have three or more branches — IF() does not chain as cleanly.',
    result: {
      columns: ['name', 'role', 'role_case'],
      rows: [
        ['Alice', 'Lead', 'Lead'], ['Bob', 'Member', 'Member'],
        ['Carol', 'Lead', 'Lead'], ['Dave', 'Member', 'Member'],
        ['Eve', 'Lead', 'Lead'], ['Frank', 'Member', 'Member'],
        ['Grace', 'Member', 'Member'], ['Hank', 'Lead', 'Lead'],
      ],
    },
  },
  {
    sql: `-- Nested IF() — avoid this; use CASE WHEN\nSELECT name, salary,\n  IF(salary >= 90000, 'Senior',\n    IF(salary >= 70000, 'Mid',\n       'Junior'\n    )\n  ) AS level\nFROM employees;`,
    desc: 'Nested IF() — works but gets messy',
    detail: 'IF() can be nested to handle multiple branches, but readability degrades quickly. For three or more conditions always prefer CASE WHEN — it is cleaner, portable across all SQL dialects, and easier to maintain.',
    result: {
      columns: ['name', 'salary', 'level'],
      rows: [
        ['Alice', 95000, 'Senior'], ['Bob', 88000, 'Senior'], ['Carol', 72000, 'Mid'],
        ['Dave', 68000, 'Junior'], ['Eve', 78000, 'Mid'], ['Frank', 65000, 'Junior'],
        ['Grace', 102000, 'Senior'], ['Hank', 71000, 'Mid'],
      ],
    },
  },
];

const dialectNote = [
  { dialect: 'MySQL / MariaDB', syntax: 'IF(cond, a, b)' },
  { dialect: 'SQLite', syntax: 'IIF(cond, a, b)' },
  { dialect: 'SQL Server', syntax: 'IIF(cond, a, b)' },
  { dialect: 'PostgreSQL', syntax: 'CASE WHEN cond THEN a ELSE b END' },
];

export function IFunctionPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 2500);
  const current = steps[step];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">IF() Function</h1>
        <p className="text-sm text-text-secondary mt-1">
          IF(condition, true_value, false_value) is a compact alternative to CASE WHEN for binary
          conditions. MySQL uses IF(); SQLite and SQL Server use IIF(). PostgreSQL has neither —
          always use CASE WHEN for cross-dialect compatibility.
        </p>
      </div>

      {/* Dialect reference strip */}
      <div className="flex flex-wrap gap-2">
        {dialectNote.map(({ dialect, syntax }) => (
          <div key={dialect} className="text-xs bg-surface-2 border border-border rounded-mac px-3 py-1.5">
            <span className="text-text-secondary">{dialect}: </span>
            <code className="text-text-primary font-mono">{syntax}</code>
          </div>
        ))}
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
            <SqlTable table={employees} visibleColumns={[1, 3, 5]} />
          </div>
        </MacWindow>
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <MacWindow title="Result">
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
          initialQuery={`-- IIF() runs in this SQLite playground\nSELECT name, salary,\n  IIF(salary >= 80000, 'High', 'Standard') AS pay_band\nFROM employees;`}
          description="IIF() is the SQLite equivalent of MySQL's IF(). Try it with different conditions — manager_id IS NULL, department = 'Engineering', etc."
        />
      </div>
    </div>
  );
}
