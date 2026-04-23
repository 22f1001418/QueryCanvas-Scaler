import { Routes, Route } from 'react-router-dom';
import { ROUTES } from './routes';

import { LandingPage } from './pages/LandingPage';
import { SelectPage } from './pages/SelectPage';
import { WherePage } from './pages/WherePage';
import { OrderByPage } from './pages/OrderByPage';
import { LimitOffsetPage } from './pages/LimitOffsetPage';
import { AliasPage } from './pages/AliasPage';
import { DistinctPage } from './pages/DistinctPage';
import { InitcapPage } from './pages/InitcapPage';
import { GroupConcatPage } from './pages/GroupConcatPage';
import { NullHandlingPage } from './pages/NullHandlingPage';
import { CountVariantsPage } from './pages/CountVariantsPage';
import { WhereVsHavingPage } from './pages/WhereVsHavingPage';
import { IFunctionPage } from './pages/IFunctionPage';
import { AdvancedCaseAggPage } from './pages/AdvancedCaseAggPage';
import { InlineCalcPage } from './pages/InlineCalcPage';
import { NullVsBlankPage } from './pages/NullVsBlankPage';
import { AggregationsPage } from './pages/AggregationsPage';
import { GroupByPage } from './pages/GroupByPage';
import { JoinsPage } from './pages/JoinsPage';
import { SubqueriesPage } from './pages/SubqueriesPage';
import { WindowPage } from './pages/WindowPage';
import { CasePage } from './pages/CasePage';
import { CTEPage } from './pages/CTEPage';
import { SetsPage } from './pages/SetsPage';
import { DataCleaningPage } from './pages/DataCleaningPage';
import { StringFnsPage } from './pages/StringFnsPage';
import { NumericFnsPage } from './pages/NumericFnsPage';
import { DateFnsPage } from './pages/DateFnsPage';
import { ViewsPage } from './pages/ViewsPage';
import { IndexingPage } from './pages/IndexingPage';
import { AcidModelingPage } from './pages/AcidModelingPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { RecursiveCTEPage } from './pages/RecursiveCTEPage';

function TopicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-screen overflow-y-auto bg-surface-0">
      <div className="max-w-5xl mx-auto p-6">{children}</div>
    </div>
  );
}

/**
 * Visible not-found screen. Previously this was `<Navigate to="/" />`,
 * which silently sent every unknown path back to landing — if tokens
 * ever drifted or a URL was mistyped, students just saw the landing
 * page with no indication anything was wrong. Rendering an explicit
 * screen makes deep-link issues obvious and debuggable.
 */
function NotFoundPage() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-surface-0">
      <div className="text-center max-w-md p-6">
        <h1 className="text-2xl font-semibold text-text-1 mb-2">Page not found</h1>
        <p className="text-text-2 mb-1">
          The URL <code className="px-1.5 py-0.5 rounded bg-surface-2 text-text-1">
            {typeof window !== 'undefined' ? window.location.pathname : ''}
          </code> isn't a recognized topic link.
        </p>
        <p className="text-text-2 text-sm">
          Double-check the link you were given, or contact your instructor.
        </p>
      </div>
    </div>
  );
}

const topicRoutes: { path: string; Component: React.ComponentType }[] = [
  { path: ROUTES.select, Component: SelectPage },
  { path: ROUTES.where, Component: WherePage },
  { path: ROUTES.orderby, Component: OrderByPage },
  { path: ROUTES.limitoffset, Component: LimitOffsetPage },
  { path: ROUTES.alias, Component: AliasPage },
  { path: ROUTES.distinct, Component: DistinctPage },
  { path: ROUTES.initcap, Component: InitcapPage },
  { path: ROUTES.groupconcat, Component: GroupConcatPage },
  { path: ROUTES.nullhandling, Component: NullHandlingPage },
  { path: ROUTES.countvariants, Component: CountVariantsPage },
  { path: ROUTES.wherehaving, Component: WhereVsHavingPage },
  { path: ROUTES.iffunction, Component: IFunctionPage },
  { path: ROUTES.advancedcase, Component: AdvancedCaseAggPage },
  { path: ROUTES.inlinecalc, Component: InlineCalcPage },
  { path: ROUTES.nullvsblank, Component: NullVsBlankPage },
  { path: ROUTES.aggregations, Component: AggregationsPage },
  { path: ROUTES.groupby, Component: GroupByPage },
  { path: ROUTES.joins, Component: JoinsPage },
  { path: ROUTES.sets, Component: SetsPage },
  { path: ROUTES.subqueries, Component: SubqueriesPage },
  { path: ROUTES.cte, Component: CTEPage },
  { path: ROUTES.window, Component: WindowPage },
  { path: ROUTES.case, Component: CasePage },
  { path: ROUTES.datacleaning, Component: DataCleaningPage },
  { path: ROUTES.stringfns, Component: StringFnsPage },
  { path: ROUTES.numericfns, Component: NumericFnsPage },
  { path: ROUTES.datefns, Component: DateFnsPage },
  { path: ROUTES.views, Component: ViewsPage },
  { path: ROUTES.indexing, Component: IndexingPage },
  { path: ROUTES.acid, Component: AcidModelingPage },
  { path: ROUTES.analytics, Component: AnalyticsPage },
  { path: ROUTES.recursivecte, Component: RecursiveCTEPage },
];

export default function App() {
  return (
    <Routes>
      <Route path={ROUTES.landing} element={<LandingPage />} />
      {topicRoutes.map(({ path, Component }) => (
        <Route
          key={path}
          path={path}
          element={
            <TopicLayout>
              <Component />
            </TopicLayout>
          }
        />
      ))}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
