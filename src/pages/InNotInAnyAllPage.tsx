import { MacWindow } from '../components/MacWindow';
import { SqlTable } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { rides, users } from '../data/sampleData';
import { QueryPlayground } from '../components/QueryPlayground';
import { motion } from 'framer-motion';

// users with rides: 1,2,3,4,5,6   |   without rides: 7,8
// rides distances: 8.5,12.3,15.7,7.2,6.8,9.1,18.4,11.2
// Bike rides: 8.5(101), 7.2(104), 11.2(108)
// Auto rides: 12.3(102), 6.8(105), 18.4(107)  → max auto = 18.4, min auto = 6.8
// Cab rides: 15.7(103), 9.1(106)

const steps = [
  {
    sql: `-- IN: match any value in the subquery list\nSELECT first_name, user_id\nFROM users\nWHERE user_id IN (\n  SELECT DISTINCT user_id\n  FROM rides\n  WHERE vehicle_type = 'Cab'\n);`,
    desc: 'IN — rows whose value appears in the subquery',
    detail: "IN returns true if the value matches any item in the subquery's result set. The inner query returns user_ids who have taken a Cab (3 and 5). Users 3 (Ravi) and 5 (Arjun) are matched.",
    innerResult: { columns: ['user_id'], rows: [[3], [5]] },
    innerLabel: 'Cab riders (user_ids)',
    resultData: { columns: ['first_name', 'user_id'], rows: [['Ravi', 3], ['Arjun', 5]] },
  },
  {
    sql: `-- NOT IN: exclude rows matching the subquery\nSELECT first_name, user_id\nFROM users\nWHERE user_id NOT IN (\n  SELECT DISTINCT user_id\n  FROM rides\n  WHERE vehicle_type = 'Cab'\n);`,
    desc: 'NOT IN — exclude rows that match the list',
    detail: "NOT IN is the inverse — it excludes any row whose value appears in the subquery result. All users except Ravi(3) and Arjun(5) are returned. Warning: if the subquery returns a NULL, NOT IN returns no rows at all.",
    innerResult: { columns: ['user_id'], rows: [[3], [5]] },
    innerLabel: 'Exclude these user_ids',
    resultData: { columns: ['first_name', 'user_id'], rows: [['Aarav', 1], ['Priya', 2], ['Sneha', 4], ['Divya', 6], ['Karan', 7], ['Meera', 8]] },
  },
  {
    sql: `-- ANY: true if condition holds for AT LEAST one value\nSELECT start_location, distance_km\nFROM rides\nWHERE distance_km > ANY (\n  SELECT distance_km\n  FROM rides\n  WHERE vehicle_type = 'Auto'\n);`,
    desc: 'ANY — true if condition holds for at least one value',
    detail: "distance_km > ANY(...) means: is this distance greater than at least one Auto ride? Auto distances are 12.3, 6.8, 18.4. Any ride > 6.8 passes. Only Navrangpura (6.8) and Bandra (7.2) fail since they aren't greater than even the smallest Auto ride... wait — 7.2 > 6.8 so it passes. Only Navrangpura (6.8) equals the min but isn't greater.",
    innerResult: { columns: ['distance_km'], rows: [[12.3], [6.8], [18.4]] },
    innerLabel: 'Auto ride distances',
    resultData: { columns: ['start_location', 'distance_km'], rows: [
      ['Andheri', 8.5], ['CP', 12.3], ['Indiranagar', 15.7],
      ['Bandra', 7.2], ['MG Road', 9.1], ['Karol Bagh', 18.4], ['Anna Nagar', 11.2],
    ]},
  },
  {
    sql: `-- ALL: true if condition holds for EVERY value\nSELECT start_location, distance_km\nFROM rides\nWHERE distance_km > ALL (\n  SELECT distance_km\n  FROM rides\n  WHERE vehicle_type = 'Auto'\n);`,
    desc: 'ALL — true only if condition holds for every value',
    detail: "distance_km > ALL(...) means: is this distance greater than every Auto ride? The largest Auto distance is 18.4 (Karol Bagh). Only rides with distance > 18.4 pass — which is none. ALL is equivalent to > MAX(subquery).",
    innerResult: { columns: ['distance_km'], rows: [[12.3], [6.8], [18.4]] },
    innerLabel: 'Must beat ALL of these',
    resultData: { columns: ['start_location', 'distance_km'], rows: [] },
  },
  {
    sql: `-- ⚠️ NOT IN NULL trap\nSELECT first_name FROM users\nWHERE user_id NOT IN (\n  SELECT user_id FROM rides\n  WHERE captain_rating IS NULL  -- ride 108 has NULL rating\n  -- this subquery returns: 6 (and conceptually NULL)\n  -- NOT IN with any NULL → returns 0 rows!\n);`,
    desc: '⚠️ NOT IN NULL trap — returns 0 rows',
    detail: "If the subquery returns any NULL, NOT IN returns no rows at all. This is because x NOT IN (1, NULL) is evaluated as x≠1 AND x≠NULL — and x≠NULL is always UNKNOWN, making the whole condition UNKNOWN. Use NOT EXISTS instead to avoid this trap.",
    innerResult: { columns: ['user_id'], rows: [[6], [null]] },
    innerLabel: 'Contains NULL → NOT IN fails',
    resultData: { columns: ['first_name'], rows: [] },
  },
];

export function InNotInAnyAllPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 3000);
  const current = steps[step];
  const isNullTrap = step === 4;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">IN, NOT IN, ANY, ALL</h1>
        <p className="text-sm text-text-secondary mt-1">
          These operators combine a value with the result set of a subquery. IN and NOT IN check for
          membership. ANY and ALL compare against a set using a condition. ALL four work with scalar
          comparisons against subquery results.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        {[
          { op: 'IN', desc: 'value = any item in list' },
          { op: 'NOT IN', desc: 'value ≠ every item in list' },
          { op: '> ANY', desc: 'value > at least one item' },
          { op: '> ALL', desc: 'value > every item (= > MAX)' },
        ].map(({ op, desc }) => (
          <div key={op} className="bg-surface-2 border border-border rounded-mac px-3 py-1.5">
            <span className="text-text-primary font-semibold">{op}</span>
            <span className="text-text-secondary ml-2">{desc}</span>
          </div>
        ))}
      </div>

      <AnimationControls
        step={step} maxSteps={steps.length - 1}
        isPlaying={isPlaying} onPlay={play} onPause={pause}
        onReset={reset} onNext={next} onPrev={prev}
        stepLabel={current.desc}
      />

      <div className={`p-3 rounded-mac border ${isNullTrap ? 'bg-red-500/10 border-red-500/30' : 'bg-surface-2 border-border'}`}>
        <p className="text-sm text-text-primary">{current.detail}</p>
      </div>

      <MacWindow title="Query" compact>
        <CodeBlock code={current.sql} />
      </MacWindow>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MacWindow title={`① Inner query — ${current.innerLabel}`} compact>
            <div className="p-3">
              <SqlTable
                table={{ name: 'inner', columns: current.innerResult.columns, rows: current.innerResult.rows }}
                animateRows
              />
            </div>
          </MacWindow>

          <MacWindow title="② Result" compact>
            <div className="p-3">
              <div className="flex items-center gap-2 mb-2">
                {isNullTrap
                  ? <span className="badge" style={{ background: 'rgba(239,68,68,0.15)', color: 'rgb(239,68,68)' }}>0 rows — NULL trap!</span>
                  : <span className="badge badge-success">{current.resultData.rows.length} rows</span>
                }
              </div>
              {current.resultData.rows.length === 0
                ? <p className="text-sm text-text-secondary italic p-4 text-center">No rows returned</p>
                : <SqlTable table={{ name: 'result', columns: current.resultData.columns, rows: current.resultData.rows }} animateRows />
              }
            </div>
          </MacWindow>
        </div>
      </motion.div>

      <div className="mt-8 pt-6 border-t border-border">
        <QueryPlayground
          initialQuery={`-- Try ANY vs ALL on distances\nSELECT start_location, distance_km\nFROM rides\nWHERE distance_km > ANY (\n  SELECT distance_km FROM rides WHERE vehicle_type = 'Bike'\n);`}
          description="Swap ANY for ALL to see the difference. Try NOT IN and introduce a NULL in the subquery to trigger the NULL trap. Use IN with a hardcoded list to compare."
        />
      </div>
    </div>
  );
}
