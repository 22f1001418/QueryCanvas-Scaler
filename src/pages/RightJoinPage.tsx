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
    sql: `-- RIGHT JOIN: keep every right row, fill left with NULL when no match\nSELECT e.name, d.dept_name\nFROM employees e\nRIGHT JOIN departments d\n  ON e.dept_id = d.id;`,
    desc: 'Basic RIGHT JOIN — every right row, even unmatched',
    detail: "All 4 departments stay. Engineering, Marketing, Sales each match an employee. Finance has no employees — but its row survives, with the left side filled with NULLs. Eve (whose dept_id is NULL) is dropped because she doesn't match Finance or anything else.",
    leftMatched: [0, 1, 2, 3],
    rightMatched: [0, 1, 2, 3],
    result: { cols: ['name', 'dept_name'], rows: [
      ['Alice', 'Engineering'], ['Bob', 'Engineering'],
      ['Carol', 'Marketing'], ['Dave', 'Sales'],
      [null, 'Finance'],
    ]},
    badge: '5 rows · Finance preserved with NULL',
  },
  {
    sql: `-- RIGHT JOIN ≡ LEFT JOIN with tables swapped\n-- These produce the same result:\nSELECT e.name, d.dept_name\nFROM employees e\nRIGHT JOIN departments d ON e.dept_id = d.id;\n\nSELECT e.name, d.dept_name\nFROM departments d\nLEFT JOIN employees e ON e.dept_id = d.id;`,
    desc: 'RIGHT JOIN equals LEFT JOIN with sides swapped',
    detail: "Any RIGHT JOIN can be rewritten as a LEFT JOIN by swapping the table order. Most teams adopt 'always use LEFT JOIN' as a convention because reading top-to-bottom matches how we think — the left table is the 'main' one. RIGHT JOIN is functionally equivalent but rarely seen in real codebases.",
    leftMatched: [0, 1, 2, 3],
    rightMatched: [0, 1, 2, 3],
    result: { cols: ['name', 'dept_name'], rows: [
      ['Alice', 'Engineering'], ['Bob', 'Engineering'],
      ['Carol', 'Marketing'], ['Dave', 'Sales'],
      [null, 'Finance'],
    ]},
    badge: 'Identical result',
  },
  {
    sql: `-- Find departments with no employees (right anti-join)\nSELECT d.dept_name\nFROM employees e\nRIGHT JOIN departments d\n  ON e.dept_id = d.id\nWHERE e.id IS NULL;`,
    desc: 'Find unmatched right rows — WHERE left IS NULL',
    detail: "Mirror of the LEFT JOIN anti-join. RIGHT JOIN keeps every department; the WHERE clause then filters to only the ones where the left side came up NULL — meaning no employee matched. Finance is the lone result.",
    leftMatched: [],
    rightMatched: [3],
    result: { cols: ['dept_name'], rows: [['Finance']] },
    badge: '1 department with no employees',
  },
];

export function RightJoinPage() {
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
        <h1 className="text-xl font-semibold text-text-primary">RIGHT JOIN</h1>
        <p className="text-sm text-text-secondary mt-1">
          RIGHT JOIN keeps every row from the right table, attaching matching left-side data
          where it exists and filling in NULLs where it doesn't. It's the mirror image of
          LEFT JOIN — and any RIGHT JOIN can be rewritten as a LEFT JOIN with the tables
          swapped.
        </p>
      </div>

      <div className="px-3 py-2 bg-rose-500/10 border border-rose-500/30 rounded-mac">
        <p className="text-xs text-rose-600 dark:text-rose-400">
          <strong>Convention:</strong> most teams prefer LEFT JOIN consistently and avoid RIGHT JOIN
          for readability. Reading <em>FROM A LEFT JOIN B</em> matches how you think: A is primary, B is supplementary.
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
          initialQuery={`SELECT e.name, d.dept_name\nFROM employees e\nRIGHT JOIN departments d\n  ON e.dept_id = d.id;`}
          description="Try rewriting the same query as a LEFT JOIN by swapping FROM and the joined table — confirm the result is identical."
        />
      </div>
    </div>
  );
}
