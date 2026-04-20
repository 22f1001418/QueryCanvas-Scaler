import { MacWindow } from '../components/MacWindow';
import { SqlTable } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { rides } from '../data/sampleData';
import { QueryPlayground } from '../components/QueryPlayground';
import { motion } from 'framer-motion';

const steps = [
  {
    sql: `SELECT start_location AS pickup,\n       end_location AS dropoff\nFROM rides;`,
    desc: 'Column alias — rename output columns',
    detail: 'AS renames a column in the result set. "start_location AS pickup" makes the output header read "pickup" instead of "start_location". The original table is unchanged.',
    result: {
      columns: ['pickup', 'dropoff'],
      rows: [
        ['Andheri', 'Bandra'],
        ['CP', 'Lajpat Nagar'],
        ['Indiranagar', 'Whitefield'],
        ['Bandra', 'Andheri'],
        ['Navrangpura', 'Vastrapur'],
        ['MG Road', 'Fort Kochi'],
        ['Karol Bagh', 'Dwarka'],
        ['Anna Nagar', 'T Nagar'],
      ],
    },
  },
  {
    sql: `SELECT start_location,\n       distance_km * 15 AS fare_estimate\nFROM rides;`,
    desc: 'Expression alias — name a computed value',
    detail: 'Aliases are essential for computed columns. Without AS, the column header would show the raw expression "distance_km * 15". With AS, you give it a readable name.',
    result: {
      columns: ['start_location', 'fare_estimate'],
      rows: [
        ['Andheri', 127.5],
        ['CP', 184.5],
        ['Indiranagar', 235.5],
        ['Bandra', 108.0],
        ['Navrangpura', 102.0],
        ['MG Road', 136.5],
        ['Karol Bagh', 276.0],
        ['Anna Nagar', 168.0],
      ],
    },
  },
  {
    sql: `SELECT r.start_location,\n       r.vehicle_type,\n       r.distance_km\nFROM rides AS r\nWHERE r.distance_km > 10;`,
    desc: 'Table alias — shorten table references',
    detail: 'Tables can also be aliased. "rides AS r" lets you write "r.column" instead of "rides.column". Table aliases become critical with JOINs where you reference multiple tables.',
    result: {
      columns: ['start_location', 'vehicle_type', 'distance_km'],
      rows: [
        ['CP', 'Auto', 12.3],
        ['Indiranagar', 'Cab', 15.7],
        ['Karol Bagh', 'Auto', 18.4],
        ['Anna Nagar', 'Bike', 11.2],
      ],
    },
  },
  {
    sql: `SELECT start_location,\n       distance_km,\n       distance_km - 8 AS above_base\nFROM rides\nORDER BY above_base DESC;`,
    desc: 'Alias in ORDER BY',
    detail: 'You can reference a column alias in ORDER BY (but not in WHERE — that runs before SELECT). Here "above_base" is used to sort, making the query much easier to read than repeating the expression.',
    result: {
      columns: ['start_location', 'distance_km', 'above_base'],
      rows: [
        ['Karol Bagh', 18.4, 10.4],
        ['Indiranagar', 15.7, 7.7],
        ['CP', 12.3, 4.3],
        ['Anna Nagar', 11.2, 3.2],
        ['MG Road', 9.1, 1.1],
        ['Andheri', 8.5, 0.5],
        ['Bandra', 7.2, -0.8],
        ['Navrangpura', 6.8, -1.2],
      ],
    },
  },
];

export function AliasPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 2500);
  const current = steps[step];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Alias (AS)</h1>
        <p className="text-sm text-text-secondary mt-1">
          AS assigns a temporary name to a column or table within a query. Column aliases rename output
          headers and are required when selecting computed expressions. Table aliases shorten long table
          names and are essential when joining multiple tables.
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
            <SqlTable table={rides} visibleColumns={[4, 6]} />
          </div>
        </MacWindow>
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <MacWindow title="Result — with aliases applied">
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
          initialQuery="SELECT start_location AS pickup, end_location AS dropoff, distance_km * 15 AS fare_estimate FROM rides;"
          description="Practice using AS. Try renaming columns, aliasing computed expressions, and using a table alias in the FROM clause."
        />
      </div>
    </div>
  );
}
