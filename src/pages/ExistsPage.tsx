import { MacWindow } from '../components/MacWindow';
import { SqlTable, CellStyle } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { rides, users } from '../data/sampleData';
import { QueryPlayground } from '../components/QueryPlayground';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

// users with rides: 1,2,3,4,5,6   |   without rides: 7(Karan),8(Meera)
// users who took a Cab: user 3 (Ravi), user 5 (Arjun)

const steps = [
  {
    sql: `-- EXISTS: true if subquery returns ANY row\nSELECT u.user_id, u.first_name\nFROM users u\nWHERE EXISTS (\n  SELECT 1\n  FROM rides r\n  WHERE r.user_id = u.user_id  -- correlated\n);`,
    desc: 'EXISTS — users who have at least one ride',
    detail: "EXISTS returns true as soon as the inner query finds one matching row — it stops searching immediately. The SELECT 1 is conventional: EXISTS only cares whether any row exists, not what columns are returned. Users 7 and 8 have no rides, so EXISTS returns false for them.",
    matchedUserIds: [1, 2, 3, 4, 5, 6],
    resultData: { columns: ['user_id', 'first_name'], rows: [[1, 'Aarav'], [2, 'Priya'], [3, 'Ravi'], [4, 'Sneha'], [5, 'Arjun'], [6, 'Divya']] },
  },
  {
    sql: `-- NOT EXISTS: true if subquery returns NO rows\nSELECT u.user_id, u.first_name\nFROM users u\nWHERE NOT EXISTS (\n  SELECT 1\n  FROM rides r\n  WHERE r.user_id = u.user_id\n);`,
    desc: 'NOT EXISTS — users with no rides',
    detail: "NOT EXISTS is the inverse — it returns true only when the inner query finds zero rows. Users 7 (Karan) and 8 (Meera) have no rides table entries, so NOT EXISTS is true for them. This is the safest way to find 'missing' relationships.",
    matchedUserIds: [7, 8],
    resultData: { columns: ['user_id', 'first_name'], rows: [[7, 'Karan'], [8, 'Meera']] },
  },
  {
    sql: `-- EXISTS vs IN — same result, different mechanics\n-- Using IN:\nSELECT user_id, first_name FROM users\nWHERE user_id IN (\n  SELECT DISTINCT user_id FROM rides\n);\n\n-- Using EXISTS (equivalent):\nSELECT user_id, first_name FROM users u\nWHERE EXISTS (\n  SELECT 1 FROM rides r\n  WHERE r.user_id = u.user_id\n);`,
    desc: 'EXISTS vs IN — when to use which',
    detail: "Both return the same 6 users. Key difference: IN materialises the full subquery result into memory; EXISTS short-circuits as soon as one match is found. EXISTS is safer with NULLs (no NULL trap) and often faster when the inner result set is large. Use EXISTS when checking 'does a related row exist?'.",
    matchedUserIds: [1, 2, 3, 4, 5, 6],
    resultData: { columns: ['user_id', 'first_name'], rows: [[1, 'Aarav'], [2, 'Priya'], [3, 'Ravi'], [4, 'Sneha'], [5, 'Arjun'], [6, 'Divya']] },
  },
  {
    sql: `-- NOT EXISTS vs NOT IN — NOT IN has NULL trap\n-- Safe:\nSELECT user_id, first_name FROM users u\nWHERE NOT EXISTS (\n  SELECT 1 FROM rides r\n  WHERE r.user_id = u.user_id\n);\n\n-- Risky (returns 0 rows if any user_id is NULL):\n-- WHERE user_id NOT IN (SELECT user_id FROM rides)`,
    desc: 'NOT EXISTS vs NOT IN — NULL safety',
    detail: "NOT EXISTS is always safe. NOT IN fails silently if the subquery contains any NULL: the entire result becomes empty. Since rides.user_id could theoretically be NULL, always prefer NOT EXISTS over NOT IN for 'find rows with no match' queries.",
    matchedUserIds: [7, 8],
    resultData: { columns: ['user_id', 'first_name'], rows: [[7, 'Karan'], [8, 'Meera']] },
  },
];

export function ExistsPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 3000);
  const current = steps[step];

  const cellStyles = useMemo(() => {
    const styles: Record<string, CellStyle> = {};
    users.rows.forEach((row, ri) => {
      const uid = row[0] as number;
      const matched = current.matchedUserIds.includes(uid);
      users.columns.forEach((_, ci) => {
        styles[`${ri}-${ci}`] = matched ? 'selected' : 'removed';
      });
    });
    return styles;
  }, [step]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">EXISTS</h1>
        <p className="text-sm text-text-secondary mt-1">
          EXISTS tests whether a correlated subquery returns at least one row. It short-circuits on
          the first match, ignores NULLs, and is the preferred pattern for checking whether a related
          row exists. NOT EXISTS finds rows with no matching related record.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="bg-green-500/10 border border-green-500/30 rounded-mac px-3 py-2">
          <p className="font-semibold text-green-600 dark:text-green-400 mb-1">EXISTS</p>
          <p className="text-text-secondary">True if ≥ 1 row returned</p>
          <p className="text-text-secondary">Short-circuits on first hit</p>
          <p className="text-text-secondary">NULL-safe</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-mac px-3 py-2">
          <p className="font-semibold text-red-600 dark:text-red-400 mb-1">NOT EXISTS</p>
          <p className="text-text-secondary">True if 0 rows returned</p>
          <p className="text-text-secondary">Safer than NOT IN</p>
          <p className="text-text-secondary">No NULL trap</p>
        </div>
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

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MacWindow title="users — EXISTS checked per row" compact>
            <div className="p-3">
              <div className="text-xs text-text-secondary mb-2">
                <span className="text-green-500 font-semibold">Highlighted</span> = EXISTS true &nbsp;
                <span className="text-text-tertiary">Greyed</span> = EXISTS false
              </div>
              <SqlTable table={users} visibleColumns={[0, 1, 5]} cellStyles={cellStyles} />
            </div>
          </MacWindow>

          <MacWindow title="Result" compact>
            <div className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="badge badge-success">{current.resultData.rows.length} rows</span>
              </div>
              <SqlTable
                table={{ name: 'result', columns: current.resultData.columns, rows: current.resultData.rows }}
                animateRows
              />
            </div>
          </MacWindow>
        </div>
      </motion.div>

      <div className="mt-8 pt-6 border-t border-border">
        <QueryPlayground
          initialQuery={`-- Users with no rides (safe pattern)\nSELECT user_id, first_name\nFROM users u\nWHERE NOT EXISTS (\n  SELECT 1 FROM rides r\n  WHERE r.user_id = u.user_id\n);`}
          description="Try EXISTS to find users who've taken a Cab. Use NOT EXISTS for users with no rides. Compare with IN/NOT IN to see the NULL trap."
        />
      </div>
    </div>
  );
}
