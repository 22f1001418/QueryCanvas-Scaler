import { useMemo } from 'react';
import { MacWindow } from '../components/MacWindow';
import { SqlTable, CellStyle } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { rides } from '../data/sampleData';
import { QueryPlayground } from '../components/QueryPlayground';
import { motion } from 'framer-motion';

const sortSteps = [
  {
    sql: `SELECT start_location, distance_km\nFROM rides\nORDER BY distance_km ASC;`,
    desc: 'Sort by distance ascending',
    detail: 'ASC (ascending) arranges values from smallest to largest. The shortest ride (6.8 km) appears first, the longest (18.4 km) last.',
    sortFn: (a: (string|number|null)[], b: (string|number|null)[]) => (a[6] as number) - (b[6] as number),
    highlightCol: 6,
  },
  {
    sql: `SELECT start_location, distance_km\nFROM rides\nORDER BY distance_km DESC;`,
    desc: 'Sort by distance descending',
    detail: 'DESC (descending) arranges values from largest to smallest. The longest ride (18.4 km) appears first, the shortest (6.8 km) last.',
    sortFn: (a: (string|number|null)[], b: (string|number|null)[]) => (b[6] as number) - (a[6] as number),
    highlightCol: 6,
  },
  {
    sql: `SELECT vehicle_type, distance_km\nFROM rides\nORDER BY vehicle_type ASC,\n         distance_km DESC;`,
    desc: 'Multi-column sort',
    detail: 'Multiple ORDER BY columns create a hierarchy. First sort by vehicle type A-Z, then within each type sort by distance highest to lowest.',
    sortFn: (a: (string|number|null)[], b: (string|number|null)[]) => {
      const vtCmp = (a[7] as string).localeCompare(b[7] as string);
      if (vtCmp !== 0) return vtCmp;
      return (b[6] as number) - (a[6] as number);
    },
    highlightCol: 7,
  },
  {
    sql: `SELECT start_location, start_time\nFROM rides\nORDER BY start_time ASC;`,
    desc: 'Sort by timestamp ascending',
    detail: 'ORDER BY works with timestamps too. Rides are sorted chronologically — the earliest ride (2024-01-10 08:30) comes first, the latest (2024-01-16 09:00) last.',
    sortFn: (a: (string|number|null)[], b: (string|number|null)[]) =>
      new Date(a[2] as string).getTime() - new Date(b[2] as string).getTime(),
    highlightCol: 2,
  },
];

export function OrderByPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(sortSteps.length - 1, 2500);
  const current = sortSteps[step];

  const sortedIndices = useMemo(() => {
    const indexed = rides.rows.map((row, i) => ({ row, i }));
    indexed.sort((a, b) => current.sortFn(a.row, b.row));
    return indexed.map((x) => x.i);
  }, [step]);

  const cellStyles = useMemo(() => {
    const styles: Record<string, CellStyle> = {};
    rides.rows.forEach((_, ri) => {
      styles[`${ri}-${current.highlightCol}`] = 'selected';
    });
    return styles;
  }, [step]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">ORDER BY</h1>
        <p className="text-sm text-text-secondary mt-1">
          Sort result sets by one or more columns in ascending (A→Z, 0→9) or descending (Z→A, 9→0) order. ORDER BY is
          commonly used with numeric, text, and date columns. Combined with LIMIT, it lets you find "top 10" or "bottom 5" results.
        </p>
      </div>

      <AnimationControls
        step={step} maxSteps={sortSteps.length - 1}
        isPlaying={isPlaying} onPlay={play} onPause={pause}
        onReset={reset} onNext={next} onPrev={prev}
        stepLabel={current.desc}
      />

      {/* Concept explanation */}
      <div className="p-3 bg-surface-2 rounded-mac border border-border">
        <p className="text-sm text-text-primary">{current.detail}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <MacWindow title="Query" compact>
          <CodeBlock code={current.sql} highlightLines={[3, 4]} />
        </MacWindow>

        <MacWindow title="rides — original order" compact>
          <div className="p-3">
            <SqlTable table={rides} cellStyles={cellStyles} />
          </div>
        </MacWindow>
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <MacWindow title="Result — sorted">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-info">
                {current.desc}
              </span>
            </div>
            <SqlTable
              table={rides}
              visibleRows={sortedIndices}
              highlightColumns={[current.highlightCol]}
              animateRows
            />
          </div>
        </MacWindow>
      </motion.div>

      {/* Query Playground */}
      <div className="mt-8 pt-6 border-t border-border">
        <QueryPlayground
          initialQuery="SELECT start_location, distance_km FROM rides ORDER BY distance_km DESC;"
          description="Write your own ORDER BY queries. Try sorting by different columns with ASC/DESC, combine multiple columns, or sort by timestamps!"
        />
      </div>
    </div>
  );
}
