const PROFILES = [
  {
    id: 'kartal',
    name: 'Kartal',
    avatar: '/avatars/kartal.jpg',
    initial: 'K',
    accent: '#00687e',
    accentBg: '#b3e4ef',
    emoji: '🦅',
  },
  {
    id: 'emir',
    name: 'Emir',
    avatar: '/avatars/emir.jpg',
    initial: 'E',
    accent: '#9c4600',
    accentBg: '#ffdcc2',
    emoji: '⚡',
  },
]

function Avatar({ src, initial, accent, accentBg, size = 96 }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      overflow: 'hidden',
      background: accentBg,
      border: `3px solid ${accent}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <img
        src={src}
        alt={initial}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }}
      />
      <div style={{
        display: 'none', width: '100%', height: '100%',
        alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.4, fontWeight: 900,
        color: accent, background: accentBg,
      }}>
        {initial}
      </div>
    </div>
  )
}

export default function ProfileSelect({ onSelect }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#EEF7FF',
      fontFamily: "'Plus Jakarta Sans', 'Be Vietnam Pro', sans-serif",
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Dekoratif arka plan daireler */}
      <div style={{
        position: 'fixed', top: '-15%', right: '-15%',
        width: '55%', height: '55%', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,104,126,0.07) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: '-15%', left: '-15%',
        width: '60%', height: '60%', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(156,70,0,0.05) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* İçerik */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px 100px',
        position: 'relative', zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>🦅</div>
          <h1 style={{
            margin: 0, fontSize: 36, fontWeight: 900,
            color: '#00687e', letterSpacing: -0.5,
          }}>
            AguiLang
          </h1>
          <p style={{
            margin: '8px 0 0', fontSize: 16,
            color: '#4a6572', fontWeight: 600,
          }}>
            Kim öğreniyor?
          </p>
        </div>

        {/* Profil kartları */}
        <div style={{
          display: 'flex', gap: 16,
          width: '100%', maxWidth: 360,
        }}>
          {PROFILES.map(p => (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              style={{
                flex: 1,
                background: '#ffffff',
                border: `2px solid ${p.accentBg}`,
                borderRadius: 24,
                padding: '28px 16px',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 14,
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.1)`
                e.currentTarget.style.borderColor = p.accent
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'
                e.currentTarget.style.borderColor = p.accentBg
              }}
            >
              <Avatar src={p.avatar} initial={p.initial} accent={p.accent} accentBg={p.accentBg} size={88} />

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#0d1b2a' }}>
                  {p.name}
                </div>
                <div style={{
                  marginTop: 6,
                  display: 'inline-block',
                  background: p.accentBg,
                  color: p.accent,
                  fontSize: 11, fontWeight: 700,
                  padding: '3px 10px', borderRadius: 20,
                  letterSpacing: 0.5, textTransform: 'uppercase',
                }}>
                  Başla →
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Alt nav (dekoratif) */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1.5px solid #c0d8e4',
        borderRadius: '3rem 3rem 0 0',
        display: 'flex', justifyContent: 'center',
        alignItems: 'center',
        padding: '14px 0 20px',
        zIndex: 50,
      }}>
        <p style={{ margin: 0, fontSize: 12, color: '#6b8fa1', fontWeight: 600 }}>
          AguiLang · Dil öğrenme uygulaması 🦅
        </p>
      </div>
    </div>
  )
}
