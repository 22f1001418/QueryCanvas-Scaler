import { Database } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="landing-root">
      {/* Soft animated gradient backdrop */}
      <div className="landing-bg" aria-hidden />
      <div className="landing-grid" aria-hidden />

      <main className="landing-main">
        <div className="landing-logo">
          <Database size={28} className="text-white" strokeWidth={2} />
        </div>

        <h1 className="landing-title">QueryCanvas</h1>

        <div className="landing-divider" aria-hidden />

        <div className="landing-tagline">
          <span className="landing-by">by</span>
          <span className="landing-brand">Scaler</span>
        </div>
      </main>
    </div>
  );
}
