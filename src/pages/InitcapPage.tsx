import { MacWindow } from '../components/MacWindow';
import { SqlTable } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { QueryPlayground } from '../components/QueryPlayground';
import { motion } from 'framer-motion';

const messyTable = {
  name: 'contacts',
  columns: ['id', 'full_name', 'city'],
  rows: [
    [1, 'alice smith', 'new york'],
    [2, 'BOB JONES', 'LONDON'],
    [3, 'carol WHITE', 'berlin'],
    [4, 'DAVE brown-lee', 'tokyo'],
    [5, 'eve o\'connor', 'san francisco'],
  ] as (string | number | null)[][],
};

const steps = [
  {
    sql: `-- The problem: inconsistent casing\nSELECT full_name, city\nFROM contacts;`,
    desc: 'The problem — inconsistent casing',
    detail: 'Raw data often has mixed casing — all-lowercase, ALL-CAPS, or random mixtures. Displaying this to users looks unprofessional. We need a way to normalize it.',
    result: {
      columns: ['full_name', 'city'],
      rows: [
        ['alice smith', 'new york'],
        ['BOB JONES', 'LONDON'],
        ['carol WHITE', 'berlin'],
        ['DAVE brown-lee', 'tokyo'],
        ["eve o'connor", 'san francisco'],
      ],
    },
  },
  {
    sql: `-- PostgreSQL / Oracle\nSELECT INITCAP(full_name) AS name,\n       INITCAP(city)      AS city\nFROM contacts;`,
    desc: 'INITCAP — capitalise first letter of each word',
    detail: 'INITCAP capitalises the first letter of every word and lowercases the rest. "alice smith" → "Alice Smith", "BOB JONES" → "Bob Jones". Available in PostgreSQL and Oracle.',
    result: {
      columns: ['name', 'city'],
      rows: [
        ['Alice Smith', 'New York'],
        ['Bob Jones', 'London'],
        ['Carol White', 'Berlin'],
        ['Dave Brown-Lee', 'Tokyo'],
        ["Eve O'Connor", 'San Francisco'],
      ],
    },
  },
  {
    sql: `-- Compare: UPPER vs LOWER vs INITCAP\nSELECT full_name,\n  UPPER(full_name)   AS upper_case,\n  LOWER(full_name)   AS lower_case,\n  INITCAP(full_name) AS title_case\nFROM contacts;`,
    desc: 'UPPER vs LOWER vs INITCAP',
    detail: 'UPPER converts everything to capitals, LOWER converts everything to lowercase, and INITCAP produces "Title Case" — first letter of each word capitalised, rest lowercase.',
    result: {
      columns: ['full_name', 'upper_case', 'lower_case', 'title_case'],
      rows: [
        ['alice smith', 'ALICE SMITH', 'alice smith', 'Alice Smith'],
        ['BOB JONES', 'BOB JONES', 'bob jones', 'Bob Jones'],
        ['carol WHITE', 'CAROL WHITE', 'carol white', 'Carol White'],
        ['DAVE brown-lee', 'DAVE BROWN-LEE', 'dave brown-lee', 'Dave Brown-Lee'],
        ["eve o'connor", "EVE O'CONNOR", "eve o'connor", "Eve O'Connor"],
      ],
    },
  },
  {
    sql: `-- SQLite workaround (single-word values)\nSELECT city,\n  UPPER(SUBSTR(city, 1, 1))\n    || LOWER(SUBSTR(city, 2))\n    AS initcap_city\nFROM contacts;`,
    desc: 'SQLite workaround — manual title case',
    detail: 'SQLite has no built-in INITCAP. For single words you can combine UPPER on the first character with LOWER on the rest using SUBSTR. For multi-word strings a UDF (user-defined function) is needed.',
    result: {
      columns: ['city', 'initcap_city'],
      rows: [
        ['new york', 'New york'],
        ['LONDON', 'London'],
        ['berlin', 'Berlin'],
        ['tokyo', 'Tokyo'],
        ['san francisco', 'San francisco'],
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

        <MacWindow title="contacts — source" compact>
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
          initialQuery={`-- SQLite workaround: capitalise first letter of each city\nSELECT city,\n  UPPER(SUBSTR(city, 1, 1)) || LOWER(SUBSTR(city, 2)) AS initcap_city\nFROM customers;`}
          description="INITCAP is PostgreSQL-only. In this SQLite playground, try the SUBSTR workaround above. For full multi-word title-casing in SQLite you would write a custom function."
        />
      </div>
    </div>
  );
}
