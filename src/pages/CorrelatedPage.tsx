import { MacWindow } from '../components/MacWindow';
import { SqlTable } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { rides } from '../data/sampleData';
import { QueryPlayground } from '../components/QueryPlayground';
import { motion } from 'framer-motion';

// rides by user:
//   user 1 (Aarav):  Andheri 8.5, Bandra 7.2        → max=8.5, avg=7.85
//   user 2 (Priya):  CP 12.3, Karol Bagh 18.4       → max=18.4, avg=15.35
//   user 3 (Ravi):   Indiranagar 15.7               → max=15.7, avg=15.7
//   user 4 (Sneha):  Navrangpura 6.8                → max=6.8, avg=6.8
//   user 5 (Arjun):  MG Road 9.1                    → max=9.1, avg=9.1
//   user 6 (Divya):  Anna Nagar 11.2                → max=11.2, avg=11.2

const perUserRows: Record<number, { label: string; inner: (string | number | null)[][] }> = {
  0: { label: 'user 1 → MAX = 8.5', inner: [['Andheri', 8.5], ['Bandra', 7.2]] },
  1: { label: 'user 2 → MAX = 18.4', inner: [['CP', 12.3], ['Karol Bagh', 18.4]] },
  2: { label: 'user 3 → MAX = 15.7', inner: [['Indiranagar', 15.7]] },
  3: { label: 'user 4 → MAX = 6.8',  inner: [['Navrangpura', 6.8]] },
  4: { label: 'user 5 → MAX = 9.1',  inner: [['MG Road', 9.1]] },
  5: { label: 'user 6 → MAX = 11.2', inner: [['Anna Nagar', 11.2]] },
};

const steps = [
  {
    sql: `-- Inner query references outer.user_id\n-- → re-executes for each outer row\nSELECT r1.start_location,\n       r1.user_id,\n       r1.distance_km\nFROM rides r1\nWHERE r1.distance_km = (\n  SELECT MAX(r2.distance_km)\n  FROM rides r2\n  WHERE r2.user_id = r1.user_id  -- ← correlation\n);`,
    desc: 'Correlated — longest ride per user',
    detail: "The inner query references r1.user_id from the outer query. For each ride row (r1), the database re-runs the inner query with that specific user_id, finds their MAX distance, and checks if the current ride equals it. The inner query runs 8 times — once per outer row.",
    resultRows: [0, 2, 1, 3, 4, 5],
    resultCols: ['start_location', 'user_id', 'distance_km'],
    resultData: [
      ['Andheri', 1, 8.5], ['Indiranagar', 3, 15.7], ['Karol Bagh', 2, 18.4],
      ['Navrangpura', 4, 6.8], ['MG Road', 5, 9.1], ['Anna Nagar', 6, 11.2],
    ],
  },
  {
    sql: `-- Find rides ABOVE the user's own average\nSELECT r1.start_location,\n       r1.user_id,\n       r1.distance_km\nFROM rides r1\nWHERE r1.distance_km > (\n  SELECT AVG(r2.distance_km)\n  FROM rides r2\n  WHERE r2.user_id = r1.user_id\n);`,
    desc: 'Correlated — rides above user\'s own average',
    detail: "Each ride is compared to that specific user's average distance. User 1's average is 7.85 km — Andheri (8.5) is above, Bandra (7.2) is not. User 2's average is 15.35 — only Karol Bagh (18.4) passes. The inner query re-runs with each user_id.",
    resultRows: [0, 1, 6],
    resultCols: ['start_location', 'user_id', 'distance_km'],
    resultData: [
      ['Andheri', 1, 8.5],
      ['Indiranagar', 3, 15.7],
      ['Karol Bagh', 2, 18.4],
    ],
  },
  {
    sql: `-- Count rides per user inline (scalar)\nSELECT u.user_id,\n       u.first_name,\n       (\n         SELECT COUNT(*)\n         FROM rides r\n         WHERE r.user_id = u.user_id\n       ) AS ride_count\nFROM users u;`,
    desc: 'Correlated in SELECT — ride count per user',
    detail: "A correlated subquery in the SELECT list computes a value for each outer row. For every user, the inner COUNT(*) runs against rides filtered to that user_id. Users 7 and 8 have no rides — COUNT returns 0, not NULL.",
    resultRows: [],
    resultCols: ['user_id', 'first_name', 'ride_count'],
    resultData: [
      [1, 'Aarav', 2], [2, 'Priya', 2], [3, 'Ravi', 1],
      [4, 'Sneha', 1], [5, 'Arjun', 1], [6, 'Divya', 1],
      [7, 'Karan', 0], [8, 'Meera', 0],
    ],
  },
];

export function CorrelatedPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 3000);
  const current = steps[step];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Correlated Subqueries</h1>
        <p className="text-sm text-text-secondary mt-1">
          A correlated subquery references a column from the outer query. It cannot run in isolation —
          it re-executes once for every row the outer query processes. This makes them powerful for
          per-row comparisons but potentially slow on large tables.
        </p>
      </div>

      <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-mac">
        <p className="text-xs text-amber-600 dark:text-amber-400">
          <strong>Key rule:</strong> the inner query references a column from the outer query (the correlation). It runs <strong>once per outer row</strong>, not once total.
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

      <MacWindow title="Query" compact>
        <CodeBlock code={current.sql} />
      </MacWindow>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MacWindow title="Outer table — rides" compact>
            <div className="p-3">
              <div className="text-xs text-amber-500 font-medium mb-2">
                Inner query re-runs for each of these {rides.rows.length} rows
              </div>
              <SqlTable table={rides} visibleColumns={[0, 1, 4, 6]} />
            </div>
          </MacWindow>

          <MacWindow title="Result" compact>
            <div className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="badge badge-success">{current.resultData.length} rows</span>
                <span className="badge badge-warning">inner ran {rides.rows.length}× (once per row)</span>
              </div>
              <SqlTable
                table={{ name: 'result', columns: current.resultCols, rows: current.resultData }}
                animateRows
              />
            </div>
          </MacWindow>
        </div>
      </motion.div>

      <div className="mt-8 pt-6 border-t border-border">
        <QueryPlayground
          initialQuery={`-- Find each user's longest ride\nSELECT r1.start_location, r1.user_id, r1.distance_km\nFROM rides r1\nWHERE r1.distance_km = (\n  SELECT MAX(r2.distance_km)\n  FROM rides r2\n  WHERE r2.user_id = r1.user_id\n);`}
          description="The inner query references r1.user_id — change the correlation column to see different results. Try correlating on vehicle_type instead."
        />
      </div>
    </div>
  );
}
