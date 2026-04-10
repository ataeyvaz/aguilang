import { CATEGORIES } from '../data/categories'
import { readActiveCategories } from '../hooks/useParentControls'

const CARD_COLORS = {
  animals:    { bg: '#e8f5e9', border: '#a5d6a7', accent: '#2e7d32' },
  colors:     { bg: '#fce4ec', border: '#f48fb1', accent: '#c2185b' },
  numbers:    { bg: '#e3f2fd', border: '#90caf9', accent: '#1565c0' },
  fruits:     { bg: '#fff3e0', border: '#ffcc80', accent: '#e65100' },
  vegetables: { bg: '#f1f8e9', border: '#c5e1a5', accent: '#558b2f' },
  body:       { bg: '#f3e5f5', border: '#ce93d8', accent: '#7b1fa2' },
  family:     { bg: '#fbe9e7', border: '#ffab91', accent: '#bf360c' },
  school:     { bg: '#fffde7', border: '#fff176', accent: '#f57f17' },
  food:       { bg: '#fff8e1', border: '#ffe082', accent: '#ff8f00' },
  greetings:  { bg: '#e0f7fa', border: '#80deea', accent: '#00838f' },
  questions:  { bg: '#ede7f6', border: '#b39ddb', accent: '#4527a0' },
  clothing:   { bg: '#fce4ec', border: '#ef9a9a', accent: '#b71c1c' },
  home:       { bg: '#efebe9', border: '#bcaaa4', accent: '#4e342e' },
  transport:  { bg: '#e1f5fe', border: '#81d4fa', accent: '#0277bd' },
  time:       { bg: '#e0f2f1', border: '#80cbc4', accent: '#00695c' },
  jobs:       { bg: '#f9fbe7', border: '#dce775', accent: '#827717' },
  sports:     { bg: '#ffe0e6', border: '#f48fb1', accent: '#880e4f' },
  places:     { bg: '#ede7f6', border: '#9fa8da', accent: '#283593' },
  adjectives: { bg: '#fff3e0', border: '#ffcc80', accent: '#9c4600' },
  verbs:      { bg: '#e8f5e9', border: '#a5d6a7', accent: '#00687e' },
}

function wordCount(cat) {
  try {
    const tr = cat.data?.translations
    if (!tr) return 0
    const first = Object.values(tr)[0]
    return first?.words?.length ?? 0
  } catch { return 0 }
}

const NAV = [
  { icon: 'explore',        label: 'Keşfet',  screen: 'dashboard' },
  { icon: 'menu_book',      label: 'Öğren',   screen: 'category',  active: true },
  { icon: 'auto_awesome',   label: 'Rozetler', screen: 'badges' },
  { icon: 'person',         label: 'Profil',  screen: 'profile' },
]

export default function CategorySelect({ profile, lang, onSelectCategory, onNavigate, onBack }) {
  const langLabels = { en: 'English', de: 'Deutsch', es: 'Español' }
  const langFlags  = { en: '🇬🇧', de: '🇩🇪', es: '🇪🇸' }

  // Sadece ebeveynin aktif bıraktığı kategorileri göster
  const activeIds = readActiveCategories()
  const visibleCategories = CATEGORIES.filter(c => activeIds.includes(c.id))

  return (
    <div style={{
      minHeight: '100vh',
      background: '#EEF7FF',
      fontFamily: "'Plus Jakarta Sans', 'Be Vietnam Pro', sans-serif",
      color: '#0d1b2a',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Header */}
      <div style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1.5px solid #c0d8e4',
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <button onClick={onBack} style={{
          background: '#b3e4ef', border: 'none',
          borderRadius: 12, color: '#00687e',
          width: 40, height: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 18, fontWeight: 700, flexShrink: 0,
        }}>←</button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: '#00687e', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>
            {langFlags[lang]} {langLabels[lang]} · {profile?.name}
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#0d1b2a', lineHeight: 1.2 }}>
            Kategori Seç
          </div>
        </div>

        <div style={{
          background: '#ffdcc2', border: '1.5px solid #ffab91',
          borderRadius: 20, padding: '5px 12px',
          fontSize: 13, fontWeight: 700, color: '#9c4600',
        }}>
          ⭐ {profile?.points || 0}
        </div>
      </div>

      {/* Subtitle */}
      <div style={{ padding: '12px 20px 4px' }}>
        <p style={{ margin: 0, fontSize: 14, color: '#4a6572', fontWeight: 600 }}>
          Bugün ne öğrenmek istersin? 🚀
        </p>
      </div>

      {/* Kategori grid */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '8px 16px 100px',
        maxWidth: 480, margin: '0 auto', width: '100%',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 10, alignContent: 'start',
        }}>
        {visibleCategories.map(cat => {
          const c = CARD_COLORS[cat.id] ?? { bg: '#f5f5f5', border: '#e0e0e0', accent: '#666' }
          const count = wordCount(cat)
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              style={{
                background: c.bg,
                border: `2px solid ${c.border}`,
                borderRadius: 16,
                height: 120,
                display: 'flex', flexDirection: 'column',
                alignItems: 'flex-start', justifyContent: 'space-between',
                padding: '12px 12px 10px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                transition: 'transform 0.15s, box-shadow 0.15s',
                textAlign: 'left',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'
              }}
            >
              {/* Emoji */}
              <div style={{
                width: 42, height: 42, borderRadius: '50%',
                background: 'rgba(255,255,255,0.8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              }}>
                {cat.icon}
              </div>

              {/* İsim + kelime sayısı */}
              <div>
                <div style={{
                  fontSize: 12, fontWeight: 800,
                  color: '#0d1b2a', lineHeight: 1.2, marginBottom: 3,
                }}>
                  {cat.label}
                </div>
                {count > 0 && (
                  <div style={{
                    display: 'inline-block',
                    background: 'rgba(255,255,255,0.7)',
                    border: `1px solid ${c.border}`,
                    color: c.accent,
                    fontSize: 10, fontWeight: 700,
                    padding: '2px 7px', borderRadius: 10,
                  }}>
                    {count} kelime
                  </div>
                )}
              </div>
            </button>
          )
        })}
        </div>
      </div>

      {/* Alt nav */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1.5px solid #c0d8e4',
        borderRadius: '3rem 3rem 0 0',
        display: 'flex', justifyContent: 'space-around',
        padding: '10px 0 18px',
        zIndex: 50,
        boxShadow: '0 -4px 20px rgba(0,104,126,0.08)',
      }}>
        {NAV.map(item => (
          <button
            key={item.screen}
            onClick={() => item.screen === 'profile' ? onBack?.() : onNavigate?.(item.screen)}
            style={{
              background: item.active ? '#b3e4ef' : 'transparent',
              border: 'none', borderRadius: 16,
              padding: '8px 16px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 3,
              cursor: 'pointer',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 22,
                color: item.active ? '#00687e' : '#6b8fa1',
                fontVariationSettings: item.active ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {item.icon}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700,
              letterSpacing: 0.5, textTransform: 'uppercase',
              color: item.active ? '#00687e' : '#6b8fa1',
            }}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
