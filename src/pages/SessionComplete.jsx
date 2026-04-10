import { useEffect, useRef } from 'react'

const MASCOT_MSGS = {
  perfect: 'Mükemmel! Kartal gibi uçtun! 🦅',
  great:   'Harika iş! Çok başarılısın! ⭐',
  good:    'Güzel çalışma! Devam et! 💪',
  ok:      'Aferin! Pratik yaparsan daha iyi olacaksın!',
}

function getMascotMsg(pct) {
  if (pct >= 90) return MASCOT_MSGS.perfect
  if (pct >= 70) return MASCOT_MSGS.great
  if (pct >= 50) return MASCOT_MSGS.good
  return MASCOT_MSGS.ok
}

function Confetti() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width  = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const COLORS = ['#00687e', '#9c4600', '#f59e0b', '#10b981', '#6366f1', '#ec4899']
    const pieces = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      r: Math.random() * 7 + 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      speed: Math.random() * 2.5 + 1,
      swing: Math.random() * 2 - 1,
      angle: Math.random() * Math.PI * 2,
    }))

    let raf
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      pieces.forEach(p => {
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.angle)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 2)
        ctx.restore()
        p.y += p.speed
        p.x += p.swing * 0.5
        p.angle += 0.03
        if (p.y > canvas.height) {
          p.y = -10
          p.x = Math.random() * canvas.width
        }
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    const stop = setTimeout(() => cancelAnimationFrame(raf), 4000)
    return () => { cancelAnimationFrame(raf); clearTimeout(stop) }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0,
      }}
    />
  )
}

/**
 * SessionComplete — Oturum sonu ekranı
 * Props: { sessionData, hardWords, onPlayAgain, onHome }
 * sessionData: { categoryId, cardsStudied, correct, wrong, points, durationSeconds }
 * hardWords: [{ id, wrong, avgResponseTime }]
 */
export default function SessionComplete({ sessionData, hardWords = [], onPlayAgain, onHome }) {
  const data = sessionData ?? { cardsStudied: 0, correct: 0, wrong: 0, points: 0, durationSeconds: 0 }
  const pct  = data.cardsStudied > 0 ? Math.round((data.correct / data.cardsStudied) * 100) : 0
  const mins = Math.floor(data.durationSeconds / 60)
  const secs = data.durationSeconds % 60
  const mascotMsg = getMascotMsg(pct)

  const isPerfect = pct >= 90

  return (
    <div style={{
      minHeight: '100svh',
      background: '#EEF7FF',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '28px 20px 32px',
      fontFamily: "'Nunito', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {isPerfect && <Confetti />}

      {/* Ambient blobs */}
      <div style={{
        position: 'absolute', top: -80, right: -80,
        width: 260, height: 260, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,104,126,0.10) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Mascot */}
        <div style={{
          width: 100, height: 100, borderRadius: '50%',
          background: isPerfect
            ? 'linear-gradient(135deg, #fde68a 0%, #fbbf24 100%)'
            : 'linear-gradient(135deg, #b3e4ef 0%, #EEF7FF 100%)',
          border: `3px solid ${isPerfect ? '#f59e0b' : '#00687e'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 56, marginBottom: 10,
          boxShadow: isPerfect
            ? '0 6px 24px rgba(245,158,11,0.30)'
            : '0 4px 16px rgba(0,104,126,0.15)',
        }}>
          🦅
        </div>

        {/* Speech bubble */}
        <div style={{
          background: '#fff', border: '2px solid #b3e4ef',
          borderRadius: 16, padding: '10px 18px',
          fontSize: 14, fontWeight: 700, color: '#00687e',
          marginBottom: 24, textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,104,126,0.08)',
        }}>
          {mascotMsg}
        </div>

        {/* Headline */}
        <div style={{
          fontSize: 28, fontWeight: 800, color: '#003d47',
          fontFamily: "'Baloo 2', sans-serif",
          marginBottom: 4, textAlign: 'center',
        }}>
          Görev Tamamlandı! 🎉
        </div>
        <div style={{ fontSize: 14, color: '#666', marginBottom: 24, textAlign: 'center' }}>
          {mins > 0 ? `${mins} dakika ` : ''}{secs} saniye çalıştın
        </div>

        {/* Stats grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 12, width: '100%', marginBottom: 20,
        }}>
          <StatCard emoji="📇" label="Kart" value={data.cardsStudied} color="#00687e" />
          <StatCard emoji="✅" label="Doğru" value={data.correct} color="#10b981" />
          <StatCard emoji="❌" label="Yanlış" value={data.wrong} color="#ef4444" />
          <StatCard emoji="⭐" label="Puan" value={`+${data.points}`} color="#f59e0b" />
        </div>

        {/* Accuracy bar */}
        <div style={{
          width: '100%', background: '#fff',
          borderRadius: 16, padding: '16px 20px',
          boxShadow: '0 2px 12px rgba(0,104,126,0.08)',
          border: '2px solid #b3e4ef',
          marginBottom: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#003d47' }}>Başarı oranı</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#00687e' }}>{pct}%</span>
          </div>
          <div style={{ height: 10, background: '#EEF7FF', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${pct}%`,
              background: pct >= 70
                ? 'linear-gradient(90deg, #00687e, #10b981)'
                : 'linear-gradient(90deg, #f59e0b, #ef4444)',
              borderRadius: 99,
              transition: 'width 1s ease',
            }} />
          </div>
        </div>

        {/* Hard words */}
        {hardWords.length > 0 && (
          <div style={{
            width: '100%', background: '#fff8e1',
            borderRadius: 16, padding: '16px 20px',
            border: '2px solid #fde68a',
            marginBottom: 24,
          }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#9c4600', marginBottom: 10 }}>
              🔁 Tekrar çalış
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {hardWords.map(w => (
                <span key={w.id} style={{
                  background: '#fff',
                  border: '1px solid #fbbf24',
                  borderRadius: 8, padding: '4px 10px',
                  fontSize: 13, fontWeight: 700, color: '#92400e',
                }}>
                  {w.id}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, width: '100%' }}>
          <button
            onClick={onHome}
            style={{
              flex: 1, padding: '14px',
              background: '#fff', border: '2px solid #b3e4ef',
              borderRadius: 16, fontSize: 15, fontWeight: 700,
              color: '#00687e', cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            🏠 Ana Sayfa
          </button>
          <button
            onClick={onPlayAgain}
            style={{
              flex: 2, padding: '14px',
              background: 'linear-gradient(135deg, #00687e 0%, #0097b2 100%)',
              border: 'none', borderRadius: 16,
              fontSize: 15, fontWeight: 800,
              color: '#fff', cursor: 'pointer',
              fontFamily: "'Baloo 2', sans-serif",
              boxShadow: '0 6px 20px rgba(0,104,126,0.30)',
            }}
          >
            Tekrar Oyna 🚀
          </button>
        </div>
      </div>
    </div>
  )
}

function StatCard({ emoji, label, value, color }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16,
      padding: '16px 12px', textAlign: 'center',
      boxShadow: '0 2px 12px rgba(0,104,126,0.07)',
      border: '2px solid #e8f4f8',
    }}>
      <div style={{ fontSize: 24, marginBottom: 4 }}>{emoji}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "'Baloo 2', sans-serif" }}>{value}</div>
      <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{label}</div>
    </div>
  )
}
