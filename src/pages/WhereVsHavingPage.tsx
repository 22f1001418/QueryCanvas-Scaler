import { useMemo } from 'react';
import { MacWindow } from '../components/MacWindow';
import { SqlTable, CellStyle } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { employees } from '../data/sampleData';
import { QueryPlayground } from '../components/QueryPlayground';
import { motion } from 'framer-motion';

// employees rows: Alice(Eng,95k), Bob(Eng,88k), Carol(Mkt,72k), Dave(Mkt,68k),
//                Eve(Sales,78k), Frank(Sales,65k), Grace(Eng,102k), Hank(HR,71k)

const steps = [
  {
    sql: `-- WHERE filters individual rows\n-- before any grouping happens\nSELECT department, COUNT(*) AS cnt\nFROM employees\nWHERE salary > 75000\nGROUP BY department;`,
    desc: 'WHERE — filters rows before grouping',
    detail: 'WHERE runs before GROUP BY. Rows where salary ≤ 75,000 are discarded first (Carol 72k, Dave 68k, Frank 65k, Hank 71k). The surviving 4 rows are then grouped. Marketing and HR disappear entirely because all their members were removed.',
    phase: 'where' as const,
    keptRows: [0, 1, 4, 6],     // Alice, Bob, Eve, Grace
    removedRows: [2, 3, 5, 7],  // Carol, Dave, Frank, Hank
    result: {
      columns: ['department', 'cnt'],
      rows: [['Engineering', 3], ['Sales', 1]],
    },
  },
  {
    sql: `-- HAVING filters groups\n-- after aggregation is complete\nSELECT department, COUNT(*) AS cnt\nFROM employees\nGROUP BY department\nHAVING COUNT(*) > 1;`,
    desc: 'HAVING — filters groups after aggregation',
    detail: 'HAVING runs after GROUP BY. All 8 rows are grouped first, producing 4 department groups. HAVING then removes groups where the member count is not > 1. HR (count=1) is filtered out; the other three departments survive.',
    phase: 'having' as const,
    keptRows: [0, 1, 2, 3, 4, 5, 6, 7], // all rows included in grouping
    removedRows: [],
    result: {
      columns: ['department', 'cnt'],
      rows: [['Engineering', 3], ['Marketing', 2], ['Sales', 2]],
    },
  },
  {
    sql: `-- ❌ Wrong: WHERE cannot use aggregates\nSELECT department, AVG(salary) AS avg_sal\nFROM employees\nGROUP BY department\nWHERE AVG(salary) > 75000; -- ERROR`,
    desc: '❌ Common mistake — WHERE on an aggregate',
    detail: 'WHERE is evaluated before aggregation, so aggregate functions like AVG() don\'t exist yet at that stage. This query throws an error. To filter on aggregate results, you must use HAVING.',
    phase: 'error' as const,
    keptRows: [] as number[],
    removedRows: [] as number[],
    result: {
      columns: ['error'],
      rows: [['misuse of aggregate function AVG()']],
    },
  },
  {
    sql: `-- ✅ Correct: HAVING filters on the aggregate\nSELECT department, AVG(salary) AS avg_sal\nFROM employees\nGROUP BY department\nHAVING AVG(salary) > 75000;`,
    desc: '✅ Correct — HAVING on the aggregate',
    detail: 'HAVING runs after aggregation, so AVG(salary) is available. Departments with average salary ≤ 75,000 (Marketing 70k, Sales 71.5k, HR 71k) are removed. Only Engineering (95k average) survives.',
    phase: 'having' as const,
    keptRows: [0, 1, 2, 3, 4, 5, 6, 7],
    removedRows: [],
    result: {
      columns: ['department', 'avg_sal'],
      rows: [['Engineering', 95000]],
    },
  },
  {
    sql: `-- WHERE and HAVING work together\nSELECT department,\n       COUNT(*)    AS cnt,\n       AVG(salary) AS avg_sal\nFROM employees\nWHERE salary > 68000       -- row filter\nGROUP BY department\nHAVING COUNT(*) >= 2;      -- group filter`,
    desc: 'WHERE + HAVING together — execution order',
    detail: 'Both can appear in the same query. Execution order: (1) WHERE removes rows with salary ≤ 68k (Dave 68k excluded, Frank 65k excluded). (2) GROUP BY groups the rest. (3) HAVING keeps only groups with ≥ 2 members. HR (Hank alone) is removed.',
    phase: 'both' as const,
    keptRows: [0, 1, 2, 4, 6, 7],   // Alice, Bob, Carol, Eve, Grace, Hank
    removedRows: [3, 5],              // Dave, Frank
    result: {
      columns: ['department', 'cnt', 'avg_sal'],
      rows: [['Engineering', 3, 95000], ['Marketing', 1, 72000], ['Sales', 1, 78000]],
    },
  },
];

const deptColors: Record<string, CellStyle> = {
  Engineering: 'join-left',
  Marketing: 'join-right',
  Sales: 'join-match',
  HR: 'highlight',
};

export function WhereVsHavingPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 3000);
  const current = steps[step];

  const cellStyles = useMemo(() => {
    const styles: Record<string, CellStyle> = {};
    if (current.phase === 'error') return styles;

    employees.rows.forEach((row, ri) => {
      const isRemoved = current.removedRows.includes(ri);
      employees.columns.forEach((_, ci) => {
        if (isRemoved) {
          styles[`${ri}-${ci}`] = 'removed';
        } else {
          const dept = row[2] as string;
          styles[`${ri}-${ci}`] = deptColors[dept] ?? 'selected';
        }
      });
    });
    return styles;
  }, [step]);

  const isError = current.phase === 'error';

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">WHERE vs. HAVING</h1>
        <p className="text-sm text-text-secondary mt-1">
          WHERE and HAVING both filter rows, but at different stages. WHERE filters individual rows
          before grouping — it cannot reference aggregates. HAVING filters groups after aggregation —
          it can only reference aggregate results or GROUP BY columns.
        </p>
      </div>

      {/* Execution order reference card */}
      <div className="flex items-center gap-2 flex-wrap text-xs font-mono bg-surface-2 border border-border rounded-mac px-4 py-2">
        {['FROM', '→ WHERE', '→ GROUP BY', '→ HAVING', '→ SELECT', '→ ORDER BY'].map((s) => (
          <span
            key={s}
            className={
              s.includes('WHERE')
                ? 'text-amber-500 font-semibold'
                : s.includes('HAVING')
                ? 'text-blue-500 font-semibold'
                : 'text-text-secondary'
            }
          >
            {s}
          </span>
        ))}
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

        <MacWindow title="employees — row-level view" compact>
          <div className="p-3">
            {isError ? (
              <div className="text-sm text-text-secondary italic p-4 text-center">
                Query fails before touching the table — WHERE on an aggregate is a syntax error.
              </div>
            ) : (
              <>
                {current.removedRows.length > 0 && (
                  <p className="text-xs text-text-secondary mb-2">
                    <span className="text-amber-500 font-semibold">Greyed out</span> = removed by WHERE before grouping
                  </p>
                )}
                <SqlTable table={employees} cellStyles={cellStyles} />
              </>
            )}
          </div>
        </MacWindow>
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <MacWindow title="Result">
          <div className="p-3">
            {isError ? (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-mac">
                <span className="text-red-500 font-mono text-sm">ERROR: {current.result.rows[0][0]}</span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge badge-success">{current.result.rows.length} group{current.result.rows.length !== 1 ? 's' : ''}</span>
                </div>
                <SqlTable
                  table={{ name: 'result', columns: current.result.columns, rows: current.result.rows }}
                  animateRows
                />
              </>
            )}
          </div>
        </MacWindow>
      </motion.div>

      <div className="mt-8 pt-6 border-t border-border">
        <QueryPlayground
          initialQuery={`SELECT department, COUNT(*) AS cnt, AVG(salary) AS avg_sal\nFROM employees\nWHERE salary > 68000\nGROUP BY department\nHAVING COUNT(*) >= 2;`}
          description="Try moving a condition between WHERE and HAVING to see the difference. Try using an aggregate in WHERE to see the error, then move it to HAVING to fix it."
        />
      </div>
    </div>
  );
}
