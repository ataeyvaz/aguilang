import { useState, useEffect } from 'react'
import { CATEGORIES } from '../data/categories'
import { getEnergyPatch, readVacationMode } from '../hooks/useParentControls'

const LANG_LABELS = { en: 'İngilizce', de: 'Almanca', es: 'İspanyolca' }
const LANG_FLAGS  = { en: '🇬🇧', de: '🇩🇪', es: '🇪🇸' }

const MASCOT_MESSAGES = [
  'Bugün uçmaya hazır mısın? 🦅',
  'Harika! Hadi başlayalım! 🚀',
  'Sen yapabilirsin, kartal gibi! 💪',
]

/**
 * DailyMission — Çocuk uygulamayı açınca bu ekran gelir
 * Props: { todayPlan, profile, onStart, onSkip }
 */
export default function DailyMission({ todayPlan, profile, onStart, onSkip }) {
  const [countdown, setCountdown] = useState(10)
  const [mascotMsg] = useState(() => MASCOT_MESSAGES[Math.floor(Math.random() * MASCOT_MESSAGES.length)])
  const [started, setStarted] = useState(false)

  // Enerji modunu todayPlan üzerine uygula
  const basePlan = todayPlan ?? {
    categoryId: 'animals',
    langId: 'en',
    cardLimit: 10,
    durationMinutes: 15,
    quizEnabled: true,
    gameEnabled: false,
  }
  const energyPatch = getEnergyPatch()
  const plan = { ...basePlan, ...energyPatch }

  const isVacation = readVacationMode().active
  const category = CATEGORIES.find(c => c.id === plan.categoryId) ?? CATEGORIES[0]

  useEffect(() => {
    if (started) return
    if (countdown <= 0) {
      setStarted(true)
      onStart?.(plan)
      return
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown, started, plan, onStart])

  const handleStart = () => {
    if (started) return
    setStarted(true)
    onStart?.(plan)
  }

  // Countdown ring progress (0–10)
  const radius = 22
  const circ   = 2 * Math.PI * radius
  const offset = circ * (1 - countdown / 10)

  return (
    <div style={{
      minHeight: '100svh',
      background: '#EEF7FF',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
      fontFamily: "'Nunito', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient blobs */}
      <div style={{
        position: 'absolute', top: -60, left: -60,
        width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,104,126,0.10) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -60, right: -60,
        width: 240, height: 240, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(156,70,0,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Tatil modu banner */}
      {isVacation && (
        <div style={{
          position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
          background: '#fff8e1', border: '1.5px solid #fde68a',
          borderRadius: 12, padding: '6px 14px',
          fontSize: 13, fontWeight: 700, color: '#9c4600',
          whiteSpace: 'nowrap', zIndex: 2,
        }}>
          🏖️ Tatildesin, streak donduruldu!
        </div>
      )}

      {/* Skip button */}
      {onSkip && (
        <button
          onClick={onSkip}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'transparent', border: 'none',
            color: '#888', fontSize: 13, cursor: 'pointer',
            fontFamily: 'inherit', padding: '4px 8px',
          }}
        >
          Geç →
        </button>
      )}

      {/* Mascot */}
      <div style={{
        width: 96, height: 96, borderRadius: '50%',
        background: 'linear-gradient(135deg, #b3e4ef 0%, #EEF7FF 100%)',
        border: '3px solid #00687e',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 52, marginBottom: 12,
        boxShadow: '0 4px 16px rgba(0,104,126,0.15)',
      }}>
        🦅
      </div>

      {/* Mascot speech bubble */}
      <div style={{
        background: '#fff',
        border: '2px solid #b3e4ef',
        borderRadius: 16,
        padding: '10px 18px',
        fontSize: 15,
        fontWeight: 700,
        color: '#00687e',
        marginBottom: 28,
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,104,126,0.08)',
        position: 'relative',
      }}>
        {mascotMsg}
        {/* tail */}
        <div style={{
          position: 'absolute', top: -10, left: '50%',
          transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderBottom: '10px solid #b3e4ef',
        }} />
      </div>

      {/* Mission card */}
      <div style={{
        background: '#fff',
        borderRadius: 24,
        padding: '24px 28px',
        width: '100%',
        maxWidth: 360,
        boxShadow: '0 4px 24px rgba(0,104,126,0.10)',
        border: '2px solid #b3e4ef',
        marginBottom: 28,
      }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#9c4600', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 }}>
          BUGÜNKÜ GÖREV
        </div>

        {/* Category */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: '#EEF7FF', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 28,
            border: '2px solid #b3e4ef',
          }}>
            {category.icon}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#003d47', fontFamily: "'Baloo 2', sans-serif" }}>
              {category.label}
            </div>
            <div style={{ fontSize: 13, color: '#666', marginTop: 1 }}>
              {LANG_FLAGS[plan.langId]} {LANG_LABELS[plan.langId] ?? plan.langId}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{
            flex: 1, background: '#EEF7FF', borderRadius: 12,
            padding: '10px 8px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#00687e' }}>{plan.cardLimit}</div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>kart</div>
          </div>
          <div style={{
            flex: 1, background: '#EEF7FF', borderRadius: 12,
            padding: '10px 8px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#00687e' }}>{plan.durationMinutes} dk</div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>süre</div>
          </div>
          {plan.quizEnabled && (
            <div style={{
              flex: 1, background: '#fff8e1', borderRadius: 12,
              padding: '10px 8px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 18 }}>📝</div>
              <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>quiz</div>
            </div>
          )}
          {plan.gameEnabled && (
            <div style={{
              flex: 1, background: '#f0fff4', borderRadius: 12,
              padding: '10px 8px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 18 }}>🎮</div>
              <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>oyun</div>
            </div>
          )}
        </div>
      </div>

      {/* Start button with countdown ring */}
      <button
        onClick={handleStart}
        disabled={started}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          width: '100%', maxWidth: 360,
          padding: '16px 24px',
          background: started ? '#a0d4de' : 'linear-gradient(135deg, #00687e 0%, #0097b2 100%)',
          color: '#fff',
          border: 'none', borderRadius: 18,
          fontSize: 20, fontWeight: 800,
          cursor: started ? 'default' : 'pointer',
          fontFamily: "'Baloo 2', sans-serif",
          boxShadow: started ? 'none' : '0 6px 20px rgba(0,104,126,0.35)',
          transition: 'all 0.2s',
          letterSpacing: 0.3,
        }}
      >
        {/* SVG countdown ring */}
        <svg width={52} height={52} style={{ flexShrink: 0 }}>
          {/* background track */}
          <circle cx={26} cy={26} r={radius} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={4} />
          {/* progress arc */}
          <circle
            cx={26} cy={26} r={radius}
            fill="none"
            stroke="#fff"
            strokeWidth={4}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 26 26)"
            style={{ transition: 'stroke-dashoffset 0.9s linear' }}
          />
          {/* countdown number */}
          <text
            x={26} y={26}
            textAnchor="middle" dominantBaseline="central"
            fill="#fff"
            fontSize={15}
            fontWeight="bold"
            fontFamily="Nunito, sans-serif"
          >
            {countdown}
          </text>
        </svg>
        Başla! 🚀
      </button>

      <div style={{ marginTop: 12, fontSize: 12, color: '#aaa' }}>
        {countdown} saniye sonra otomatik başlıyor
      </div>
    </div>
  )
}
