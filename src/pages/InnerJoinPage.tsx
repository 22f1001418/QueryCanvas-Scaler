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
    sql: `-- INNER JOIN: keep only rows that match on both sides\nSELECT e.name, d.dept_name\nFROM employees e\nINNER JOIN departments d\n  ON e.dept_id = d.id;`,
    desc: 'Basic INNER JOIN — only matched rows',
    detail: 'INNER JOIN walks both tables and keeps only the pairs where the ON condition is true. Alice, Bob, Carol, Dave each have a valid dept_id that matches a department. Eve has dept_id NULL — dropped. Finance has id 4 but no employee references it — dropped. 4 matched rows out of 5+4 input rows.',
    leftMatched: [0, 1, 2, 3],
    rightMatched: [0, 1, 2],
    result: { cols: ['name', 'dept_name'], rows: [['Alice', 'Engineering'], ['Bob', 'Engineering'], ['Carol', 'Marketing'], ['Dave', 'Sales']] },
    badge: '4 rows matched',
  },
  {
    sql: `-- NULL never matches NULL — even if both sides are NULL\nSELECT e.name, e.dept_id, d.dept_name\nFROM employees e\nINNER JOIN departments d\n  ON e.dept_id = d.id;\n\n-- Eve's dept_id is NULL → no match → dropped`,
    desc: 'NULL behavior — NULLs never match',
    detail: 'A common surprise: in SQL, NULL = NULL evaluates to UNKNOWN, not true. So a row with NULL on either side of the ON condition is silently dropped by INNER JOIN. Eve disappears even though "no department" might be a real, meaningful state. Use LEFT JOIN if you need to keep her.',
    leftMatched: [0, 1, 2, 3],
    rightMatched: [0, 1, 2],
    result: { cols: ['name', 'dept_id', 'dept_name'], rows: [['Alice', 1, 'Engineering'], ['Bob', 1, 'Engineering'], ['Carol', 2, 'Marketing'], ['Dave', 3, 'Sales']] },
    badge: 'Eve dropped — NULL ≠ anything',
  },
  {
    sql: `-- Extra ON condition — narrow the join\nSELECT e.name, d.dept_name\nFROM employees e\nINNER JOIN departments d\n  ON e.dept_id = d.id\n  AND d.dept_name <> 'Sales';`,
    desc: 'INNER JOIN with extra ON condition',
    detail: "ON can hold any boolean — not just equality. Adding AND d.dept_name <> 'Sales' filters out the Sales department during the join. Dave (Sales) is dropped, leaving 3 rows. Putting this in ON vs WHERE produces the same result for INNER JOIN — but they behave very differently with LEFT/RIGHT.",
    leftMatched: [0, 1, 2],
    rightMatched: [0, 1],
    result: { cols: ['name', 'dept_name'], rows: [['Alice', 'Engineering'], ['Bob', 'Engineering'], ['Carol', 'Marketing']] },
    badge: '3 rows (Sales filtered out)',
  },
];

export function InnerJoinPage() {
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
        <h1 className="text-xl font-semibold text-text-primary">INNER JOIN</h1>
        <p className="text-sm text-text-secondary mt-1">
          INNER JOIN combines rows from two tables and keeps only those pairs that satisfy
          the ON condition. Rows on either side without a match — including rows with NULL
          in the join column — are silently dropped.
        </p>
      </div>

      <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-mac">
        <p className="text-xs text-emerald-700 dark:text-emerald-400">
          <strong>Mental model:</strong> the intersection of the two tables on the join key.
          Result row count is between 0 and (left × right). NULLs never match — not even other NULLs.
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
          initialQuery={`SELECT e.name, d.dept_name\nFROM employees e\nINNER JOIN departments d\n  ON e.dept_id = d.id;`}
          description="Try changing the ON condition. Add AND clauses to narrow the join. Note how rows with NULL in the join key disappear."
        />
      </div>
    </div>
  );
}
