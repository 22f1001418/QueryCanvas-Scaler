import { QueryPlayground } from '../components/QueryPlayground';
import { useMemo } from 'react';
import { MacWindow } from '../components/MacWindow';
import { SqlTable, CellStyle } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { motion } from 'framer-motion';

// Each step shows the CTE accumulator growing one row at a time
const counterSteps = [
  {
    desc: 'Anchor member executes — seed row n = 1',
    highlightLines: [2],
    rows: [[1]] as (number | null)[][],
    newRowIdx: 0,
    stopped: false,
  },
  {
    desc: 'Iteration 1: n + 1 = 2  (1 < 5 ✓)',
    highlightLines: [4, 5, 6],
    rows: [[1], [2]] as (number | null)[][],
    newRowIdx: 1,
    stopped: false,
  },
  {
    desc: 'Iteration 2: n + 1 = 3  (2 < 5 ✓)',
    highlightLines: [4, 5, 6],
    rows: [[1], [2], [3]] as (number | null)[][],
    newRowIdx: 2,
    stopped: false,
  },
  {
    desc: 'Iteration 3: n + 1 = 4  (3 < 5 ✓)',
    highlightLines: [4, 5, 6],
    rows: [[1], [2], [3], [4]] as (number | null)[][],
    newRowIdx: 3,
    stopped: false,
  },
  {
    desc: 'Iteration 4: n + 1 = 5  (4 < 5 ✓)',
    highlightLines: [4, 5, 6],
    rows: [[1], [2], [3], [4], [5]] as (number | null)[][],
    newRowIdx: 4,
    stopped: false,
  },
  {
    desc: 'WHERE n < 5 fails for n = 5 — recursion stops, 5 rows returned',
    highlightLines: [6],
    rows: [[1], [2], [3], [4], [5]] as (number | null)[][],
    newRowIdx: -1,
    stopped: true,
  },
];

const COUNTER_SQL = `WITH RECURSIVE counter(n) AS (
  SELECT 1
  UNION ALL
  SELECT n + 1
  FROM counter
  WHERE n < 5
)
SELECT n FROM counter;`;

const FIB_SQL = `WITH RECURSIVE fib(n, a, b) AS (
  SELECT 0, 0, 1          -- anchor: n=0, a=0, b=1
  UNION ALL
  SELECT n + 1, b, a + b  -- carry state: shift a←b, b←a+b
  FROM fib
  WHERE n < 7
)
SELECT n, a AS fibonacci FROM fib;`;

const fibResult = {
  name: 'fib_result',
  columns: ['n', 'fibonacci'],
  rows: [
    [0, 0], [1, 1], [2, 1], [3, 2],
    [4, 3], [5, 5], [6, 8], [7, 13],
  ] as (number | null)[][],
};

const fibCellStyles: Record<string, CellStyle> = {};
fibResult.rows.forEach((_, ri) => {
  fibCellStyles[`${ri}-1`] = 'selected';
});

export function RecursiveCTEPage() {
  const { step, isPlaying, play, pause, reset, next, prev } =
    useAnimation(counterSteps.length - 1, 2800);
  const current = counterSteps[step];

  const cellStyles = useMemo<Record<string, CellStyle>>(() => {
    const styles: Record<string, CellStyle> = {};
    current.rows.forEach((_, ri) => {
      if (ri === current.newRowIdx) {
        styles[`${ri}-0`] = 'new';
      } else if (!current.stopped) {
        styles[`${ri}-0`] = 'selected';
      }
    });
    return styles;
  }, [step]);

  return (
    <div className="space-y-5">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-text-primary">Recursive CTEs</h1>
          <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-semibold">ADVANCED</span>
        </div>
        <p className="text-sm text-text-secondary mt-1">
          A CTE that references itself — each iteration feeds its output back as input until the
          stop condition returns no rows. Essential for sequences, hierarchies, and graph traversal.
        </p>
      </div>

      {/* ── How it works — 3 concept cards ──────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3 bg-surface-2 rounded-mac border border-surface-3">
          <div className="text-[11px] font-semibold text-accent uppercase tracking-wide mb-1">① Anchor member</div>
          <p className="text-[12px] text-text-secondary">
            The non-recursive <code className="font-mono">SELECT</code> that seeds the initial
            result set — runs exactly once.
          </p>
        </div>
        <div className="p-3 bg-surface-2 rounded-mac border border-surface-3">
          <div className="text-[11px] font-semibold text-accent uppercase tracking-wide mb-1">② Recursive member</div>
          <p className="text-[12px] text-text-secondary">
            References the CTE itself via <code className="font-mono">UNION ALL</code>.
            Each pass reads the previous pass's rows and produces new ones.
          </p>
        </div>
        <div className="p-3 bg-surface-2 rounded-mac border border-surface-3">
          <div className="text-[11px] font-semibold text-accent uppercase tracking-wide mb-1">③ Stop condition</div>
          <p className="text-[12px] text-text-secondary">
            A <code className="font-mono">WHERE</code> clause that eventually returns zero rows,
            halting the loop and preventing infinite recursion.
          </p>
        </div>
      </div>

      {/* ── Animation controls ──────────────────────────────────── */}
      <AnimationControls
        step={step} maxSteps={counterSteps.length - 1}
        isPlaying={isPlaying} onPlay={play} onPause={pause}
        onReset={reset} onNext={next} onPrev={prev}
        stepLabel={current.desc}
      />

      {/* ── Counter CTE — animated build-up ─────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <MacWindow title="Query — counter(n)" compact>
          <CodeBlock code={COUNTER_SQL} highlightLines={current.highlightLines} />
        </MacWindow>

        <motion.div key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <MacWindow title="CTE accumulator — rows built so far" compact>
            <div className="p-3">
              <div className="flex items-center gap-2 mb-3">
                {current.stopped ? (
                  <>
                    <span className="badge badge-success">{current.rows.length} rows — complete</span>
                    <span className="text-[11px] text-text-tertiary">WHERE n &lt; 5 failed → recursion halted</span>
                  </>
                ) : step === 0 ? (
                  <span className="badge badge-info">Anchor row seeded</span>
                ) : (
                  <>
                    <span className="badge badge-info">{current.rows.length} rows so far</span>
                    <span className="text-[11px] text-text-tertiary">↑ green row = newly added</span>
                  </>
                )}
              </div>

              <SqlTable
                table={{ name: 'counter', columns: ['n'], rows: current.rows }}
                cellStyles={cellStyles}
                animateRows
              />

              {/* Iteration label */}
              <div className="mt-3 pt-2 border-t border-surface-3 text-[11px] text-text-tertiary font-mono">
                {current.stopped
                  ? 'Final pass: WHERE n < 5 evaluated FALSE for n = 5  →  0 rows produced  →  STOP'
                  : step === 0
                  ? 'Pass 0 (anchor)  →  SELECT 1  →  produced 1 row'
                  : `Pass ${step} (recursive)  →  SELECT n + 1 FROM counter WHERE n < 5  →  produced 1 row`}
              </div>
            </div>
          </MacWindow>
        </motion.div>
      </div>

      {/* ── Fibonacci — static result showing state carry ────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <MacWindow title="Fibonacci — carrying two values of state" compact>
          <CodeBlock code={FIB_SQL} highlightLines={[2, 4]} />
        </MacWindow>

        <MacWindow title="Result — 8 Fibonacci terms" compact>
          <div className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <span className="badge badge-success">8 rows</span>
              <span className="badge badge-accent">fibonacci column highlighted</span>
            </div>
            <div className="mb-2 text-[11px] text-text-secondary">
              Each iteration shifts: <span className="font-mono text-text-primary">a ← b</span>,{' '}
              <span className="font-mono text-text-primary">b ← a + b</span>.
              The two extra state columns are hidden in the final SELECT.
            </div>
            <SqlTable
              table={fibResult}
              cellStyles={fibCellStyles}
              animateRows
            />
          </div>
        </MacWindow>
      </div>

      {/* ── Hierarchy hint ───────────────────────────────────────── */}
      <div className="p-4 bg-accent/5 border border-accent/20 rounded-mac text-sm">
        <div className="font-semibold text-text-primary mb-1">Practical use case — org charts &amp; category trees</div>
        <div className="text-[12px] text-text-secondary font-mono bg-surface-2 rounded p-2 mt-1">
          {`WITH RECURSIVE org AS (\n  SELECT id, name, manager_id, 1 AS level\n  FROM employees WHERE manager_id IS NULL   -- root nodes\n  UNION ALL\n  SELECT e.id, e.name, e.manager_id, o.level + 1\n  FROM employees e JOIN org o ON e.manager_id = o.id\n)\nSELECT level, name FROM org ORDER BY level, name;`}
        </div>
        <p className="text-[12px] text-text-secondary mt-2">
          Anchor: top-level row (no manager). Recursive member: employees whose manager is already
          in the CTE. Result: entire hierarchy with depth level.
        </p>
      </div>

      {/* ── Playground ───────────────────────────────────────────── */}
      <QueryPlayground
        initialQuery={`WITH RECURSIVE counter(n) AS (\n  SELECT 1\n  UNION ALL\n  SELECT n + 1 FROM counter WHERE n < 10\n)\nSELECT n FROM counter;`}
      />

    </div>
  );
}
