import { MacWindow } from '../components/MacWindow';
import { SqlTable } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { employees } from '../data/sampleData';
import { QueryPlayground } from '../components/QueryPlayground';
import { motion } from 'framer-motion';

// employees by dept:
//   Engineering: Alice 95k, Bob 88k, Grace 102k  → all ≥ 80k
//   Marketing:   Carol 72k, Dave 68k              → none ≥ 80k
//   Sales:       Eve 78k, Frank 65k               → none ≥ 80k
//   HR:          Hank 71k                         → none ≥ 80k

const steps = [
  {
    sql: `-- Conditional SUM: split salary budget by band\nSELECT department,\n  SUM(CASE WHEN salary >= 80000\n      THEN salary ELSE 0 END)\n    AS high_band_cost,\n  SUM(CASE WHEN salary < 80000\n      THEN salary ELSE 0 END)\n    AS std_band_cost\nFROM employees\nGROUP BY department;`,
    desc: 'Conditional SUM — split budget by salary band',
    detail: 'Two CASE WHEN expressions inside SUM() split the salary total into two buckets per department. Rows that don\'t match a condition contribute 0, so only qualifying values add to each sum.',
    result: {
      columns: ['department', 'high_band_cost', 'std_band_cost'],
      rows: [
        ['Engineering', 285000, 0],
        ['Marketing', 0, 140000],
        ['Sales', 0, 143000],
        ['HR', 0, 71000],
      ],
    },
  },
  {
    sql: `-- Pivot: one column per department headcount\nSELECT\n  COUNT(CASE WHEN department = 'Engineering'\n       THEN 1 END) AS engineering,\n  COUNT(CASE WHEN department = 'Marketing'\n       THEN 1 END) AS marketing,\n  COUNT(CASE WHEN department = 'Sales'\n       THEN 1 END) AS sales,\n  COUNT(CASE WHEN department = 'HR'\n       THEN 1 END) AS hr\nFROM employees;`,
    desc: 'Pivot — departments as columns',
    detail: 'Each CASE WHEN returns 1 for the matching department and NULL otherwise. COUNT ignores NULLs, so each column tallies only its department\'s rows. This is the standard SQL pivot pattern — no PIVOT keyword needed.',
    result: {
      columns: ['engineering', 'marketing', 'sales', 'hr'],
      rows: [[3, 2, 2, 1]],
    },
  },
  {
    sql: `-- Percentage of high earners per department\nSELECT department,\n  COUNT(*) AS total,\n  COUNT(CASE WHEN salary >= 80000\n       THEN 1 END) AS high_earners,\n  ROUND(\n    100.0 *\n    COUNT(CASE WHEN salary >= 80000\n         THEN 1 END)\n    / COUNT(*), 1\n  ) AS pct_high\nFROM employees\nGROUP BY department;`,
    desc: 'Percentage calculation per group',
    detail: 'Divide the conditional COUNT by the total COUNT and multiply by 100. ROUND(..., 1) keeps one decimal. Engineering is 100% high earners; other departments are 0%. The 100.0 ensures floating-point division instead of integer division.',
    result: {
      columns: ['department', 'total', 'high_earners', 'pct_high'],
      rows: [
        ['Engineering', 3, 3, 100.0],
        ['Marketing', 2, 0, 0.0],
        ['Sales', 2, 0, 0.0],
        ['HR', 1, 0, 0.0],
      ],
    },
  },
  {
    sql: `-- Classify & aggregate in one pass\nSELECT\n  CASE\n    WHEN salary >= 90000 THEN 'Senior'\n    WHEN salary >= 70000 THEN 'Mid'\n    ELSE 'Junior'\n  END AS band,\n  COUNT(*)       AS headcount,\n  AVG(salary)    AS avg_salary,\n  MIN(salary)    AS min_salary,\n  MAX(salary)    AS max_salary\nFROM employees\nGROUP BY band;`,
    desc: 'CASE in GROUP BY — classify then aggregate',
    detail: 'CASE WHEN can appear directly in GROUP BY. The database classifies every row first, then groups by that classification. Each band gets its own headcount, average, min, and max — all in a single query.',
    result: {
      columns: ['band', 'headcount', 'avg_salary', 'min_salary', 'max_salary'],
      rows: [
        ['Senior', 2, 98500, 95000, 102000],
        ['Mid', 4, 72500, 68000, 78000],
        ['Junior', 2, 67000, 65000, 71000],
      ],
    },
  },
];

export function AdvancedCaseAggPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 3000);
  const current = steps[step];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Advanced Aggregation with CASE WHEN</h1>
        <p className="text-sm text-text-secondary mt-1">
          Nest CASE WHEN inside aggregate functions to build conditional sums, pivots, and percentage
          calculations — all in a single query pass. This pattern replaces multiple queries or
          application-side logic with one compact SQL expression.
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
            <SqlTable table={employees} visibleColumns={[1, 2, 3]} />
          </div>
        </MacWindow>
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <MacWindow title="Result">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-accent">
                {current.result.rows.length} row{current.result.rows.length !== 1 ? 's' : ''}
              </span>
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
          initialQuery={`SELECT\n  CASE\n    WHEN salary >= 90000 THEN 'Senior'\n    WHEN salary >= 70000 THEN 'Mid'\n    ELSE 'Junior'\n  END AS band,\n  COUNT(*)    AS headcount,\n  AVG(salary) AS avg_salary\nFROM employees\nGROUP BY band;`}
          description="Try building a pivot — one column per department. Or calculate what % of employees per department earn above the company average."
        />
      </div>
    </div>
  );
}
