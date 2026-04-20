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
    sql: `-- Each row is a separate ride\nSELECT vehicle_type, start_location\nFROM rides\nORDER BY vehicle_type;`,
    desc: 'The problem — one row per ride',
    detail: 'A plain SELECT returns one row per ride. If you want to see all pickup points for a vehicle type on a single line — e.g. for a report or API response — you need GROUP_CONCAT.',
    result: {
      columns: ['vehicle_type', 'start_location'],
      rows: [
        ['Auto', 'CP'], ['Auto', 'Navrangpura'], ['Auto', 'Karol Bagh'],
        ['Bike', 'Andheri'], ['Bike', 'Bandra'], ['Bike', 'Anna Nagar'],
        ['Cab', 'Indiranagar'], ['Cab', 'MG Road'],
      ],
    },
  },
  {
    sql: `SELECT vehicle_type,\n  GROUP_CONCAT(start_location) AS pickup_points\nFROM rides\nGROUP BY vehicle_type;`,
    desc: 'GROUP_CONCAT — collapse rows into a list',
    detail: 'GROUP_CONCAT aggregates all values in a group into a single comma-separated string. Each vehicle type now appears on one row with all its pickup points joined together.',
    result: {
      columns: ['vehicle_type', 'pickup_points'],
      rows: [
        ['Auto', 'CP,Navrangpura,Karol Bagh'],
        ['Bike', 'Andheri,Bandra,Anna Nagar'],
        ['Cab', 'Indiranagar,MG Road'],
      ],
    },
  },
  {
    sql: `SELECT vehicle_type,\n  GROUP_CONCAT(start_location, ' | ') AS pickup_points\nFROM rides\nGROUP BY vehicle_type;`,
    desc: 'Custom separator',
    detail: 'The second argument to GROUP_CONCAT sets the separator. Here " | " makes the output more readable than the default comma. You can use any string — ", ", " / ", " → ", etc.',
    result: {
      columns: ['vehicle_type', 'pickup_points'],
      rows: [
        ['Auto', 'CP | Navrangpura | Karol Bagh'],
        ['Bike', 'Andheri | Bandra | Anna Nagar'],
        ['Cab', 'Indiranagar | MG Road'],
      ],
    },
  },
  {
    sql: `SELECT vehicle_type,\n  COUNT(*)           AS total_rides,\n  GROUP_CONCAT(start_location, ', ')\n                     AS pickup_points\nFROM rides\nGROUP BY vehicle_type\nORDER BY total_rides DESC;`,
    desc: 'Combined with COUNT — ride count + pickup list',
    detail: 'GROUP_CONCAT pairs naturally with other aggregates. Here each row shows the vehicle type ride count and the full pickup list, sorted by volume. This is a common reporting pattern.',
    result: {
      columns: ['vehicle_type', 'total_rides', 'pickup_points'],
      rows: [
        ['Auto', 3, 'CP, Navrangpura, Karol Bagh'],
        ['Bike', 3, 'Andheri, Bandra, Anna Nagar'],
        ['Cab', 2, 'Indiranagar, MG Road'],
      ],
    },
  },
];

export function GroupConcatPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 2500);
  const current = steps[step];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">GROUP_CONCAT</h1>
        <p className="text-sm text-text-secondary mt-1">
          GROUP_CONCAT is an aggregate function that collapses multiple rows into a single
          comma-separated string. It is available in SQLite and MySQL. PostgreSQL uses
          STRING_AGG(column, separator) for the same result.
        </p>
      </div>

      <div className="px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-mac">
        <p className="text-xs text-blue-600 dark:text-blue-400">
          <strong>Dialect note:</strong> GROUP_CONCAT is SQLite / MySQL syntax. In PostgreSQL use <code>STRING_AGG(column, ',')</code> instead. The playground below runs SQLite so GROUP_CONCAT works directly.
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
            <SqlTable table={rides} visibleColumns={[7, 4]} />
          </div>
        </MacWindow>
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <MacWindow title="Result">
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
          initialQuery={`SELECT vehicle_type,\n  COUNT(*) AS total_rides,\n  GROUP_CONCAT(start_location, ', ') AS pickup_points\nFROM rides\nGROUP BY vehicle_type\nORDER BY total_rides DESC;`}
          description="GROUP_CONCAT is fully supported here. Try grouping by origin_city from users, or combine with other aggregates like AVG(distance_km)."
        />
      </div>
    </div>
  );
}
