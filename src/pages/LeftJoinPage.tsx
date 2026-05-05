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
    sql: `-- LEFT JOIN: keep every left row, fill right with NULL when no match\nSELECT e.name, e.dept_id, d.dept_name\nFROM employees e\nLEFT JOIN departments d\n  ON e.dept_id = d.id;`,
    desc: 'Basic LEFT JOIN — every left row, even unmatched',
    detail: "All 5 employees stay. Alice/Bob/Carol/Dave find their departments. Eve has no dept_id, so the right side is filled with NULLs — but Eve's row is preserved. This is the key difference from INNER JOIN: nobody on the left gets dropped.",
    leftMatched: [0, 1, 2, 3, 4],
    rightMatched: [0, 1, 2],
    result: { cols: ['name', 'dept_id', 'dept_name'], rows: [
      ['Alice', 1, 'Engineering'], ['Bob', 1, 'Engineering'],
      ['Carol', 2, 'Marketing'], ['Dave', 3, 'Sales'],
      ['Eve', null, null],
    ]},
    badge: '5 rows · Eve preserved with NULLs',
  },
  {
    sql: `-- "Anti-join": find left rows with NO match on right\nSELECT e.name\nFROM employees e\nLEFT JOIN departments d\n  ON e.dept_id = d.id\nWHERE d.id IS NULL;`,
    desc: 'Find unmatched — WHERE right IS NULL',
    detail: "A LEFT JOIN followed by WHERE <right_column> IS NULL is the standard 'find rows with no match' pattern (sometimes called an anti-join). Only Eve survives — her join produced NULLs on the right side because her dept_id had no match. This is often clearer than NOT IN/NOT EXISTS.",
    leftMatched: [4],
    rightMatched: [],
    result: { cols: ['name'], rows: [['Eve']] },
    badge: '1 employee with no department',
  },
  {
    sql: `-- Aggregating with LEFT JOIN — counts include zero\nSELECT d.dept_name,\n       COUNT(e.id) AS emp_count\nFROM departments d\nLEFT JOIN employees e\n  ON e.dept_id = d.id\nGROUP BY d.dept_name;`,
    desc: 'LEFT JOIN + COUNT — include zero counts',
    detail: "Swapping to departments LEFT JOIN employees keeps every department, even ones with no employees. COUNT(e.id) is 0 for Finance because the unmatched join produces NULL on the right — and COUNT ignores NULLs. With INNER JOIN, Finance would disappear entirely instead of showing 0.",
    leftMatched: [0, 1, 2, 3],
    rightMatched: [0, 1, 2, 3],
    result: { cols: ['dept_name', 'emp_count'], rows: [
      ['Engineering', 2], ['Marketing', 1], ['Sales', 1], ['Finance', 0],
    ]},
    badge: 'Finance shows count = 0',
    swapTables: true,
  },
];

export function LeftJoinPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 3500);
  const current = steps[step];

  const leftStyles = useMemo(() => {
    const styles: Record<string, CellStyle> = {};
    const table = current.swapTables ? departments : employees;
    table.rows.forEach((_, ri) => {
      const matched = current.leftMatched.includes(ri);
      table.columns.forEach((_, ci) => {
        styles[`${ri}-${ci}`] = matched ? 'join-left' : 'removed';
      });
    });
    return styles;
  }, [step]);

  const rightStyles = useMemo(() => {
    const styles: Record<string, CellStyle> = {};
    const table = current.swapTables ? employees : departments;
    table.rows.forEach((_, ri) => {
      const matched = current.rightMatched.includes(ri);
      table.columns.forEach((_, ci) => {
        styles[`${ri}-${ci}`] = matched ? 'join-right' : 'removed';
      });
    });
    return styles;
  }, [step]);

  const leftTable = current.swapTables ? departments : employees;
  const rightTable = current.swapTables ? employees : departments;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">LEFT JOIN</h1>
        <p className="text-sm text-text-secondary mt-1">
          LEFT JOIN keeps every row from the left table, attaching matching right-side data
          where it exists and filling in NULLs where it doesn't. The result always has at
          least as many rows as the left table — never fewer.
        </p>
      </div>

      <div className="px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-mac">
        <p className="text-xs text-blue-600 dark:text-blue-400">
          <strong>Mental model:</strong> "all of left, plus matching right where available."
          Rows with no right match get NULLs filled in for every right column. Use it when the
          left table is the &quot;source of truth&quot; and missing related data is meaningful.
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
        <MacWindow title={`${leftTable.name} (left)`} compact>
          <div className="p-3">
            <SqlTable table={leftTable} cellStyles={leftStyles} />
          </div>
        </MacWindow>
        <MacWindow title={`${rightTable.name} (right)`} compact>
          <div className="p-3">
            <SqlTable table={rightTable} cellStyles={rightStyles} />
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
          initialQuery={`SELECT e.name, d.dept_name\nFROM employees e\nLEFT JOIN departments d\n  ON e.dept_id = d.id;`}
          description="Add WHERE d.id IS NULL to find unmatched rows. Aggregate with COUNT(d.id) to see how unmatched rows produce zero counts."
        />
      </div>
    </div>
  );
}
