import type { PageId } from './store';

/**
 * Opaque per-page tokens. Paths look like `/q/<token>` so students
 * can't guess adjacent queries from readable slugs.
 *
 * NOTE: This is obfuscation, not real encryption — tokens ship to the
 * browser and can be extracted from the JS bundle. For real access
 * control, a backend is required.
 */
const TOKENS: Record<PageId, string> = {
  select:        '8f3a2b9c4d5e6f1a',
  where:         'a2b4c6d8e0f13579',
  orderby:       '1a3b5c7d9e0f2a4b',
  limitoffset:   'e4a1b7c9d2f50638',
  alias:         'b2f6a9e3c1d80475',
  distinct:      'c7e0a4f8b3d91526',
  initcap:       'd8b3e6a1f4c92750',
  groupconcat:   'a5c8f1e4b7d02639',
  nullhandling:  'f1d4a7e0b3c68259',
  countvariants: '8e2b5f9c3a7d1046',
  wherehaving:   '3f7c1a9e5b2d8046',
  iffunction:    '7b3e9f1c5a2d8046',
  advancedcase:  '4d8a2f6e1b9c3057',
  aggregations:  '4c9e2b7a1f8d0c3e',
  groupby:       '7d1f4a8c2e5b9037',
  joins:         '0e8b3a5d7c2f1649',
  sets:          '5b7f9c2a4e1d8063',
  subqueries:    '9a4c7e1b3d8f0526',
  cte:           '2d5a8f1c4b7e9036',
  window:        '6c0b3e5a8d1f4927',
  case:          '3e7a1c5f9d2b8046',
  datacleaning:  'f0a3d6b9c2e5f148',
  stringfns:     'b1e4a7c0d3f68925',
  numericfns:    'c5a8e1b4f7d03629',
  datefns:       'd9c2f5a8b1e47036',
  views:         'a6d9c3f0b4e72815',
  indexing:      'e3b6f9a2c5d81047',
  acid:          'f2a5d8c1b4e70369',
  analytics:     '0b4e7a1d5c8f2936',
  recursivecte:  '1b8e4f2a7d5c9036',
};

export const ROUTES = {
  landing: '/',
  select:        `/q/${TOKENS.select}`,
  where:         `/q/${TOKENS.where}`,
  orderby:       `/q/${TOKENS.orderby}`,
  limitoffset:   `/q/${TOKENS.limitoffset}`,
  alias:         `/q/${TOKENS.alias}`,
  distinct:      `/q/${TOKENS.distinct}`,
  initcap:       `/q/${TOKENS.initcap}`,
  groupconcat:   `/q/${TOKENS.groupconcat}`,
  nullhandling:  `/q/${TOKENS.nullhandling}`,
  countvariants: `/q/${TOKENS.countvariants}`,
  wherehaving:   `/q/${TOKENS.wherehaving}`,
  iffunction:    `/q/${TOKENS.iffunction}`,
  advancedcase:  `/q/${TOKENS.advancedcase}`,
  aggregations:  `/q/${TOKENS.aggregations}`,
  groupby:       `/q/${TOKENS.groupby}`,
  joins:         `/q/${TOKENS.joins}`,
  sets:          `/q/${TOKENS.sets}`,
  subqueries:    `/q/${TOKENS.subqueries}`,
  cte:           `/q/${TOKENS.cte}`,
  window:        `/q/${TOKENS.window}`,
  case:          `/q/${TOKENS.case}`,
  datacleaning:  `/q/${TOKENS.datacleaning}`,
  stringfns:     `/q/${TOKENS.stringfns}`,
  numericfns:    `/q/${TOKENS.numericfns}`,
  datefns:       `/q/${TOKENS.datefns}`,
  views:         `/q/${TOKENS.views}`,
  indexing:      `/q/${TOKENS.indexing}`,
  acid:          `/q/${TOKENS.acid}`,
  analytics:     `/q/${TOKENS.analytics}`,
  recursivecte:  `/q/${TOKENS.recursivecte}`,
} as const satisfies Record<'landing' | PageId, string>;

export type RouteKey = keyof typeof ROUTES;

export const pathFor = (id: PageId): string => ROUTES[id];
