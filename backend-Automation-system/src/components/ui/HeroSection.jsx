export default function HeroSection({ onStart }) {
  return (
    <section style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: '40px 24px', textAlign: 'center', position: 'relative',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 500, borderRadius: '50%', filter: 'blur(120px)', opacity: 0.15,
        background: 'radial-gradient(circle, #7c5cfc 0%, #c084fc 40%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Badge */}
      <div className="fade-in" style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px',
        borderRadius: 20, background: 'rgba(124,92,252,0.1)', border: '1px solid rgba(124,92,252,0.2)',
        fontSize: 13, fontWeight: 600, color: 'var(--accent-light)', marginBottom: 32,
      }}>
        ⚡ AI-Powered Backend Generator
      </div>

      {/* Headline */}
      <h1 className="fade-in" style={{
        fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900, lineHeight: 1.1,
        letterSpacing: '-0.03em', maxWidth: 700, marginBottom: 20,
      }}>
        Build Your Backend in{' '}
        <span className="gradient-text">Seconds</span>
        , Not Days
      </h1>

      {/* Subtext */}
      <p className="fade-in" style={{
        fontSize: 18, color: 'var(--text-2)', maxWidth: 520, lineHeight: 1.6, marginBottom: 40,
      }}>
        Describe your API in plain English. AutoMind generates production-ready Node.js code with JWT auth, Mongoose models, and Express routes.
      </p>

      {/* CTA */}
      <button className="fade-in" onClick={onStart} style={{
        padding: '16px 40px', borderRadius: 14, border: 'none',
        background: 'linear-gradient(135deg, var(--accent), #9b6dff)',
        color: '#fff', fontSize: 17, fontWeight: 700, cursor: 'pointer',
        boxShadow: '0 0 30px rgba(124,92,252,0.3)',
        transition: 'transform .2s, box-shadow .2s',
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 50px rgba(124,92,252,0.5)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(124,92,252,0.3)'; }}
      >
        🚀 Start Building — Free
      </button>

      {/* Trust badges */}
      <div className="fade-in" style={{
        display: 'flex', gap: 24, marginTop: 48, fontSize: 13, color: 'var(--text-3)',
      }}>
        {['JWT Auth', 'Mongoose Models', 'Express Routes', 'Rate Limiting'].map(t => (
          <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'var(--green)', fontSize: 10 }}>●</span> {t}
          </span>
        ))}
      </div>
    </section>
  );
}
