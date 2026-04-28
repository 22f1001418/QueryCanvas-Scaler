import { MacWindow } from '../components/MacWindow';
import { SqlTable } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { QueryPlayground } from '../components/QueryPlayground';
import { motion } from 'framer-motion';

// rides start_locations: Andheri, CP, Indiranagar, Bandra, Navrangpura, MG Road, Karol Bagh, Anna Nagar
// rides end_locations:   Bandra, Lajpat Nagar, Whitefield, Andheri, Vastrapur, Fort Kochi, Dwarka, T Nagar
// Andheri & Bandra appear in BOTH columns → duplicates when combined.

const startsTable = {
  name: 'starts',
  columns: ['location'],
  rows: [
    ['Andheri'], ['CP'], ['Indiranagar'], ['Bandra'],
    ['Navrangpura'], ['MG Road'], ['Karol Bagh'], ['Anna Nagar'],
  ] as (string | number | null)[][],
};

const endsTable = {
  name: 'ends',
  columns: ['location'],
  rows: [
    ['Bandra'], ['Lajpat Nagar'], ['Whitefield'], ['Andheri'],
    ['Vastrapur'], ['Fort Kochi'], ['Dwarka'], ['T Nagar'],
  ] as (string | number | null)[][],
};

const steps = [
  {
    sql: `-- UNION: combine + remove duplicates\nSELECT start_location AS location FROM rides\nUNION\nSELECT end_location FROM rides;`,
    desc: 'UNION — distinct combined rows',
    detail: "UNION stacks the two result sets vertically, then removes duplicates. 'Andheri' appears in both starts and ends — it shows up once. 'Bandra' too. 8 + 8 = 16 rows go in, 14 distinct rows come out.",
    badge: 'Removes duplicates',
    badgeClass: 'badge-info',
    result: {
      cols: ['location'],
      rows: [
        ['Andheri'], ['CP'], ['Indiranagar'], ['Bandra'],
        ['Navrangpura'], ['MG Road'], ['Karol Bagh'], ['Anna Nagar'],
        ['Lajpat Nagar'], ['Whitefield'], ['Vastrapur'], ['Fort Kochi'],
        ['Dwarka'], ['T Nagar'],
      ],
    },
    note: '14 distinct rows (16 input − 2 duplicates)',
  },
  {
    sql: `-- UNION ALL: combine + keep everything\nSELECT start_location AS location FROM rides\nUNION ALL\nSELECT end_location FROM rides;`,
    desc: 'UNION ALL — keep every row including duplicates',
    detail: "UNION ALL skips the deduplication step — it just concatenates the two result sets. Andheri and Bandra each appear twice. 16 rows in, 16 rows out. Faster than UNION because the database doesn't have to sort or hash to find duplicates.",
    badge: 'Keeps duplicates · faster',
    badgeClass: 'badge-success',
    result: {
      cols: ['location'],
      rows: [
        ['Andheri'], ['CP'], ['Indiranagar'], ['Bandra'],
        ['Navrangpura'], ['MG Road'], ['Karol Bagh'], ['Anna Nagar'],
        ['Bandra'], ['Lajpat Nagar'], ['Whitefield'], ['Andheri'],
        ['Vastrapur'], ['Fort Kochi'], ['Dwarka'], ['T Nagar'],
      ],
    },
    note: '16 rows (all 8 + 8, no dedup)',
  },
  {
    sql: `-- Tag each row with its source — a common pattern\nSELECT start_location AS location, 'start' AS source\nFROM rides\nUNION ALL\nSELECT end_location, 'end'\nFROM rides\nORDER BY location;`,
    desc: 'Tagged UNION ALL — combining sources',
    detail: "A real-world use of UNION ALL: combine rows from multiple sources and add a constant column to identify which source each row came from. Use UNION ALL here (not UNION) because every row is genuinely distinct once the tag is added — and you want to keep them all.",
    badge: 'With source tag',
    badgeClass: 'badge-success',
    result: {
      cols: ['location', 'source'],
      rows: [
        ['Andheri', 'start'], ['Andheri', 'end'], ['Anna Nagar', 'start'],
        ['Bandra', 'start'], ['Bandra', 'end'], ['CP', 'start'],
        ['Dwarka', 'end'], ['Fort Kochi', 'end'], ['Indiranagar', 'start'],
        ['Karol Bagh', 'start'], ['Lajpat Nagar', 'end'], ['MG Road', 'start'],
        ['Navrangpura', 'start'], ['T Nagar', 'end'], ['Vastrapur', 'end'],
        ['Whitefield', 'end'],
      ],
    },
    note: '16 rows · sorted by location',
  },
];

export function UnionPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 3500);
  const current = steps[step];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">UNION / UNION ALL</h1>
        <p className="text-sm text-text-secondary mt-1">
          UNION and UNION ALL combine the rows of two SELECTs vertically — same columns,
          stacked into one result. UNION removes duplicates; UNION ALL keeps them. Both
          require the queries to return the same number of columns with compatible types.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-mac px-3 py-2">
          <p className="font-semibold text-blue-600 dark:text-blue-400 mb-1">UNION</p>
          <p className="text-text-secondary">Combines + removes duplicates</p>
          <p className="text-text-secondary">Slower (must dedupe)</p>
          <p className="text-text-secondary">Use when uniqueness matters</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-mac px-3 py-2">
          <p className="font-semibold text-emerald-600 dark:text-emerald-400 mb-1">UNION ALL</p>
          <p className="text-text-secondary">Combines + keeps every row</p>
          <p className="text-text-secondary">Faster (no dedup work)</p>
          <p className="text-text-secondary">Default choice when sets are already disjoint</p>
        </div>
      </div>

      <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-mac">
        <p className="text-xs text-amber-700 dark:text-amber-400">
          <strong>Rules:</strong> both SELECTs must return the same <strong>number of columns</strong> in the same
          order, with <strong>compatible types</strong>. Column names come from the first SELECT.
          A single <code className="px-1 rounded bg-surface-2">ORDER BY</code> applies to the whole combined result and goes at the very end.
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MacWindow title="starts (from rides.start_location)" compact>
          <div className="p-3">
            <SqlTable table={startsTable} />
          </div>
        </MacWindow>
        <MacWindow title="ends (from rides.end_location)" compact>
          <div className="p-3">
            <SqlTable table={endsTable} />
          </div>
        </MacWindow>
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <MacWindow title="Result">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className={`badge ${current.badgeClass}`}>{current.badge}</span>
              <span className="text-[11px] text-text-tertiary">{current.note}</span>
            </div>
            <SqlTable
              table={{ name: 'result', columns: current.result.cols, rows: current.result.rows }}
              animateRows
            />
          </div>
        </MacWindow>
      </motion.div>

      <div className="mt-8 pt-6 border-t border-border">
        <QueryPlayground
          initialQuery={`SELECT start_location AS location FROM rides\nUNION\nSELECT end_location FROM rides\nORDER BY location;`}
          description="Try swapping UNION ↔ UNION ALL and watch the row count change. Add a tag column with a literal string to identify the source."
        />
      </div>
    </div>
  );
}
