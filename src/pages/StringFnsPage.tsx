import { QueryPlayground } from '../components/QueryPlayground';
import { useMemo } from 'react';
import { MacWindow } from '../components/MacWindow';
import { SqlTable } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { motion } from 'framer-motion';

const strTable = {
  name: 'users',
  columns: ['user_id', 'first_name', 'last_name', 'email', 'origin_city'],
  rows: [
    [1, 'aarav', 'SHAH', 'aarav.shah@rapido.in', 'Mumbai'],
    [2, 'PRIYA', 'mehta', 'priya.mehta@gmail.com', '  Delhi  '],
    [3, 'Ravi', 'Kumar', 'ravi.kumar@gmail.com', 'bangalore'],
    [4, 'SNEHA', 'Patel', 'sneha.patel@yahoo.in', 'AHMEDABAD'],
    [5, 'arjun', 'NAIR', 'arjun.nair@gmail.com', 'kochi'],
  ] as (string | number | null)[][],
};

const steps = [
  {
    sql: `SELECT\n  CONCAT(first_name, ' ', last_name)\n    AS full_name\nFROM users;`,
    desc: 'CONCAT — combine strings',
    result: {
      columns: ['full_name'],
      rows: [
        ['aarav SHAH'],
        ['PRIYA mehta'],
        ['Ravi Kumar'],
        ['SNEHA Patel'],
        ['arjun NAIR'],
      ],
    },
  },
  {
    sql: `-- Extract domain from email\nSELECT email,\n  SUBSTRING(\n    email,\n    POSITION('@' IN email) + 1\n  ) AS domain\nFROM users;`,
    desc: 'SUBSTRING + POSITION — extract domain',
    result: {
      columns: ['email', 'domain'],
      rows: [
        ['aarav.shah@rapido.in', 'rapido.in'],
        ['priya.mehta@gmail.com', 'gmail.com'],
        ['ravi.kumar@gmail.com', 'gmail.com'],
        ['sneha.patel@yahoo.in', 'yahoo.in'],
        ['arjun.nair@gmail.com', 'gmail.com'],
      ],
    },
  },
  {
    sql: `SELECT\n  LEFT(first_name, 1) AS initial,\n  RIGHT(email, 2) AS tld,\n  LENGTH(first_name) AS name_len\nFROM users;`,
    desc: 'LEFT, RIGHT, LENGTH',
    result: {
      columns: ['initial', 'tld', 'name_len'],
      rows: [['a', 'in', 5], ['P', 'om', 5], ['R', 'om', 4], ['S', 'in', 5], ['a', 'om', 5]],
    },
  },
  {
    sql: `SELECT\n  TRIM(origin_city) AS trimmed,\n  UPPER(first_name) AS upper_name,\n  LOWER(last_name)  AS lower_last\nFROM users;`,
    desc: 'TRIM, UPPER, LOWER',
    result: {
      columns: ['trimmed', 'upper_name', 'lower_last'],
      rows: [
        ['Mumbai', 'AARAV', 'shah'],
        ['Delhi', 'PRIYA', 'mehta'],
        ['bangalore', 'RAVI', 'kumar'],
        ['AHMEDABAD', 'SNEHA', 'patel'],
        ['kochi', 'ARJUN', 'nair'],
      ],
    },
  },
  {
    sql: `SELECT first_name,\n  REPLACE(\n    email, '@', ' [at] '\n  ) AS safe_email\nFROM users;`,
    desc: 'REPLACE — substitution',
    result: {
      columns: ['first_name', 'safe_email'],
      rows: [
        ['aarav', 'aarav.shah [at] rapido.in'],
        ['PRIYA', 'priya.mehta [at] gmail.com'],
        ['Ravi', 'ravi.kumar [at] gmail.com'],
        ['SNEHA', 'sneha.patel [at] yahoo.in'],
        ['arjun', 'arjun.nair [at] gmail.com'],
      ],
    },
  },
];

export function StringFnsPage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(steps.length - 1, 2500);
  const current = steps[step];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">String Functions</h1>
        <p className="text-sm text-text-secondary mt-1">
          Manipulate text data — concatenate, extract, trim, change case, and replace characters.
        </p>
      </div>

      <AnimationControls step={step} maxSteps={steps.length - 1} isPlaying={isPlaying}
        onPlay={play} onPause={pause} onReset={reset} onNext={next} onPrev={prev}
        stepLabel={current.desc} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <MacWindow title="Query" compact>
          <CodeBlock code={current.sql} />
        </MacWindow>
        <MacWindow title="users — source" compact>
          <div className="p-3">
            <SqlTable table={strTable} />
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

      {/* Try it yourself */}
      <QueryPlayground
        initialQuery="SELECT CONCAT(first_name, ' ', last_name) AS full_name, UPPER(origin_city) AS city FROM users;"
      />

    </div>
  );
}
