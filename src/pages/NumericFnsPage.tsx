import { QueryPlayground } from '../components/QueryPlayground';
import { MacWindow } from '../components/MacWindow';
import { SqlTable } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { motion } from 'framer-motion';

const numTable = {
  name: 'rides',
  columns: ['ride_id', 'start_location', 'distance_km', 'captain_rating'],
  rows: [
    [101, 'Andheri', 8.5671, 4.8],
    [102, 'CP', 12.3428, 4.5],
    [103, 'Indiranagar', 15.7893, 4.9],
    [104, 'Bandra', 7.2345, 4.3],
    [105, 'Navrangpura', 6.8912, 4.1],
  ] as (string | number | null)[][],
};

const steps = [
  {
    sql: `SELECT start_location, distance_km,\n  ROUND(distance_km, 1) AS r1,\n  ROUND(distance_km, 0) AS r0\nFROM rides;`,
    desc: 'ROUND — control decimal places',
    result: {
      columns: ['start_location', 'distance_km', 'r1', 'r0'],
      rows: [
        ['Andheri', 8.5671, 8.6, 9],
        ['CP', 12.3428, 12.3, 12],
        ['Indiranagar', 15.7893, 15.8, 16],
        ['Bandra', 7.2345, 7.2, 7],
        ['Navrangpura', 6.8912, 6.9, 7],
      ],
    },
  },
  {
    sql: `SELECT start_location, distance_km,\n  CEIL(distance_km)  AS ceiling,\n  FLOOR(distance_km) AS floored\nFROM rides;`,
    desc: 'CEIL & FLOOR — rounding direction',
    result: {
      columns: ['start_location', 'distance_km', 'ceiling', 'floored'],
      rows: [
        ['Andheri', 8.5671, 9, 8],
        ['CP', 12.3428, 13, 12],
        ['Indiranagar', 15.7893, 16, 15],
        ['Bandra', 7.2345, 8, 7],
        ['Navrangpura', 6.8912, 7, 6],
      ],
    },
  },
  {
    sql: `SELECT start_location, captain_rating,\n  ABS(captain_rating - 4.5) AS deviation\nFROM rides;`,
    desc: 'ABS — absolute value',
    result: {
      columns: ['start_location', 'captain_rating', 'deviation'],
      rows: [
        ['Andheri', 4.8, 0.3],
        ['CP', 4.5, 0.0],
        ['Indiranagar', 4.9, 0.4],
        ['Bandra', 4.3, 0.2],
        ['Navrangpura', 4.1, 0.4],
      ],
    },
  },
  {
    sql: `SELECT ride_id,\n  MOD(ride_id, 2)          AS is_odd,\n  POWER(ride_id - 100, 2)  AS squared,\n  ROUND(SQRT(distance_km), 3)\n    AS sqrt_dist\nFROM rides;`,
    desc: 'MOD, POWER, SQRT',
    result: {
      columns: ['ride_id', 'is_odd', 'squared', 'sqrt_dist'],
      rows: [
        [101, 1, 1, 2.928],
        [102, 0, 4, 3.513],
        [103, 1, 9, 3.974],
        [104, 0, 16, 2.690],
        [105, 1, 25, 2.625],
      ],
    },
  },
];

export function NumericFnsPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 2500);
  const current = steps[step];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Numeric Functions</h1>
        <p className="text-sm text-text-secondary mt-1">
          Mathematical transformations — rounding, absolute values, modulo, powers, and roots.
        </p>
      </div>

      <AnimationControls step={step} maxSteps={steps.length - 1} isPlaying={isPlaying}
        onPlay={play} onPause={pause} onReset={reset} onNext={next} onPrev={prev}
        stepLabel={current.desc} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <MacWindow title="Query" compact>
          <CodeBlock code={current.sql} />
        </MacWindow>
        <MacWindow title="rides — source" compact>
          <div className="p-3">
            <SqlTable table={numTable} />
          </div>
        </MacWindow>
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <MacWindow title="Result">
          <div className="p-3">
            <SqlTable
              table={{ name: 'r', columns: current.result.columns, rows: current.result.rows }}
              animateRows
            />
          </div>
        </MacWindow>
      </motion.div>

      {/* Try it yourself */}
      <QueryPlayground
        initialQuery="SELECT start_location, ROUND(distance_km, 1) AS rounded, ABS(captain_rating - 4.5) AS deviation FROM rides;"
      />

    </div>
  );
}
