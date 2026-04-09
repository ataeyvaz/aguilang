import Confetti from '../components/Confetti'
import { useState, useEffect } from 'react'

export default function LevelUp({ profile, onContinue }) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(true), 300)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-svh gap-8 px-6 text-center">
      <Confetti active={showConfetti} />

      <div className="text-8xl animate-bounce">🦅</div>

      <div>
        <h1 className="font-[Fredoka_One] text-5xl text-white mb-2">
          Tebrikler, {profile.name}!
        </h1>
        <p className="text-amber-400 font-[Fredoka_One] text-3xl">A1 Seviye Tamamlandı!</p>
      </div>

      {/* Seviye rozeti */}
      <div className="bg-amber-400 rounded-3xl px-10 py-6 shadow-2xl">
        <p className="font-[Fredoka_One] text-white text-4xl">A1 → A2</p>
        <p className="text-amber-100 font-semibold mt-1">Bir sonraki seviyeye hazırsın!</p>
      </div>

      <div className="flex flex-col gap-2 text-forest-200 font-semibold">
        <p>✅ Hayvanlar kategorisi: tamamlandı</p>
        <p>🎯 İlk quiz: tamamlandı</p>
        <p>🌟 Yeni kelimeler yakında geliyor...</p>
      </div>

      <button
        onClick={onContinue}
        className="bg-white text-forest-800 font-[Fredoka_One] text-xl px-12 py-4 rounded-2xl shadow-xl active:scale-95 transition-all hover:bg-forest-100"
      >
        Devam Et →
      </button>
    </div>
  )
}
