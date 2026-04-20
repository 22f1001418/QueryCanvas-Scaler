import { MacWindow } from '../components/MacWindow';
import { SqlTable } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { rides } from '../data/sampleData';
import { QueryPlayground } from '../components/QueryPlayground';
import { motion } from 'framer-motion';

// rides columns: ride_id(0), user_id(1), start_time(2), end_time(3),
//   start_location(4), end_location(5), distance_km(6), vehicle_type(7), captain_rating(8)

const steps = [
  {
    sql: `SELECT start_location,\n       distance_km,\n       distance_km * 15\nFROM rides;`,
    desc: 'Arithmetic in SELECT — fare without alias',
    detail: 'You can write any arithmetic expression directly in SELECT. Here distance_km * 15 estimates the fare in rupees. The result column is labelled with the raw expression — not very readable yet.',
    result: {
      columns: ['start_location', 'distance_km', 'distance_km * 15'],
      rows: [
        ['Andheri', 8.5, 127.5], ['CP', 12.3, 184.5], ['Indiranagar', 15.7, 235.5],
        ['Bandra', 7.2, 108.0], ['Navrangpura', 6.8, 102.0], ['MG Road', 9.1, 136.5],
        ['Karol Bagh', 18.4, 276.0], ['Anna Nagar', 11.2, 168.0],
      ],
    },
  },
  {
    sql: `SELECT start_location,\n       distance_km,\n       distance_km * 15   AS fare_inr,\n       distance_km * 0.621 AS distance_miles\nFROM rides;`,
    desc: 'Multiple calculations in one SELECT',
    detail: 'You can include as many computed columns as you need. Each expression is evaluated independently per row. Adding AS gives each result a readable name — always alias computed columns.',
    result: {
      columns: ['start_location', 'distance_km', 'fare_inr', 'distance_miles'],
      rows: [
        ['Andheri', 8.5, 127.5, 5.28], ['CP', 12.3, 184.5, 7.64],
        ['Indiranagar', 15.7, 235.5, 9.75], ['Bandra', 7.2, 108.0, 4.47],
        ['Navrangpura', 6.8, 102.0, 4.22], ['MG Road', 9.1, 136.5, 5.65],
        ['Karol Bagh', 18.4, 276.0, 11.43], ['Anna Nagar', 11.2, 168.0, 6.96],
      ],
    },
  },
  {
    sql: `SELECT start_location,\n       distance_km,\n       captain_rating,\n       distance_km + captain_rating   AS sum_val,\n       distance_km - captain_rating   AS diff_val,\n       distance_km * captain_rating   AS product_val,\n       distance_km / captain_rating   AS ratio_val\nFROM rides\nWHERE captain_rating IS NOT NULL;`,
    desc: 'All four operators: +  −  ×  ÷',
    detail: 'SQL supports +, -, *, / directly in SELECT. Division always produces a decimal result when either operand is a decimal. Rows with NULL captain_rating are excluded here — arithmetic on NULL produces NULL.',
    result: {
      columns: ['start_location', 'distance_km', 'captain_rating', 'sum_val', 'diff_val', 'product_val', 'ratio_val'],
      rows: [
        ['Andheri', 8.5, 4.8, 13.3, 3.7, 40.8, 1.77],
        ['CP', 12.3, 4.5, 16.8, 7.8, 55.35, 2.73],
        ['Indiranagar', 15.7, 4.9, 20.6, 10.8, 76.93, 3.2],
        ['Bandra', 7.2, 4.7, 11.9, 2.5, 33.84, 1.53],
        ['Navrangpura', 6.8, 4.6, 11.4, 2.2, 31.28, 1.48],
        ['MG Road', 9.1, 4.4, 13.5, 4.7, 40.04, 2.07],
        ['Karol Bagh', 18.4, 4.2, 22.6, 14.2, 77.28, 4.38],
      ],
    },
  },
  {
    sql: `-- Use inline calc in WHERE and ORDER BY\nSELECT start_location,\n       distance_km,\n       distance_km * 15 AS fare_inr\nFROM rides\nWHERE  distance_km * 15 > 150\nORDER BY distance_km * 15 DESC;`,
    desc: 'Inline calc in WHERE and ORDER BY',
    detail: 'Computed expressions can be used anywhere — SELECT, WHERE, and ORDER BY. Here the fare calculation filters and sorts rows. Note: you cannot use a SELECT alias (like fare_inr) inside WHERE — WHERE runs before SELECT evaluates aliases.',
    result: {
      columns: ['start_location', 'distance_km', 'fare_inr'],
      rows: [
        ['Karol Bagh', 18.4, 276.0],
        ['Indiranagar', 15.7, 235.5],
        ['CP', 12.3, 184.5],
        ['Anna Nagar', 11.2, 168.0],
      ],
    },
  },
];

export function InlineCalcPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 2500);
  const current = steps[step];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Inline Calculations</h1>
        <p className="text-sm text-text-secondary mt-1">
          SQL lets you perform arithmetic (+, −, ×, ÷) directly inside SELECT, WHERE, and ORDER BY
          without creating a new column or table. Computed expressions are evaluated per row and can
          be aliased with AS to give them readable names.
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

        <MacWindow title="rides — source" compact>
          <div className="p-3">
            <SqlTable table={rides} visibleColumns={[4, 6, 8]} />
          </div>
        </MacWindow>
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <MacWindow title="Result">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-info">{current.result.rows.length} rows</span>
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
          initialQuery={`SELECT start_location,\n  distance_km,\n  distance_km * 15        AS fare_inr,\n  ROUND(distance_km * 0.621, 2) AS distance_miles\nFROM rides\nORDER BY fare_inr DESC;`}
          description="Try your own calculations — convert km to miles (× 0.621), estimate time (distance / 30 for avg speed), or compute a discounted fare. Use AS to name the result."
        />
      </div>
    </div>
  );
}
