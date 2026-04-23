export type PageId =
  | 'select' | 'where' | 'orderby' | 'limitoffset' | 'alias' | 'distinct' | 'initcap' | 'groupconcat'
  | 'nullhandling' | 'countvariants'
  | 'wherehaving'
  | 'iffunction' | 'advancedcase'
  | 'inlinecalc' | 'nullvsblank'
  | 'groupby' | 'joins' | 'subqueries'
  | 'window' | 'case' | 'cte'
  | 'aggregations' | 'sets'
  | 'datacleaning' | 'stringfns' | 'numericfns' | 'datefns'
  | 'views' | 'indexing' | 'acid'
  | 'analytics'
  | 'recursivecte';
