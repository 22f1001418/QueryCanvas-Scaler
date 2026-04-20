import { useMemo } from 'react';
import { MacWindow } from '../components/MacWindow';
import { SqlTable, CellStyle } from '../components/SqlTable';
import { CodeBlock } from '../components/CodeBlock';
import { AnimationControls } from '../components/AnimationControls';
import { useAnimation } from '../hooks/useAnimation';
import { rides } from '../data/sampleData';
import { QueryPlayground } from '../components/QueryPlayground';
import { motion } from 'framer-motion';

const filters = [
  {
    sql: `SELECT start_location, distance_km\nFROM rides\nWHERE distance_km > 10;`,
    desc: 'Comparison: distance_km > 10',
    detail: 'The > operator filters rows where distance_km is strictly greater than 10. Other comparison operators include <, <=, >=, and !=.',
    test: (row: (string | number | null)[]) => (row[6] as number) > 10,
    highlight: [6],
  },
  {
    sql: `SELECT start_location, vehicle_type\nFROM rides\nWHERE vehicle_type = 'Bike';`,
    desc: "Equality: vehicle_type = 'Bike'",
    detail: "The = operator matches exact values. Only rows where vehicle_type exactly equals 'Bike' are returned.",
    test: (row: (string | number | null)[]) => row[7] === 'Bike',
    highlight: [7],
  },
  {
    sql: `SELECT start_location, distance_km\nFROM rides\nWHERE distance_km BETWEEN 7 AND 13;`,
    desc: 'BETWEEN: distance 7–13 km',
    detail: "BETWEEN is a shorthand for checking if a value falls within an inclusive range. It's equivalent to \"distance_km >= 7 AND distance_km <= 13\".",
    test: (row: (string | number | null)[]) => (row[6] as number) >= 7 && (row[6] as number) <= 13,
    highlight: [6],
  },
  {
    sql: `SELECT start_location, vehicle_type\nFROM rides\nWHERE vehicle_type IN ('Bike', 'Auto');`,
    desc: "IN: Bike or Auto",
    detail: "IN tests if a value matches any item in a list. This query returns rides booked using Bike OR Auto.",
    test: (row: (string | number | null)[]) => ['Bike', 'Auto'].includes(row[7] as string),
    highlight: [7],
  },
  {
    sql: `SELECT start_location, vehicle_type, distance_km\nFROM rides\nWHERE vehicle_type = 'Cab'\n  AND distance_km > 12;`,
    desc: "AND: Cab + distance > 12 km",
    detail: "AND combines multiple conditions where ALL must be true. Only Cab rides with distance above 12 km pass this filter.",
    test: (row: (string | number | null)[]) => row[7] === 'Cab' && (row[6] as number) > 12,
    highlight: [7, 6],
  },
  {
    sql: `SELECT start_location, end_location\nFROM rides\nWHERE start_location LIKE 'A%';`,
    desc: "LIKE: start_location starts with 'A'",
    detail: "LIKE matches patterns. % is a wildcard for any characters. 'A%' means start_locations starting with A.",
    test: (row: (string | number | null)[]) => (row[4] as string).startsWith('A'),
    highlight: [4],
  },
  {
    sql: `SELECT start_location, captain_rating\nFROM rides\nWHERE captain_rating IS NULL;`,
    desc: 'IS NULL: no captain rating',
    detail: 'IS NULL checks for missing values. Unlike = NULL (which never matches), IS NULL correctly identifies rows with no rating assigned.',
    test: (row: (string | number | null)[]) => row[8] === null,
    highlight: [8],
  },
];

export function WherePage() {
  const { step, isPlaying, play, pause, reset, next, prev } = useAnimation(filters.length - 1, 2500);
  const filter = filters[step];

  const matchingRows = useMemo(
    () => rides.rows.map((row, i) => ({ row, index: i, matches: filter.test(row) })),
    [step]
  );

  const cellStyles = useMemo(() => {
    const styles: Record<string, CellStyle> = {};
    matchingRows.forEach(({ index, matches }) => {
      rides.columns.forEach((_, ci) => {
        if (matches) {
          styles[`${index}-${ci}`] = filter.highlight.includes(ci) ? 'selected' : 'new';
        } else {
          styles[`${index}-${ci}`] = 'removed';
        }
      });
    });
    return styles;
  }, [step]);

  const resultRows = matchingRows.filter((r) => r.matches).map((r) => r.index);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">WHERE Clause</h1>
        <p className="text-sm text-text-secondary mt-1">
          Filter rows based on conditions — use comparison operators, logical operators, pattern matching with LIKE, and
          NULL checks with IS NULL. WHERE is applied before other operations like ORDER BY or LIMIT, making it one of the
          most essential SQL tools.
        </p>
      </div>

      <AnimationControls
        step={step}
        maxSteps={filters.length - 1}
        isPlaying={isPlaying}
        onPlay={play}
        onPause={pause}
        onReset={reset}
        onNext={next}
        onPrev={prev}
        stepLabel={filter.desc}
      />

      {/* Concept explanation */}
      <div className="p-3 bg-surface-2 rounded-mac border border-border">
        <p className="text-sm text-text-primary">{filter.detail}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <MacWindow title="Query" compact>
          <CodeBlock code={filter.sql} highlightLines={[3, 4]} />
        </MacWindow>

        <MacWindow title="rides — filtering" compact>
          <div className="p-3">
            <SqlTable
              table={rides}
              cellStyles={cellStyles}
              highlightColumns={filter.highlight}
            />
          </div>
        </MacWindow>
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <MacWindow title="Result">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-success">{resultRows.length} rows matched</span>
              <span className="badge badge-warning">{rides.rows.length - resultRows.length} filtered out</span>
            </div>
            <SqlTable table={rides} visibleRows={resultRows} animateRows />
          </div>
        </MacWindow>
      </motion.div>

      {/* Query Playground */}
      <div className="mt-8 pt-6 border-t border-border">
        <QueryPlayground
          initialQuery="SELECT * FROM rides WHERE distance_km > 10;"
          description="Write your own WHERE conditions. Try comparison operators (>, <, =), BETWEEN, IN, LIKE patterns, and IS NULL checks!"
        />
      </div>
    </div>
  );
}
