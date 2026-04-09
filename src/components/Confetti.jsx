import { useEffect, useState } from 'react'

const COLORS = ['#FFD700','#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7','#DDA0DD','#98D8C8']

export default function Confetti({ active }) {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (!active) { setParticles([]); return }
    setParticles(
      Array.from({ length: 55 }, (_, i) => ({
        id: i,
        left:     `${5 + Math.random() * 90}%`,
        color:    COLORS[Math.floor(Math.random() * COLORS.length)],
        delay:    `${Math.random() * 0.45}s`,
        duration: `${1.1 + Math.random() * 0.7}s`,
        size:     `${7 + Math.random() * 7}px`,
        round:    Math.random() > 0.5,
      }))
    )
    const t = setTimeout(() => setParticles([]), 2200)
    return () => clearTimeout(t)
  }, [active])

  if (!particles.length) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.left,
            top: '-16px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.round ? '50%' : '2px',
            animation: `confetti-fall ${p.duration} ${p.delay} ease-in forwards`,
          }}
        />
      ))}
    </div>
  )
}
