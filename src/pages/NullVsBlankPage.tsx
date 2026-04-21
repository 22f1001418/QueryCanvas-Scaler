import { useMemo } from 'react';
import { MacWindow } from '../components/MacWindow';
import { SqlTable, CellStyle } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { QueryPlayground } from '../components/QueryPlayground';
import { motion } from 'framer-motion';

// Table with explicit NULL vs empty-string to show the difference
const feedbackTable = {
  name: 'feedback',
  columns: ['id', 'user_name', 'comment', 'rating'],
  rows: [
    [1, 'Aarav',  'Great ride!',  5],
    [2, 'Priya',  '',             4],   // blank — user submitted empty form
    [3, 'Ravi',   null,           3],   // null  — user skipped the field
    [4, 'Sneha',  'Very smooth',  5],
    [5, 'Arjun',  '',             2],   // blank
    [6, 'Divya',  null,           4],   // null
  ] as (string | number | null)[][],
};

const steps = [
  {
    sql: `-- Both NULL and '' look identical in output\nSELECT user_name, comment\nFROM feedback;`,
    desc: 'The trap — NULL and \'\' look the same',
    detail: "NULL and an empty string ('') both display as blank in most tools. But they are completely different: NULL means the value is absent/unknown; '' is a real string value that happens to have zero characters. Treating them the same is a common bug.",
    highlightRows: [] as number[],
    highlightType: 'none' as const,
    result: {
      columns: ['user_name', 'comment', 'type'],
      rows: [
        ['Aarav', 'Great ride!', '← has value'],
        ['Priya', '',            '← blank string'],
        ['Ravi',  '(null)',      '← NULL'],
        ['Sneha', 'Very smooth', '← has value'],
        ['Arjun', '',            '← blank string'],
        ['Divya', '(null)',      '← NULL'],
      ],
    },
  },
  {
    sql: `-- IS NULL only matches NULL — not ''\nSELECT user_name, comment\nFROM feedback\nWHERE comment IS NULL;`,
    desc: 'IS NULL — catches NULL only',
    detail: "IS NULL matches rows where the value is absent. Priya and Arjun submitted an empty comment ('') — they are NOT matched. Only Ravi and Divya, who skipped the field entirely, appear in the result.",
    highlightRows: [2, 5],
    highlightType: 'match' as const,
    result: {
      columns: ['user_name', 'comment'],
      rows: [['Ravi', null], ['Divya', null]],
    },
  },
  {
    sql: `-- = '' only matches empty string — not NULL\nSELECT user_name, comment\nFROM feedback\nWHERE comment = '';`,
    desc: "= '' — catches blank only",
    detail: "= '' matches rows where the comment column is an empty string. NULL values are never equal to anything — not even to each other — so Ravi and Divya are excluded. Only Priya and Arjun, who submitted an empty form, are matched.",
    highlightRows: [1, 4],
    highlightType: 'match' as const,
    result: {
      columns: ['user_name', 'comment'],
      rows: [['Priya', ''], ['Arjun', '']],
    },
  },
  {
    sql: `-- LENGTH: NULL → NULL, '' → 0\nSELECT user_name, comment,\n  LENGTH(comment) AS len\nFROM feedback;`,
    desc: 'LENGTH() reveals the difference',
    detail: "LENGTH(NULL) returns NULL — any operation on NULL produces NULL. LENGTH('') returns 0 — there are zero characters. This is a reliable way to tell them apart programmatically.",
    highlightRows: [] as number[],
    highlightType: 'none' as const,
    result: {
      columns: ['user_name', 'comment', 'len'],
      rows: [
        ['Aarav', 'Great ride!', 11],
        ['Priya', '',            0],
        ['Ravi',  null,          null],
        ['Sneha', 'Very smooth', 11],
        ['Arjun', '',            0],
        ['Divya', null,          null],
      ],
    },
  },
  {
    sql: `-- Catch BOTH: missing or blank\nSELECT user_name\nFROM feedback\nWHERE comment IS NULL\n   OR comment = '';`,
    desc: 'Catch both — IS NULL OR = \'\'',
    detail: "To find all rows with no meaningful comment — whether NULL or blank — combine both conditions with OR. This is the standard defensive pattern when you can't guarantee which convention the data source uses.",
    highlightRows: [1, 2, 4, 5],
    highlightType: 'match' as const,
    result: {
      columns: ['user_name'],
      rows: [['Priya'], ['Ravi'], ['Arjun'], ['Divya']],
    },
  },
];

export function NullVsBlankPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 2500);
  const current = steps[step];

  const cellStyles = useMemo(() => {
    const styles: Record<string, CellStyle> = {};
    if (current.highlightType === 'none') return styles;

    feedbackTable.rows.forEach((_, ri) => {
      const isMatch = current.highlightRows.includes(ri);
      feedbackTable.columns.forEach((_, ci) => {
        styles[`${ri}-${ci}`] = isMatch ? 'selected' : 'removed';
      });
    });
    return styles;
  }, [step]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">NULL vs. Blank</h1>
        <p className="text-sm text-text-secondary mt-1">
          NULL and an empty string ('') both appear blank on screen but behave completely differently
          in SQL. NULL means the value is absent — any comparison with NULL returns NULL, not true or
          false. An empty string is a real value of length zero. Confusing them causes silent bugs.
        </p>
      </div>

      {/* Key distinction card */}
      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
        <div className="bg-red-500/10 border border-red-500/30 rounded-mac px-3 py-2">
          <p className="font-semibold text-red-500 mb-1">NULL</p>
          <p className="text-text-secondary">Value is absent / unknown</p>
          <p className="text-text-secondary">NULL = NULL → false</p>
          <p className="text-text-secondary">LENGTH(NULL) → NULL</p>
          <p className="text-text-secondary">Filter: IS NULL</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-mac px-3 py-2">
          <p className="font-semibold text-amber-500 mb-1">'' (Blank)</p>
          <p className="text-text-secondary">Value exists, zero chars</p>
          <p className="text-text-secondary">'' = '' → true</p>
          <p className="text-text-secondary">LENGTH('') → 0</p>
          <p className="text-text-secondary">Filter: = ''</p>
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <MacWindow title="Query" compact>
          <CodeBlock code={current.sql} />
        </MacWindow>

        <MacWindow title="feedback — source (NULL and '' both look blank)" compact>
          <div className="p-3">
            <SqlTable table={feedbackTable} cellStyles={cellStyles} />
          </div>
        </MacWindow>
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <MacWindow title="Result">
          <div className="p-3">
            {current.highlightType !== 'none' && (
              <div className="flex items-center gap-2 mb-2">
                <span className="badge badge-success">{current.result.rows.length} rows matched</span>
                <span className="badge badge-warning">{feedbackTable.rows.length - current.result.rows.length} filtered out</span>
              </div>
            )}
            <SqlTable
              table={{ name: 'result', columns: current.result.columns, rows: current.result.rows }}
              animateRows
            />
          </div>
        </MacWindow>
      </motion.div>

      <div className="mt-8 pt-6 border-t border-border">
        <QueryPlayground
          initialQuery={`-- See the difference in action\nSELECT user_name, comment,\n  LENGTH(comment) AS len\nFROM feedback\nWHERE comment IS NULL OR comment = '';`}
          description="Run the query to see LENGTH return NULL vs 0. Try WHERE comment IS NULL and WHERE comment = '' separately, then combine them with OR."
        />
      </div>
    </div>
  );
}
