import { BADGE_DEFS } from '../hooks/useProgress'

const NAV = [
  { icon: 'explore',      label: 'Keşfet',   key: 'explore' },
  { icon: 'menu_book',    label: 'Öğren',    key: 'learn',  active: true },
  { icon: 'auto_awesome', label: 'Rozetler', key: 'badges' },
  { icon: 'person',       label: 'Profil',   key: 'profile' },
]

export default function Dashboard({ profile, progress, earnedBadges, settings, onPlay, onDialogue, onBack, onParent }) {
  const streakIcon  = progress.streak >= 7 ? '🔥🔥' : progress.streak >= 3 ? '🔥' : '💤'
  const cardGoal    = settings?.dailyCardGoal ?? 10
  const todayCards  = progress.todayCards ?? 0
  const cardPct     = Math.min(100, Math.round((todayCards / cardGoal) * 100))
  const goalDone    = todayCards >= cardGoal
  const level       = Math.max(1, Math.floor((progress.totalPoints ?? 0) / 100) + 1)

  const navClick = (key) => {
    if (key === 'explore') onPlay?.()
    if (key === 'profile') onBack?.()
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100svh',
      background: '#EEF7FF',
      fontFamily: "'Plus Jakarta Sans', 'Be Vietnam Pro', sans-serif",
      color: '#0d1b2a',
    }}>

      {/* Scrollable içerik */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 100px' }}>

        {/* Üst bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button onClick={onBack} style={{
            background: '#b3e4ef', border: 'none', borderRadius: 12,
            color: '#00687e', width: 40, height: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 18, fontWeight: 700,
          }}>←</button>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#0d1b2a' }}>{profile.name}</div>
            <div style={{ fontSize: 12, color: '#4a6572', fontWeight: 600 }}>Hoş geldin! 👋</div>
          </div>

          <button onClick={onParent} style={{
            background: '#ffdcc2', border: 'none', borderRadius: 12,
            color: '#9c4600', width: 40, height: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>lock</span>
          </button>
        </div>

        {/* Maskot */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20,
        }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            background: '#ffffff',
            border: '3px solid #b3e4ef',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 56,
            boxShadow: '0 4px 20px rgba(0,104,126,0.12)',
          }}>
            {profile?.avatar ?? '🦅'}
          </div>
          <div style={{ marginTop: 8, fontSize: 13, color: '#4a6572', fontWeight: 600 }}>
            {profile?.name}
          </div>
        </div>

        {/* 3 stat kartı */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
          {[
            { icon: streakIcon,  value: progress.streak,       label: 'Seri' },
            { icon: '⭐',         value: progress.totalPoints,  label: 'Puan' },
            { icon: '🏅',         value: `L${level}`,           label: 'Seviye' },
          ].map((s, i) => (
            <div key={i} style={{
              background: '#ffffff',
              border: '1.5px solid #c0d8e4',
              borderRadius: 18,
              padding: '14px 8px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}>
              <span style={{ fontSize: 24 }}>{s.icon}</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#0d1b2a', lineHeight: 1 }}>{s.value}</span>
              <span style={{ fontSize: 10, color: '#6b8fa1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Günlük hedef */}
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #c0d8e4',
          borderRadius: 18,
          padding: '16px',
          marginBottom: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#0d1b2a' }}>Bugünkü Hedef 🎯</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: goalDone ? '#00687e' : '#9c4600' }}>
              {goalDone ? '✅ Tamam!' : `${todayCards} / ${cardGoal}`}
            </span>
          </div>
          <div style={{ height: 10, background: '#e4eef9', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 10,
              background: goalDone
                ? 'linear-gradient(90deg,#00b896,#00687e)'
                : 'linear-gradient(90deg,#ff9800,#9c4600)',
              width: `${cardPct}%`,
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>

        {/* Rozetler */}
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #c0d8e4',
          borderRadius: 18,
          padding: '16px',
          marginBottom: 20,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#0d1b2a' }}>Rozetler</span>
            <span style={{ fontSize: 11, color: '#6b8fa1', fontWeight: 600 }}>
              {earnedBadges.length} / {BADGE_DEFS.length}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {BADGE_DEFS.map(b => {
              const earned = earnedBadges.some(e => e.id === b.id)
              return (
                <div key={b.id} title={`${b.name}: ${b.desc}`} style={{
                  aspectRatio: '1/1', borderRadius: 14,
                  background: earned ? '#b3e4ef' : '#f0f6fd',
                  border: `1.5px solid ${earned ? '#00687e' : '#c0d8e4'}`,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 2,
                  opacity: earned ? 1 : 0.45,
                  filter: earned ? 'none' : 'grayscale(1)',
                }}>
                  <span style={{ fontSize: 20 }}>{b.icon}</span>
                  <span style={{ fontSize: 8, fontWeight: 700, color: earned ? '#00687e' : '#6b8fa1', textAlign: 'center', lineHeight: 1.1, padding: '0 2px' }}>
                    {b.name.split(' ')[0]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Butonlar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={onPlay} style={{
            height: 64, borderRadius: 20, border: 'none',
            background: 'linear-gradient(135deg,#ff9800,#9c4600)',
            color: '#ffffff', fontSize: 20, fontWeight: 900,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            cursor: 'pointer', boxShadow: '0 4px 20px rgba(156,70,0,0.3)',
            transition: 'transform 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 28, fontVariationSettings: "'FILL' 1" }}>play_circle</span>
            Hadi Oyna!
          </button>

          <button onClick={onDialogue} style={{
            height: 64, borderRadius: 20, border: 'none',
            background: 'linear-gradient(135deg,#00b896,#00687e)',
            color: '#ffffff', fontSize: 20, fontWeight: 900,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,104,126,0.25)',
            transition: 'transform 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 28, fontVariationSettings: "'FILL' 1" }}>forum</span>
            Diyaloglar
          </button>
        </div>
      </div>

      {/* Alt nav */}
      <nav style={{
        flexShrink: 0,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1.5px solid #c0d8e4',
        borderRadius: '3rem 3rem 0 0',
        display: 'flex', justifyContent: 'space-around',
        padding: '10px 0 18px',
        boxShadow: '0 -4px 20px rgba(0,104,126,0.08)',
      }}>
        {NAV.map(item => (
          <button
            key={item.key}
            onClick={() => navClick(item.key)}
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
      </nav>
    </div>
  )
}
