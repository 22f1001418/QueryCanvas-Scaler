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
    sql: `SELECT start_location, distance_km\nFROM rides\nLIMIT 3;`,
    desc: 'LIMIT — return only first 3 rows',
    detail: 'LIMIT caps how many rows the database returns. Without ORDER BY the order is not guaranteed, but LIMIT still stops at the specified count. Here we get the first 3 rows as stored.',
    visibleRows: [0, 1, 2],
    highlightLines: [3],
  },
  {
    sql: `SELECT start_location, distance_km\nFROM rides\nORDER BY distance_km DESC\nLIMIT 3;`,
    desc: 'ORDER BY + LIMIT — longest 3 rides',
    detail: 'Combining ORDER BY with LIMIT is the standard pattern for "top-N" queries. Sort by distance_km descending first, then LIMIT 3 keeps only the three longest rides.',
    visibleRows: [6, 2, 1],
    highlightLines: [3, 4],
  },
  {
    sql: `SELECT start_location, distance_km\nFROM rides\nORDER BY distance_km DESC\nOFFSET 3;`,
    desc: 'OFFSET — skip the first 3 rows',
    detail: 'OFFSET skips a number of rows before returning results. After sorting by distance_km DESC, OFFSET 3 skips Karol Bagh, Indiranagar, and CP — the three longest rides — and returns everyone else.',
    visibleRows: [7, 5, 0, 3, 4],
    highlightLines: [3, 4],
  },
  {
    sql: `SELECT start_location, distance_km\nFROM rides\nORDER BY distance_km DESC\nLIMIT 3 OFFSET 3;`,
    desc: 'LIMIT + OFFSET — page 2 of results',
    detail: 'Together, LIMIT and OFFSET enable pagination. OFFSET 3 skips page 1 (rows 1-3) and LIMIT 3 returns the next 3 rows (rows 4-6). This is the classic pattern for paginated APIs.',
    visibleRows: [7, 5, 0],
    highlightLines: [3, 4],
  },
];

const sortedByDistance = [...rides.rows]
  .map((row, i) => ({ row, i }))
  .sort((a, b) => (b.row[6] as number) - (a.row[6] as number))
  .map((x) => x.i);

export function LimitOffsetPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 2500);
  const current = steps[step];

  const usesSorting = step >= 1;
  const displayRows = usesSorting ? sortedByDistance : rides.rows.map((_, i) => i);
  const visibleRows = current.visibleRows;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">LIMIT & OFFSET</h1>
        <p className="text-sm text-text-secondary mt-1">
          LIMIT restricts how many rows are returned. OFFSET skips a specified number of rows before
          returning results. Together they power pagination — the "next page" pattern used in every
          list API and search result.
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
          <CodeBlock code={current.sql} highlightLines={current.highlightLines} />
        </MacWindow>

        <MacWindow title={usesSorting ? 'rides — sorted by distance_km DESC' : 'rides'} compact>
          <div className="p-3">
            <SqlTable
              table={rides}
              visibleRows={displayRows}
              highlightColumns={[6]}
            />
          </div>
        </MacWindow>
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <MacWindow title={`Result — ${current.desc}`}>
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-info">{visibleRows.length} row{visibleRows.length !== 1 ? 's' : ''} returned</span>
            </div>
            <SqlTable
              table={rides}
              visibleColumns={[4, 6]}
              visibleRows={visibleRows}
              highlightColumns={[6]}
              animateRows
            />
          </div>
        </MacWindow>
      </motion.div>

      <div className="mt-8 pt-6 border-t border-border">
        <QueryPlayground
          initialQuery="SELECT start_location, distance_km FROM rides ORDER BY distance_km DESC LIMIT 3 OFFSET 3;"
          description="Experiment with LIMIT and OFFSET. Try different page sizes, starting positions, or combine with ORDER BY to paginate sorted results."
        />
      </div>
    </div>
  );
}
