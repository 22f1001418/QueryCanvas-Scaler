import { MacWindow } from '../components/MacWindow';
import { SqlTable } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { rides, users } from '../data/sampleData';
import { QueryPlayground } from '../components/QueryPlayground';
import { motion } from 'framer-motion';

// rides avg distance_km = (8.5+12.3+15.7+7.2+6.8+9.1+18.4+11.2)/8 = 89.2/8 = 11.15
// rides longer than avg: CP(12.3), Indiranagar(15.7), Karol Bagh(18.4), Anna Nagar(11.2)
// users from Delhi: Priya(2), Karan(7)
// rides by user_id 2 or 7: CP(102), Karol Bagh(107)

const steps = [
  {
    sql: `-- Inner query runs ONCE and produces a fixed value\n-- Outer query uses that value for every row\nSELECT start_location, distance_km\nFROM rides\nWHERE distance_km > (\n  SELECT AVG(distance_km)\n  FROM rides         -- runs once → 11.15\n);`,
    desc: 'Scalar subquery — runs once, returns one value',
    detail: 'A non-correlated subquery does not reference the outer query. The inner SELECT AVG(distance_km) runs exactly once, returns 11.15, and the outer query compares every ride against that fixed number.',
    innerLabel: 'Inner query (runs once)',
    innerResult: { columns: ['AVG(distance_km)'], rows: [[11.15]] },
    outerRows: [1, 2, 6, 7],
  },
  {
    sql: `-- Inner query returns a list; outer uses IN\nSELECT r.start_location, r.distance_km\nFROM rides r\nWHERE r.user_id IN (\n  SELECT user_id\n  FROM users\n  WHERE origin_city = 'Delhi'\n);`,
    desc: 'List subquery — IN with a subquery result',
    detail: "The inner query fetches all user_ids from Delhi (Priya=2, Karan=7) and runs once. The outer query checks each ride's user_id against that fixed list. Rides by Delhi users are returned.",
    innerLabel: 'Inner query → Delhi user_ids',
    innerResult: { columns: ['user_id'], rows: [[2], [7]] },
    outerRows: [1, 6],
  },
  {
    sql: `-- Subquery in FROM — treated as a derived table\nSELECT vt.vehicle_type,\n       vt.avg_dist\nFROM (\n  SELECT vehicle_type,\n         ROUND(AVG(distance_km), 1)\n           AS avg_dist\n  FROM rides\n  GROUP BY vehicle_type\n) AS vt\nWHERE vt.avg_dist > 10;`,
    desc: 'Derived table — subquery in FROM',
    detail: 'A subquery in the FROM clause creates a temporary result set (derived table). The inner query aggregates rides by vehicle type, and the outer query filters on those aggregated values — something impossible with a single WHERE clause.',
    innerLabel: 'Inner query → derived table',
    innerResult: {
      columns: ['vehicle_type', 'avg_dist'],
      rows: [['Auto', 12.5], ['Bike', 9.0], ['Cab', 12.4]],
    },
    outerRows: [],
  },
  {
    sql: `-- Subquery in SELECT — scalar per row\nSELECT start_location,\n       distance_km,\n       distance_km - (\n         SELECT AVG(distance_km)\n         FROM rides\n       ) AS vs_avg\nFROM rides;`,
    desc: 'Subquery in SELECT — difference from average',
    detail: 'A scalar subquery can also appear in the SELECT list. AVG(distance_km) runs once (11.15) and is subtracted from each ride\'s distance to show how far above or below average each ride is.',
    innerLabel: 'Inner query (runs once)',
    innerResult: { columns: ['AVG(distance_km)'], rows: [[11.15]] },
    outerRows: [0, 1, 2, 3, 4, 5, 6, 7],
  },
];

export function NonCorrelatedPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 3000);
  const current = steps[step];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Non-Correlated Subqueries</h1>
        <p className="text-sm text-text-secondary mt-1">
          A non-correlated subquery runs independently of the outer query — it executes once, produces
          a fixed result, and the outer query uses that result. It can appear in WHERE (scalar or list),
          FROM (derived table), or SELECT (scalar per row).
        </p>
      </div>

      <div className="px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-mac">
        <p className="text-xs text-blue-600 dark:text-blue-400">
          <strong>Key rule:</strong> the inner query does <strong>not</strong> reference any column from the outer query — it can run in isolation and returns the same result every time.
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <MacWindow title={`① ${current.innerLabel}`} compact>
            <div className="p-3">
              <div className="text-xs text-blue-500 font-medium mb-2">Runs once — fixed result</div>
              <SqlTable
                table={{ name: 'inner', columns: current.innerResult.columns, rows: current.innerResult.rows }}
                animateRows
              />
            </div>
          </MacWindow>

          <MacWindow title="② Outer query input" compact>
            <div className="p-3">
              <SqlTable table={rides} visibleColumns={[0, 1, 4, 6, 7]} />
            </div>
          </MacWindow>

          <MacWindow title="③ Final result" compact>
            <div className="p-3">
              {step === 2 ? (
                <>
                  <div className="text-xs text-green-500 font-medium mb-2">2 vehicle types with avg &gt; 10</div>
                  <SqlTable
                    table={{ name: 'r', columns: ['vehicle_type', 'avg_dist'], rows: [['Auto', 12.5], ['Cab', 12.4]] }}
                    animateRows
                  />
                </>
              ) : step === 3 ? (
                <>
                  <div className="text-xs text-green-500 font-medium mb-2">All 8 rides with vs_avg column</div>
                  <SqlTable
                    table={{ name: 'r', columns: ['start_location', 'distance_km', 'vs_avg'], rows: [
                      ['Andheri', 8.5, -2.65], ['CP', 12.3, 1.15], ['Indiranagar', 15.7, 4.55],
                      ['Bandra', 7.2, -3.95], ['Navrangpura', 6.8, -4.35], ['MG Road', 9.1, -2.05],
                      ['Karol Bagh', 18.4, 7.25], ['Anna Nagar', 11.2, 0.05],
                    ]}}
                    animateRows
                  />
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge badge-success">{current.outerRows.length} rows matched</span>
                  </div>
                  <SqlTable table={rides} visibleColumns={[4, 6]} visibleRows={current.outerRows} animateRows />
                </>
              )}
            </div>
          </MacWindow>
        </div>
      </motion.div>

      <div className="mt-8 pt-6 border-t border-border">
        <QueryPlayground
          initialQuery={`SELECT start_location, distance_km\nFROM rides\nWHERE distance_km > (\n  SELECT AVG(distance_km) FROM rides\n);`}
          description="Try scalar subqueries (AVG, MAX, MIN), list subqueries with IN, and subqueries in FROM. Notice the inner query never references the outer table."
        />
      </div>
    </div>
  );
}
