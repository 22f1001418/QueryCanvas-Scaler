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
    sql: `-- Each row is a separate employee\nSELECT department, name\nFROM employees\nORDER BY department;`,
    desc: 'The problem — one row per employee',
    detail: 'A plain SELECT returns one row per employee. If you want to see all names in a department on a single line — e.g. for a report or API response — you need GROUP_CONCAT.',
    result: {
      columns: ['department', 'name'],
      rows: [
        ['Engineering', 'Alice'], ['Engineering', 'Bob'], ['Engineering', 'Grace'],
        ['HR', 'Hank'],
        ['Marketing', 'Carol'], ['Marketing', 'Dave'],
        ['Sales', 'Eve'], ['Sales', 'Frank'],
      ],
    },
  },
  {
    sql: `SELECT department,\n  GROUP_CONCAT(name) AS members\nFROM employees\nGROUP BY department;`,
    desc: 'GROUP_CONCAT — collapse rows into a list',
    detail: 'GROUP_CONCAT aggregates all values in a group into a single comma-separated string. Each department now appears on one row with all its member names joined together.',
    result: {
      columns: ['department', 'members'],
      rows: [
        ['Engineering', 'Alice,Bob,Grace'],
        ['HR', 'Hank'],
        ['Marketing', 'Carol,Dave'],
        ['Sales', 'Eve,Frank'],
      ],
    },
  },
  {
    sql: `SELECT department,\n  GROUP_CONCAT(name, ' | ') AS members\nFROM employees\nGROUP BY department;`,
    desc: 'Custom separator',
    detail: 'The second argument to GROUP_CONCAT sets the separator. Here " | " makes the output more readable than the default comma. You can use any string — ", ", " / ", " → ", etc.',
    result: {
      columns: ['department', 'members'],
      rows: [
        ['Engineering', 'Alice | Bob | Grace'],
        ['HR', 'Hank'],
        ['Marketing', 'Carol | Dave'],
        ['Sales', 'Eve | Frank'],
      ],
    },
  },
  {
    sql: `SELECT department,\n  COUNT(*)           AS headcount,\n  GROUP_CONCAT(name, ', ')\n                     AS members\nFROM employees\nGROUP BY department\nORDER BY headcount DESC;`,
    desc: 'Combined with COUNT — headcount + member list',
    detail: 'GROUP_CONCAT pairs naturally with other aggregates. Here each row shows the department headcount and the full member list, sorted by team size. This is a common reporting pattern.',
    result: {
      columns: ['department', 'headcount', 'members'],
      rows: [
        ['Engineering', 3, 'Alice, Bob, Grace'],
        ['Marketing', 2, 'Carol, Dave'],
        ['Sales', 2, 'Eve, Frank'],
        ['HR', 1, 'Hank'],
      ],
    },
  },
];

export function GroupConcatPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 2500);
  const current = steps[step];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">GROUP_CONCAT</h1>
        <p className="text-sm text-text-secondary mt-1">
          GROUP_CONCAT is an aggregate function that collapses multiple rows into a single
          comma-separated string. It is available in SQLite and MySQL. PostgreSQL uses
          STRING_AGG(column, separator) for the same result.
        </p>
      </div>

      <div className="px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-mac">
        <p className="text-xs text-blue-600 dark:text-blue-400">
          <strong>Dialect note:</strong> GROUP_CONCAT is SQLite / MySQL syntax. In PostgreSQL use <code>STRING_AGG(column, ',')</code> instead. The playground below runs SQLite so GROUP_CONCAT works directly.
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
            <SqlTable table={employees} visibleColumns={[1, 2]} />
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
          initialQuery={`SELECT department,\n  COUNT(*) AS headcount,\n  GROUP_CONCAT(name, ', ') AS members\nFROM employees\nGROUP BY department\nORDER BY headcount DESC;`}
          description="GROUP_CONCAT is fully supported here. Try it on other tables — GROUP_CONCAT(product, ', ') from orders grouped by customer_id, or GROUP_CONCAT(city) from customers."
        />
      </div>
    </div>
  );
}
