import { MacWindow } from '../components/MacWindow';
import { SqlTable } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { QueryPlayground } from '../components/QueryPlayground';
import { motion } from 'framer-motion';

// rides per user: u1=2, u2=2, u3=1, u4=1, u5=1, u6=1 (8 rides total, 6 active users)
// avg ride count = 8/6 ≈ 1.33
// users with > avg: u1 (Aarav), u2 (Priya)

const steps = [
  {
    sql: `-- Same query, two ways. The CTE version is the same SQL\n-- — just unwrapped into named, sequential steps.\n\n-- Without CTE: nested\nSELECT first_name FROM users\nWHERE user_id IN (\n  SELECT user_id FROM rides\n  WHERE distance_km > (\n    SELECT AVG(distance_km) FROM rides\n  )\n);\n\n-- With CTE: linear\nWITH avg_d AS (\n  SELECT AVG(distance_km) AS d FROM rides\n),\nlong_rides AS (\n  SELECT DISTINCT r.user_id\n  FROM rides r, avg_d\n  WHERE r.distance_km > avg_d.d\n)\nSELECT first_name FROM users\nWHERE user_id IN (SELECT user_id FROM long_rides);`,
    desc: 'Advantage 1 — Readability',
    detail: 'Same logic, two shapes. The nested version forces you to read inside-out and parse parentheses. The CTE version reads top-to-bottom: first compute the average, then collect long-ride users, then look up their names. Each step has a name that documents intent.',
    pipeline: [
      { name: 'avg_d', cols: ['d'], rows: [[11.15]], badge: 'Step 1' },
      { name: 'long_rides', cols: ['user_id'], rows: [[2], [3], [6]], badge: 'Step 2' },
      { name: 'final', cols: ['first_name'], rows: [['Priya'], ['Ravi'], ['Divya']], badge: 'Result', success: true },
    ],
  },
  {
    sql: `-- Reuse: reference the same CTE multiple times.\n-- A nested subquery would have to be repeated.\nWITH user_rides AS (\n  SELECT user_id, COUNT(*) AS cnt\n  FROM rides\n  GROUP BY user_id\n)\nSELECT user_id,\n       cnt,\n       (SELECT AVG(cnt) FROM user_rides) AS overall_avg,\n       cnt - (SELECT AVG(cnt) FROM user_rides) AS diff\nFROM user_rides\nORDER BY diff DESC;`,
    desc: 'Advantage 2 — Reusability',
    detail: 'user_rides is referenced three times: once as the main FROM, and twice in the SELECT. Without a CTE, you would copy-paste the same subquery three times — and any change would need to be made in three places. CTEs let you define once, use many times.',
    pipeline: [
      { name: 'user_rides (defined once)', cols: ['user_id', 'cnt'], rows: [[1, 2], [2, 2], [3, 1], [4, 1], [5, 1], [6, 1]], badge: 'Used 3×' },
      { name: 'final result', cols: ['user_id', 'cnt', 'overall_avg', 'diff'], rows: [
        [1, 2, 1.33, 0.67], [2, 2, 1.33, 0.67],
        [3, 1, 1.33, -0.33], [4, 1, 1.33, -0.33],
        [5, 1, 1.33, -0.33], [6, 1, 1.33, -0.33],
      ], badge: 'Result', success: true },
    ],
  },
  {
    sql: `-- Pipeline: each CTE builds on the previous one.\n-- This expresses a clear, sequential thought process.\nWITH user_rides AS (\n  SELECT user_id, COUNT(*) AS cnt\n  FROM rides\n  GROUP BY user_id\n),\navg_count AS (\n  SELECT AVG(cnt) AS avg_cnt FROM user_rides\n),\nfrequent_riders AS (\n  SELECT ur.user_id\n  FROM user_rides ur, avg_count ac\n  WHERE ur.cnt > ac.avg_cnt\n)\nSELECT u.first_name, u.origin_city\nFROM users u\nJOIN frequent_riders fr ON fr.user_id = u.user_id;`,
    desc: 'Advantage 3 — Step-by-step pipelines',
    detail: 'Three named stages chained together: count rides per user → compute the average → pick users above it → join back to users for names and cities. Each CTE is a labelled checkpoint you can debug or replace independently. The same query as nested subqueries would be ~4 levels deep with no signposts.',
    pipeline: [
      { name: 'user_rides', cols: ['user_id', 'cnt'], rows: [[1, 2], [2, 2], [3, 1], [4, 1], [5, 1], [6, 1]], badge: 'Stage 1' },
      { name: 'avg_count', cols: ['avg_cnt'], rows: [[1.33]], badge: 'Stage 2' },
      { name: 'frequent_riders', cols: ['user_id'], rows: [[1], [2]], badge: 'Stage 3' },
      { name: 'final', cols: ['first_name', 'origin_city'], rows: [['Aarav', 'Mumbai'], ['Priya', 'Delhi']], badge: 'Result', success: true },
    ],
  },
];

export function CtesAdvantagesPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 3500);
  const current = steps[step];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">CTEs &amp; Their Advantages</h1>
        <p className="text-sm text-text-secondary mt-1">
          A Common Table Expression (CTE) is a named, temporary result set defined with the
          <code className="mx-1 px-1.5 py-0.5 rounded bg-surface-2 text-text-1">WITH</code>
          clause and used in the query that follows. CTEs replace deeply nested subqueries with
          named, sequential building blocks — without changing what the query does.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-mac px-3 py-2">
          <p className="font-semibold text-blue-600 dark:text-blue-400 mb-1">Readable</p>
          <p className="text-text-secondary">Top-to-bottom flow with named stages, instead of inside-out parentheses.</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-mac px-3 py-2">
          <p className="font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Reusable</p>
          <p className="text-text-secondary">Define once, reference many times in the same query — no copy-paste.</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-mac px-3 py-2">
          <p className="font-semibold text-purple-600 dark:text-purple-400 mb-1">Composable</p>
          <p className="text-text-secondary">Chain CTEs into pipelines — each stage builds on the previous one.</p>
        </div>
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
        <div className={`grid gap-4 ${current.pipeline.length >= 4 ? 'grid-cols-1 lg:grid-cols-4' : current.pipeline.length === 3 ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'}`}>
          {current.pipeline.map((stage, i) => (
            <MacWindow key={i} title={stage.name} compact>
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`badge ${stage.success ? 'badge-success' : 'badge-info'}`}>
                    {stage.badge}
                  </span>
                  <span className="text-[11px] text-text-tertiary">{stage.rows.length} rows</span>
                </div>
                <SqlTable
                  table={{ name: stage.name, columns: stage.cols, rows: stage.rows }}
                  animateRows
                />
              </div>
            </MacWindow>
          ))}
        </div>
      </motion.div>

      <div className="mt-8 pt-6 border-t border-border">
        <QueryPlayground
          initialQuery={`WITH user_rides AS (\n  SELECT user_id, COUNT(*) AS cnt\n  FROM rides\n  GROUP BY user_id\n),\navg_count AS (\n  SELECT AVG(cnt) AS avg_cnt FROM user_rides\n)\nSELECT ur.user_id, ur.cnt\nFROM user_rides ur, avg_count ac\nWHERE ur.cnt > ac.avg_cnt;`}
          description="Try chaining CTEs. Each WITH clause becomes a named stage you can SELECT from in the next stage."
        />
      </div>
    </div>
  );
}
