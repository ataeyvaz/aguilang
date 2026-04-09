const LANGUAGES = [
  {
    id: 'en',
    flagCode: 'gb',
    label: 'İngilizce',
    native: 'English',
    subtitle: 'Kraliyet Diyarı',
    bg: '#eaf4ff',
    border: '#90caf9',
    accent: '#1565c0',
  },
  {
    id: 'de',
    flagCode: 'de',
    label: 'Almanca',
    native: 'Deutsch',
    subtitle: 'Şato Kalesi',
    bg: '#fff8e1',
    border: '#ffe082',
    accent: '#e65100',
  },
  {
    id: 'es',
    flagCode: 'es',
    label: 'İspanyolca',
    native: 'Español',
    subtitle: 'Güneşli Kıyılar',
    bg: '#fff0f0',
    border: '#ef9a9a',
    accent: '#c62828',
  },
]

export default function LanguageSelect({ profile, onSelectLang, onBack }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#EEF7FF',
      fontFamily: "'Plus Jakarta Sans', 'Be Vietnam Pro', sans-serif",
      color: '#0d1b2a',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: 40,
    }}>
      {/* Dekoratif glow */}
      <div style={{
        position: 'fixed', top: '-10%', right: '-10%',
        width: '50%', height: '50%', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,104,126,0.07) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Header */}
      <div style={{
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
        position: 'relative', zIndex: 1,
      }}>
        <button onClick={onBack} style={{
          background: '#b3e4ef',
          border: 'none',
          borderRadius: 12,
          color: '#00687e', width: 40, height: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 18, fontWeight: 700,
        }}>←</button>
        <span style={{ fontSize: 18, fontWeight: 900, color: '#00687e' }}>
          🦅 AguiLang
        </span>
      </div>

      {/* Hero */}
      <div style={{
        textAlign: 'center', padding: '20px 20px 28px',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>👋</div>
        <h1 style={{
          margin: 0, fontSize: 30, fontWeight: 900,
          color: '#0d1b2a', lineHeight: 1.2,
        }}>
          Merhaba, {profile?.name}!
        </h1>
        <p style={{ margin: '8px 0 0', fontSize: 15, color: '#4a6572', fontWeight: 600 }}>
          Hangi dili öğrenmek istiyorsun?
        </p>
      </div>

      {/* Türkçe — Ana Dil */}
      <div style={{
        margin: '0 20px 16px',
        padding: '14px 18px',
        background: '#ffffff',
        border: '2px solid #c0d8e4',
        borderRadius: 18,
        display: 'flex', alignItems: 'center', gap: 14,
        position: 'relative', zIndex: 1,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}>
        <div style={{ width: 72, height: 48, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
          <img src="/flags/tr.png" alt="tr" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: '#6b8fa1', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 2 }}>
            Ana Dil
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#0d1b2a' }}>Türkçe</div>
        </div>
        <span style={{
          background: '#b3e4ef', color: '#00687e',
          fontSize: 11, fontWeight: 700,
          padding: '4px 10px', borderRadius: 20,
          letterSpacing: 0.5, textTransform: 'uppercase',
        }}>Aktif</span>
      </div>

      {/* Divider */}
      <div style={{
        margin: '0 20px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ flex: 1, height: 1.5, background: '#c0d8e4', borderRadius: 2 }} />
        <span style={{ fontSize: 12, color: '#6b8fa1', fontWeight: 700 }}>Öğreneceğin dil</span>
        <div style={{ flex: 1, height: 1.5, background: '#c0d8e4', borderRadius: 2 }} />
      </div>

      {/* Dil Kartları */}
      <div style={{
        padding: '0 20px',
        display: 'flex', flexDirection: 'column', gap: 12,
        position: 'relative', zIndex: 1,
      }}>
        {LANGUAGES.map(lang => (
          <button
            key={lang.id}
            onClick={() => onSelectLang(lang.id)}
            style={{
              background: lang.bg,
              border: `2px solid ${lang.border}`,
              borderRadius: 20,
              padding: '16px 18px',
              display: 'flex', alignItems: 'center', gap: 14,
              cursor: 'pointer', textAlign: 'left',
              transition: 'transform 0.15s, box-shadow 0.15s',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.1)`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ width: 72, height: 48, borderRadius: 8, border: `2px solid ${lang.border}`, overflow: 'hidden', flexShrink: 0 }}>
              <img src={`/flags/${lang.flagCode}.png`} alt={lang.flagCode} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: '#6b8fa1', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 2 }}>
                {lang.subtitle}
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#0d1b2a', lineHeight: 1.2 }}>
                {lang.label}
              </div>
              <div style={{ fontSize: 13, color: lang.accent, fontWeight: 700 }}>
                {lang.native}
              </div>
            </div>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: '#ffffff',
              border: `1.5px solid ${lang.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: lang.accent, fontSize: 18, fontWeight: 700,
            }}>→</div>
          </button>
        ))}
      </div>
    </div>
  )
}
