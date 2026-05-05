import { useMemo } from 'react';
import { MacWindow } from '../components/MacWindow';
import { SqlTable, CellStyle } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { QueryPlayground } from '../components/QueryPlayground';
import { motion } from 'framer-motion';

const employees = {
  name: 'employees',
  columns: ['id', 'name', 'dept_id'],
  rows: [
    [1, 'Alice', 1],
    [2, 'Bob', 1],
    [3, 'Carol', 2],
    [4, 'Dave', 3],
    [5, 'Eve', null],
  ] as (string | number | null)[][],
};

const departments = {
  name: 'departments',
  columns: ['id', 'dept_name'],
  rows: [
    [1, 'Engineering'],
    [2, 'Marketing'],
    [3, 'Sales'],
    [4, 'Finance'],
  ] as (string | number | null)[][],
};

const steps = [
  {
    sql: `-- FULL OUTER JOIN: keep every row from BOTH sides\nSELECT e.name, d.dept_name\nFROM employees e\nFULL OUTER JOIN departments d\n  ON e.dept_id = d.id;`,
    desc: 'Basic FULL OUTER JOIN — every row from both sides',
    detail: "FULL OUTER is the union of LEFT and RIGHT JOIN behaviour: nobody gets dropped. The 4 matched pairs come through, plus Eve (left-only, NULL on the right) and Finance (right-only, NULL on the left). 6 rows total — every employee and every department appears exactly once.",
    leftMatched: [0, 1, 2, 3, 4],
    rightMatched: [0, 1, 2, 3],
    result: { cols: ['name', 'dept_name'], rows: [
      ['Alice', 'Engineering'], ['Bob', 'Engineering'],
      ['Carol', 'Marketing'], ['Dave', 'Sales'],
      ['Eve', null],
      [null, 'Finance'],
    ]},
    badge: '6 rows · 4 matched + 2 unmatched',
  },
  {
    sql: `-- Find unmatched rows on EITHER side\nSELECT e.name, d.dept_name\nFROM employees e\nFULL OUTER JOIN departments d\n  ON e.dept_id = d.id\nWHERE e.id IS NULL\n   OR d.id IS NULL;`,
    desc: 'Find all unmatched — WHERE either side IS NULL',
    detail: "FULL OUTER + WHERE 'either-side IS NULL' surfaces exactly the rows that didn't match. Useful for data-quality audits: which employees lack a valid department, and which departments have nobody assigned. Both answers in one query.",
    leftMatched: [4],
    rightMatched: [3],
    result: { cols: ['name', 'dept_name'], rows: [
      ['Eve', null],
      [null, 'Finance'],
    ]},
    badge: 'All orphans on both sides',
  },
  {
    sql: `-- MySQL has no FULL OUTER JOIN — emulate with UNION:\nSELECT e.name, d.dept_name\nFROM employees e\nLEFT JOIN departments d\n  ON e.dept_id = d.id\nUNION\nSELECT e.name, d.dept_name\nFROM employees e\nRIGHT JOIN departments d\n  ON e.dept_id = d.id;`,
    desc: 'MySQL workaround — UNION of LEFT + RIGHT',
    detail: "PostgreSQL, SQL Server, Oracle support FULL OUTER JOIN natively. MySQL does not — you emulate it with a LEFT JOIN UNION RIGHT JOIN. UNION (not UNION ALL) deduplicates the matched rows that would otherwise appear in both halves. Same 6-row result.",
    leftMatched: [0, 1, 2, 3, 4],
    rightMatched: [0, 1, 2, 3],
    result: { cols: ['name', 'dept_name'], rows: [
      ['Alice', 'Engineering'], ['Bob', 'Engineering'],
      ['Carol', 'Marketing'], ['Dave', 'Sales'],
      ['Eve', null],
      [null, 'Finance'],
    ]},
    badge: 'Same 6 rows · MySQL-compatible',
  },
];

export function FullOuterJoinPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 3500);
  const current = steps[step];

  const leftStyles = useMemo(() => {
    const styles: Record<string, CellStyle> = {};
    employees.rows.forEach((_, ri) => {
      const matched = current.leftMatched.includes(ri);
      employees.columns.forEach((_, ci) => {
        styles[`${ri}-${ci}`] = matched ? 'join-left' : 'removed';
      });
    });
    return styles;
  }, [step]);

  const rightStyles = useMemo(() => {
    const styles: Record<string, CellStyle> = {};
    departments.rows.forEach((_, ri) => {
      const matched = current.rightMatched.includes(ri);
      departments.columns.forEach((_, ci) => {
        styles[`${ri}-${ci}`] = matched ? 'join-right' : 'removed';
      });
    });
    return styles;
  }, [step]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">FULL OUTER JOIN</h1>
        <p className="text-sm text-text-secondary mt-1">
          FULL OUTER JOIN keeps every row from both tables. Matched pairs come through with
          data from both sides; unmatched rows from either side come through with NULLs filled
          in for the missing side. It's LEFT JOIN ∪ RIGHT JOIN.
        </p>
      </div>

      <div className="px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-mac">
        <p className="text-xs text-purple-600 dark:text-purple-400">
          <strong>Mental model:</strong> the union of both tables on the join key — nothing dropped.
          Most useful for data-quality audits: "show me everything, especially what didn't match."
          Note: MySQL does not support it natively — emulate with LEFT JOIN UNION RIGHT JOIN.
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
        <CodeBlock code={current.sql} highlightLines={[3, 4]} />
      </MacWindow>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MacWindow title="employees (left)" compact>
          <div className="p-3">
            <SqlTable table={employees} cellStyles={leftStyles} />
          </div>
        </MacWindow>
        <MacWindow title="departments (right)" compact>
          <div className="p-3">
            <SqlTable table={departments} cellStyles={rightStyles} />
          </div>
        </MacWindow>
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <MacWindow title="Result">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-success">{current.badge}</span>
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
          initialQuery={`SELECT e.name, d.dept_name\nFROM employees e\nLEFT JOIN departments d ON e.dept_id = d.id\nUNION\nSELECT e.name, d.dept_name\nFROM employees e\nRIGHT JOIN departments d ON e.dept_id = d.id;`}
          description="The MySQL-compatible workaround. Try adding WHERE e.id IS NULL OR d.id IS NULL to surface only unmatched rows on either side."
        />
      </div>
    </div>
  );
}
