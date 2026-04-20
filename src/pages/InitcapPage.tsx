import { MacWindow } from '../components/MacWindow';
import { SqlTable } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { QueryPlayground } from '../components/QueryPlayground';
import { motion } from 'framer-motion';

const messyTable = {
  name: 'users',
  columns: ['user_id', 'first_name', 'origin_city'],
  rows: [
    [1, 'aarav shah', 'mumbai'],
    [2, 'PRIYA MEHTA', 'DELHI'],
    [3, 'ravi KUMAR', 'bangalore'],
    [4, 'SNEHA patel', 'ahmedabad'],
    [5, 'arjun nair', 'kochi'],
  ] as (string | number | null)[][],
};

const steps = [
  {
    sql: `-- The problem: inconsistent casing\nSELECT first_name, origin_city\nFROM users;`,
    desc: 'The problem — inconsistent casing',
    detail: 'Raw data often has mixed casing — all-lowercase, ALL-CAPS, or random mixtures. Displaying this to users looks unprofessional. We need a way to normalize it.',
    result: {
      columns: ['first_name', 'origin_city'],
      rows: [
        ['aarav shah', 'mumbai'],
        ['PRIYA MEHTA', 'DELHI'],
        ['ravi KUMAR', 'bangalore'],
        ['SNEHA patel', 'ahmedabad'],
        ['arjun nair', 'kochi'],
      ],
    },
  },
  {
    sql: `-- PostgreSQL / Oracle\nSELECT INITCAP(first_name) AS name,\n       INITCAP(origin_city) AS city\nFROM users;`,
    desc: 'INITCAP — capitalise first letter of each word',
    detail: 'INITCAP capitalises the first letter of every word and lowercases the rest. "aarav shah" → "Aarav Shah", "PRIYA MEHTA" → "Priya Mehta". Available in PostgreSQL and Oracle.',
    result: {
      columns: ['name', 'city'],
      rows: [
        ['Aarav Shah', 'Mumbai'],
        ['Priya Mehta', 'Delhi'],
        ['Ravi Kumar', 'Bangalore'],
        ['Sneha Patel', 'Ahmedabad'],
        ['Arjun Nair', 'Kochi'],
      ],
    },
  },
  {
    sql: `-- Compare: UPPER vs LOWER vs INITCAP\nSELECT first_name,\n  UPPER(first_name)   AS upper_case,\n  LOWER(first_name)   AS lower_case,\n  INITCAP(first_name) AS title_case\nFROM users;`,
    desc: 'UPPER vs LOWER vs INITCAP',
    detail: 'UPPER converts everything to capitals, LOWER converts everything to lowercase, and INITCAP produces "Title Case" — first letter of each word capitalised, rest lowercase.',
    result: {
      columns: ['first_name', 'upper_case', 'lower_case', 'title_case'],
      rows: [
        ['aarav shah', 'AARAV SHAH', 'aarav shah', 'Aarav Shah'],
        ['PRIYA MEHTA', 'PRIYA MEHTA', 'priya mehta', 'Priya Mehta'],
        ['ravi KUMAR', 'RAVI KUMAR', 'ravi kumar', 'Ravi Kumar'],
        ['SNEHA patel', 'SNEHA PATEL', 'sneha patel', 'Sneha Patel'],
        ['arjun nair', 'ARJUN NAIR', 'arjun nair', 'Arjun Nair'],
      ],
    },
  },
  {
    sql: `-- SQLite workaround (single-word values)\nSELECT origin_city,\n  UPPER(SUBSTR(origin_city, 1, 1))\n    || LOWER(SUBSTR(origin_city, 2))\n    AS initcap_city\nFROM users;`,
    desc: 'SQLite workaround — manual title case',
    detail: 'SQLite has no built-in INITCAP. For single words you can combine UPPER on the first character with LOWER on the rest using SUBSTR. For multi-word strings a UDF (user-defined function) is needed.',
    result: {
      columns: ['origin_city', 'initcap_city'],
      rows: [
        ['mumbai', 'Mumbai'],
        ['DELHI', 'Delhi'],
        ['bangalore', 'Bangalore'],
        ['ahmedabad', 'Ahmedabad'],
        ['kochi', 'Kochi'],
      ],
    },
  },
];

export function InitcapPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 2500);
  const current = steps[step];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">INITCAP</h1>
        <p className="text-sm text-text-secondary mt-1">
          INITCAP converts a string to title case — the first letter of each word is capitalised,
          the rest are lowercased. It is available in PostgreSQL and Oracle. SQLite and MySQL do not
          have a native equivalent, but the effect can be approximated with SUBSTR and UPPER/LOWER.
        </p>
      </div>

      <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-mac">
        <p className="text-xs text-amber-600 dark:text-amber-400">
          <strong>Dialect note:</strong> INITCAP is PostgreSQL / Oracle only. The playground below runs SQLite — use the SUBSTR workaround shown in step 4 to experiment.
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
          <CodeBlock code={current.sql} />
        </MacWindow>

        <MacWindow title="users — source" compact>
          <div className="p-3">
            <SqlTable table={messyTable} />
          </div>
        </MacWindow>
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <MacWindow title="Result">
          <div className="p-3">
            <SqlTable
              table={{ name: 'result', columns: current.result.columns, rows: current.result.rows }}
              animateRows
            />
          </div>
        </MacWindow>
      </motion.div>

      <div className="mt-8 pt-6 border-t border-border">
        <QueryPlayground
          initialQuery={`-- SQLite workaround: capitalise first letter of each city\nSELECT origin_city,\n  UPPER(SUBSTR(origin_city, 1, 1)) || LOWER(SUBSTR(origin_city, 2)) AS initcap_city\nFROM users;`}
          description="INITCAP is PostgreSQL-only. In this SQLite playground, try the SUBSTR workaround above. For full multi-word title-casing in SQLite you would write a custom function."
        />
      </div>
    </div>
  );
}
