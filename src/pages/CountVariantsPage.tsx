import { useMemo } from 'react';
import { MacWindow } from '../components/MacWindow';
import { SqlTable, CellStyle } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { employees } from '../data/sampleData';
import { QueryPlayground } from '../components/QueryPlayground';
import { motion } from 'framer-motion';

// employees manager_id: null,1,null,3,null,5,1,null
// non-null manager_ids: 1,3,5,1  → COUNT(manager_id)=4, COUNT(DISTINCT manager_id)=3

const steps = [
  {
    sql: `SELECT COUNT(*) AS total\nFROM employees;`,
    desc: 'COUNT(*) — every row, no exceptions',
    detail: 'COUNT(*) counts all rows in the table including those with NULL values in every column. The * means "the whole row" — not any specific column. Result: 8.',
    highlightStyle: 'all' as const,
    result: { columns: ['variant', 'result', 'counts_nulls'], rows: [['COUNT(*)', 8, 'yes']] },
    badge: '8 rows counted',
  },
  {
    sql: `SELECT COUNT(1) AS total\nFROM employees;`,
    desc: 'COUNT(1) — same as COUNT(*)',
    detail: 'COUNT(1) counts rows by evaluating the literal 1 for each row — the literal is never NULL, so every row is counted. It produces the exact same result as COUNT(*). Use COUNT(*) for clarity.',
    highlightStyle: 'all' as const,
    result: { columns: ['variant', 'result', 'counts_nulls'], rows: [['COUNT(1)', 8, 'yes']] },
    badge: '8 rows counted',
  },
  {
    sql: `SELECT COUNT(manager_id) AS total\nFROM employees;`,
    desc: 'COUNT(col) — skips NULL values',
    detail: 'COUNT(column) counts only rows where that column is NOT NULL. Four employees have no manager (NULL), so they are excluded. Result: 4. This is how COUNT tells you "how many rows have a value here."',
    highlightStyle: 'col' as const,
    result: { columns: ['variant', 'result', 'counts_nulls'], rows: [['COUNT(manager_id)', 4, 'no — skips NULLs']] },
    badge: '4 non-NULL rows',
  },
  {
    sql: `SELECT COUNT(DISTINCT manager_id)\n  AS total\nFROM employees;`,
    desc: 'COUNT(DISTINCT col) — unique non-NULL values',
    detail: 'COUNT(DISTINCT col) counts unique non-NULL values. The non-null manager_ids are 1, 3, 5, 1 — after deduplication that is 3 distinct managers. NULLs are always excluded from DISTINCT counts.',
    highlightStyle: 'distinct' as const,
    result: { columns: ['variant', 'result', 'counts_nulls'], rows: [['COUNT(DISTINCT manager_id)', 3, 'no — skips NULLs & dupes']] },
    badge: '3 distinct managers',
  },
  {
    sql: `SELECT\n  COUNT(*)                    AS count_star,\n  COUNT(1)                    AS count_one,\n  COUNT(manager_id)           AS count_col,\n  COUNT(DISTINCT manager_id)  AS count_distinct\nFROM employees;`,
    desc: 'Side-by-side comparison',
    detail: 'All four variants together. COUNT(*) = COUNT(1) = 8 (all rows). COUNT(manager_id) = 4 (non-NULLs only). COUNT(DISTINCT manager_id) = 3 (unique non-NULLs). Memorise this progression.',
    highlightStyle: 'all' as const,
    result: {
      columns: ['count_star', 'count_one', 'count_col', 'count_distinct'],
      rows: [[8, 8, 4, 3]],
    },
    badge: 'all four at once',
  },
];

export function CountVariantsPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 2500);
  const current = steps[step];

  const cellStyles = useMemo(() => {
    const styles: Record<string, CellStyle> = {};
    employees.rows.forEach((row, ri) => {
      if (current.highlightStyle === 'all') {
        employees.columns.forEach((_, ci) => { styles[`${ri}-${ci}`] = 'selected'; });
      } else if (current.highlightStyle === 'col') {
        const isNull = row[5] === null;
        employees.columns.forEach((_, ci) => {
          styles[`${ri}-${ci}`] = isNull ? 'removed' : (ci === 5 ? 'selected' : 'new');
        });
      } else if (current.highlightStyle === 'distinct') {
        const mgr = row[5];
        const seen = new Set([1, 3, 5]);
        employees.columns.forEach((_, ci) => {
          if (mgr === null) styles[`${ri}-${ci}`] = 'removed';
          else if (ci === 5) styles[`${ri}-${ci}`] = seen.has(mgr as number) ? 'selected' : 'highlight';
          else styles[`${ri}-${ci}`] = 'new';
        });
      }
    });
    return styles;
  }, [step]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">COUNT Variants</h1>
        <p className="text-sm text-text-secondary mt-1">
          COUNT has four forms that behave differently around NULLs and duplicates.
          Understanding the difference between COUNT(*), COUNT(1), COUNT(col), and
          COUNT(DISTINCT col) is essential for writing correct aggregate queries.
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

        <MacWindow title="employees — manager_id has NULLs" compact>
          <div className="p-3">
            <SqlTable table={employees} cellStyles={cellStyles} />
          </div>
        </MacWindow>
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <MacWindow title="Result">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-accent">{current.badge}</span>
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
          initialQuery={`SELECT\n  COUNT(*)                   AS count_star,\n  COUNT(1)                   AS count_one,\n  COUNT(manager_id)          AS count_col,\n  COUNT(DISTINCT manager_id) AS count_distinct\nFROM employees;`}
          description="Run the side-by-side query and verify the numbers. Then try the same four variants on orders.customer_id to see how COUNT(DISTINCT) reveals unique customers."
        />
      </div>
    </div>
  );
}
