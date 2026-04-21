import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: '📄', title: 'PDF Upload', desc: 'Drag & drop your resume — we extract the text automatically.' },
  { icon: '🤖', title: 'Claude AI Analysis', desc: 'Powered by Anthropic\'s Claude, the world\'s most intuitive AI.' },
  { icon: '🎯', title: 'Match Score', desc: 'Get a 0–100% score showing how well you match the job.' },
  { icon: '🔑', title: 'Missing Keywords', desc: 'See exactly what skills and terms are absent from your resume.' },
  { icon: '💡', title: 'Actionable Tips', desc: 'Specific, targeted advice — not generic career fluff.' },
  { icon: '📈', title: 'Track Progress', desc: 'Compare scores over time and see your resume improve.' },
];

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="page-wrapper">
      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">
          <span>⚡</span> AI-Powered Resume Intelligence
        </div>
        <h1 className="hero-title">
          Get <span className="gradient-text">Hired Faster</span><br />
          with AI Resume Analysis
        </h1>
        <p className="hero-subtitle">
          Upload your resume, paste a job description, and get a match score,
          missing keywords, and tailored improvement tips — powered by Claude AI.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to={user ? '/analyze' : '/register'}
            id="get-started-btn"
            className="btn btn-primary btn-lg"
          >
            ⚡ {user ? 'Analyze Resume' : 'Get Started Free'}
          </Link>
          {!user && (
            <Link to="/login" className="btn btn-secondary btn-lg">
              Sign In
            </Link>
          )}
        </div>
      </section>

      {/* Fake Score Preview */}
      <section style={{ marginBottom: '80px' }}>
        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '40px',
            maxWidth: '720px',
            margin: '0 auto',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
              Sample Analysis Result
            </div>
            <div style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 700 }}>
              Senior Frontend Engineer — Stripe
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* Score Circle */}
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '120px', height: '120px', borderRadius: '50%',
                  background: 'conic-gradient(#34d399 0deg 266deg, rgba(255,255,255,0.06) 266deg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 30px rgba(52,211,153,0.25)',
                }}
              >
                <div
                  style={{
                    width: '88px', height: '88px', borderRadius: '50%',
                    background: 'var(--bg-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ fontFamily: 'Outfit', fontSize: '1.6rem', fontWeight: 800, color: '#34d399' }}>74%</div>
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Match Score</div>
            </div>

            {/* Sample keywords */}
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>
                ❌ Missing keywords
              </div>
              <div className="keyword-list" style={{ marginBottom: '16px' }}>
                {['TypeScript', 'GraphQL', 'Design Systems', 'A/B Testing', 'Figma'].map((k) => (
                  <span key={k} className="keyword-tag keyword-missing">{k}</span>
                ))}
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>
                ✅ Already matching
              </div>
              <div className="keyword-list">
                {['React', 'CSS', 'REST APIs', 'Git'].map((k) => (
                  <span key={k} className="keyword-tag keyword-strength">{k}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ marginBottom: '80px' }}>
        <h2
          style={{
            fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 700,
            textAlign: 'center', marginBottom: '48px',
          }}
        >
          Everything You Need to <span className="text-gradient">Land the Job</span>
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {features.map((f) => (
            <div key={f.title} className="card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '44px', height: '44px', minWidth: '44px',
                  background: 'var(--accent-glow)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem',
                }}
              >
                {f.icon}
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{f.title}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ marginBottom: '80px' }}>
        <div
          style={{
            background: 'var(--gradient-card)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 'var(--radius-xl)',
            padding: '60px 40px',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 700, marginBottom: '12px' }}>
            Ready to Optimize Your Resume?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '480px', margin: '0 auto 32px' }}>
            Join job seekers who are using AI to get more callbacks with smarter resumes.
          </p>
          <Link
            to={user ? '/analyze' : '/register'}
            id="cta-bottom-btn"
            className="btn btn-primary btn-lg"
            style={{ padding: '16px 40px', fontSize: '1.1rem' }}
          >
            ⚡ Start Analyzing Now — It's Free
          </Link>
        </div>
      </section>
    </div>
  );
}
