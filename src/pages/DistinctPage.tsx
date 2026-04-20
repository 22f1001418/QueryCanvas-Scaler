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
    sql: `SELECT department\nFROM employees;`,
    desc: 'Without DISTINCT — duplicates included',
    detail: 'A plain SELECT returns every row, including duplicates. With 8 employees across 4 departments, "Engineering" appears 3 times and "Sales" appears twice.',
    result: {
      columns: ['department'],
      rows: [
        ['Engineering'], ['Engineering'], ['Marketing'],
        ['Marketing'], ['Sales'], ['Sales'],
        ['Engineering'], ['HR'],
      ],
    },
    badge: '8 rows',
  },
  {
    sql: `SELECT DISTINCT department\nFROM employees;`,
    desc: 'DISTINCT — unique values only',
    detail: 'DISTINCT removes duplicate rows from the result. Each department appears exactly once, reducing 8 rows to 4. The order is not guaranteed without ORDER BY.',
    result: {
      columns: ['department'],
      rows: [['Engineering'], ['Marketing'], ['Sales'], ['HR']],
    },
    badge: '4 rows',
  },
  {
    sql: `SELECT DISTINCT department,\n       manager_id IS NULL AS is_lead\nFROM employees;`,
    desc: 'DISTINCT on multiple columns',
    detail: 'DISTINCT applies to the entire row — all selected columns together. Here we get unique (department, is_lead) combinations. A department can appear twice if it has both leads and non-leads.',
    result: {
      columns: ['department', 'is_lead'],
      rows: [
        ['Engineering', 1], ['Engineering', 0],
        ['Marketing', 1], ['Marketing', 0],
        ['Sales', 1], ['Sales', 0],
        ['HR', 1],
      ],
    },
    badge: '7 rows',
  },
  {
    sql: `SELECT\n  COUNT(*)           AS total_employees,\n  COUNT(DISTINCT department)\n                     AS unique_depts\nFROM employees;`,
    desc: 'COUNT(DISTINCT ...) — count unique values',
    detail: 'DISTINCT can be used inside aggregate functions. COUNT(DISTINCT department) counts how many unique departments exist, regardless of how many employees are in each.',
    result: {
      columns: ['total_employees', 'unique_depts'],
      rows: [[8, 4]],
    },
    badge: '1 row',
  },
];

export function DistinctPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 2500);
  const current = steps[step];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">DISTINCT</h1>
        <p className="text-sm text-text-secondary mt-1">
          DISTINCT eliminates duplicate rows from query results. It applies to the full combination of
          selected columns — not just one. It can also be used inside aggregate functions like
          COUNT(DISTINCT ...) to count unique values.
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
            <SqlTable table={employees} visibleColumns={[1, 2, 5]} />
          </div>
        </MacWindow>
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <MacWindow title="Result">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-info">{current.badge}</span>
            </div>
            <SqlTable
              table={{ name: 'result', columns: current.result.columns, rows: current.result.rows }}
              animateRows
            />
          </div>
        </MacWindow>
      </motion.div>

      <div className="mt-8 pt-6 border-t border-border">
        <QueryPlayground
          initialQuery="SELECT DISTINCT department FROM employees ORDER BY department;"
          description="Try DISTINCT on different columns — city from customers, product from orders. Also try COUNT(DISTINCT ...) inside an aggregate."
        />
      </div>
    </div>
  );
}
