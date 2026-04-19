export type PageId =
  | 'select' | 'where' | 'orderby'
  | 'groupby' | 'joins' | 'subqueries'
  | 'window' | 'case' | 'cte'
  | 'aggregations' | 'sets'
  | 'datacleaning' | 'stringfns' | 'numericfns' | 'datefns'
  | 'views' | 'indexing' | 'acid'
  | 'analytics';
