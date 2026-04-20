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
    sql: `SELECT vehicle_type\nFROM rides;`,
    desc: 'Without DISTINCT — duplicates included',
    detail: 'A plain SELECT returns every row, including duplicates. With 8 rides across 3 vehicle types, "Bike" appears 3 times and "Auto" appears 3 times.',
    result: {
      columns: ['vehicle_type'],
      rows: [
        ['Bike'], ['Auto'], ['Cab'],
        ['Bike'], ['Auto'], ['Cab'],
        ['Auto'], ['Bike'],
      ],
    },
    badge: '8 rows',
  },
  {
    sql: `SELECT DISTINCT vehicle_type\nFROM rides;`,
    desc: 'DISTINCT — unique values only',
    detail: 'DISTINCT removes duplicate rows from the result. Each vehicle type appears exactly once, reducing 8 rows to 3. The order is not guaranteed without ORDER BY.',
    result: {
      columns: ['vehicle_type'],
      rows: [['Bike'], ['Auto'], ['Cab']],
    },
    badge: '3 rows',
  },
  {
    sql: `SELECT DISTINCT vehicle_type,\n       user_id\nFROM rides;`,
    desc: 'DISTINCT on multiple columns',
    detail: 'DISTINCT applies to the entire row — all selected columns together. Here we get unique (vehicle_type, user_id) combinations. A vehicle type appears multiple times if different users booked it.',
    result: {
      columns: ['vehicle_type', 'user_id'],
      rows: [
        ['Bike', 1], ['Auto', 2], ['Cab', 3],
        ['Auto', 4], ['Cab', 5], ['Bike', 6],
      ],
    },
    badge: '6 rows',
  },
  {
    sql: `SELECT\n  COUNT(*)           AS total_rides,\n  COUNT(DISTINCT vehicle_type)\n                     AS unique_vehicle_types\nFROM rides;`,
    desc: 'COUNT(DISTINCT ...) — count unique values',
    detail: 'DISTINCT can be used inside aggregate functions. COUNT(DISTINCT vehicle_type) counts how many unique vehicle types exist, regardless of how many rides used each type.',
    result: {
      columns: ['total_rides', 'unique_vehicle_types'],
      rows: [[8, 3]],
    },
    badge: '1 row',
  },
];

export function DistinctPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 2500);
  const current = steps[step];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">DISTINCT</h1>
        <p className="text-sm text-text-secondary mt-1">
          DISTINCT eliminates duplicate rows from query results. It applies to the full combination of
          selected columns — not just one. It can also be used inside aggregate functions like
          COUNT(DISTINCT ...) to count unique values.
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
            <SqlTable table={rides} visibleColumns={[4, 7, 1]} />
          </div>
        </MacWindow>
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <MacWindow title="Result">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-info">{current.badge}</span>
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
          initialQuery="SELECT DISTINCT vehicle_type FROM rides ORDER BY vehicle_type;"
          description="Try DISTINCT on different columns — vehicle_type, origin_city from users. Also try COUNT(DISTINCT ...) inside an aggregate."
        />
      </div>
    </div>
  );
}
