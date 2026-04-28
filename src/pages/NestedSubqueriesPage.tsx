import { MacWindow } from '../components/MacWindow';
import { SqlTable } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { QueryPlayground } from '../components/QueryPlayground';
import { motion } from 'framer-motion';

// rides: 101(u1,8.5,Bike), 102(u2,12.3,Auto), 103(u3,15.7,Cab),
//        104(u1,7.2,Bike), 105(u4,6.8,Auto), 106(u5,9.1,Cab),
//        107(u2,18.4,Auto), 108(u6,11.2,Bike)
// overall avg distance = (8.5+12.3+15.7+7.2+6.8+9.1+18.4+11.2)/8 = 89.2/8 = 11.15
// avg per vehicle:
//   Bike (8.5,7.2,11.2)  → 26.9/3 ≈ 8.97
//   Auto (12.3,6.8,18.4) → 37.5/3 = 12.50
//   Cab  (15.7,9.1)      → 24.8/2 = 12.40
// rides per user: u1=2, u2=2, u3=1, u4=1, u5=1, u6=1 → avg=1.33

const steps = [
  {
    sql: `-- Two-level nesting: subquery inside a subquery\nSELECT first_name\nFROM users\nWHERE user_id IN (\n  SELECT user_id\n  FROM rides\n  WHERE distance_km > (\n    SELECT AVG(distance_km) FROM rides  -- innermost\n  )\n);`,
    desc: 'Two-level nested — names of users with above-avg rides',
    detail: 'The query has three levels. The innermost runs first: AVG(distance_km) returns 11.15. The middle layer collects user_ids of any ride longer than 11.15. The outer layer fetches names of those user_ids. Read inside-out — that is always the evaluation order.',
    levels: [
      { label: '③ Innermost: AVG(distance_km)', cols: ['avg_dist'], rows: [[11.15]] },
      { label: '② Middle: user_ids with ride > 11.15', cols: ['user_id'], rows: [[2], [3], [2], [6]] },
      { label: '① Outer: names of those users', cols: ['first_name'], rows: [['Priya'], ['Ravi'], ['Divya']] },
    ],
  },
  {
    sql: `-- Subquery in FROM with another subquery in WHERE\nSELECT vehicle_type, avg_dist\nFROM (\n  SELECT vehicle_type,\n         ROUND(AVG(distance_km), 2) AS avg_dist\n  FROM rides\n  GROUP BY vehicle_type        -- inner: derived table\n) AS per_vehicle\nWHERE avg_dist > (\n  SELECT AVG(distance_km) FROM rides  -- another inner: 11.15\n);`,
    desc: 'Derived table + scalar — vehicle types above overall avg',
    detail: 'Two independent subqueries feed the outer query. The FROM-subquery groups rides by vehicle and computes per-vehicle averages. The WHERE-subquery returns the overall average (11.15). The outer query keeps only rows where the per-vehicle average beats the overall — Auto (12.50) and Cab (12.40), but not Bike (8.97).',
    levels: [
      { label: '③ FROM subquery: per-vehicle avg', cols: ['vehicle_type', 'avg_dist'], rows: [['Bike', 8.97], ['Auto', 12.50], ['Cab', 12.40]] },
      { label: '③ WHERE subquery: overall avg', cols: ['avg_dist'], rows: [[11.15]] },
      { label: '① Outer: avg > 11.15', cols: ['vehicle_type', 'avg_dist'], rows: [['Auto', 12.50], ['Cab', 12.40]] },
    ],
  },
  {
    sql: `-- Three-level chained aggregation\nSELECT origin_city\nFROM users\nWHERE user_id IN (\n  SELECT user_id\n  FROM rides\n  GROUP BY user_id\n  HAVING COUNT(*) > (\n    SELECT AVG(ride_count)\n    FROM (\n      SELECT COUNT(*) AS ride_count\n      FROM rides\n      GROUP BY user_id    -- innermost\n    ) AS user_counts\n  )\n);`,
    desc: 'Triple-nested — cities of frequent riders',
    detail: 'Four query levels. Innermost: ride count per user (2,2,1,1,1,1). Next: AVG of those counts → 1.33. Middle: user_ids whose count > 1.33 → users 1 and 2. Outermost: cities of those users → Mumbai (Aarav) and Delhi (Priya). Notice how each layer feeds the next.',
    levels: [
      { label: '④ Innermost: rides per user', cols: ['user_id', 'ride_count'], rows: [[1, 2], [2, 2], [3, 1], [4, 1], [5, 1], [6, 1]] },
      { label: '③ AVG of those counts', cols: ['avg_ride_count'], rows: [[1.33]] },
      { label: '② users with count > 1.33', cols: ['user_id'], rows: [[1], [2]] },
      { label: '① Outer: their origin cities', cols: ['origin_city'], rows: [['Mumbai'], ['Delhi']] },
    ],
  },
];

export function NestedSubqueriesPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 3500);
  const current = steps[step];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Nested Subqueries</h1>
        <p className="text-sm text-text-secondary mt-1">
          A nested subquery is a subquery inside another subquery — multiple levels of SELECT
          stacked together. SQL evaluates them inside-out: the deepest query runs first, its
          result feeds the next layer, and so on until the outermost query produces the final
          rows.
        </p>
      </div>

      <div className="px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-mac">
        <p className="text-xs text-purple-600 dark:text-purple-400">
          <strong>Reading rule:</strong> always read nested queries from the <strong>innermost</strong> outward.
          Nesting more than 2–3 levels usually signals it's time to switch to a CTE for readability.
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
        <div className={`grid gap-4 ${current.levels.length === 4 ? 'grid-cols-1 lg:grid-cols-4' : 'grid-cols-1 lg:grid-cols-3'}`}>
          {current.levels.map((level, i) => (
            <MacWindow key={i} title={level.label} compact>
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`badge ${i === current.levels.length - 1 ? 'badge-success' : 'badge-info'}`}>
                    {level.rows.length} rows
                  </span>
                </div>
                <SqlTable
                  table={{ name: 'lvl', columns: level.cols, rows: level.rows }}
                  animateRows
                />
              </div>
            </MacWindow>
          ))}
        </div>
      </motion.div>

      <div className="mt-8 pt-6 border-t border-border">
        <QueryPlayground
          initialQuery={`SELECT first_name\nFROM users\nWHERE user_id IN (\n  SELECT user_id\n  FROM rides\n  WHERE distance_km > (\n    SELECT AVG(distance_km) FROM rides\n  )\n);`}
          description="Try peeling the layers from the inside out. Each nested level should answer one clear sub-question."
        />
      </div>
    </div>
  );
}
