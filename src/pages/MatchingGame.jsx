import { useState } from 'react'
import animalsData from '../data/animals-a1.json'
import { useSpeech } from '../hooks/useSpeech'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

const PAIR_COUNT = 6

export default function MatchingGame({ profile, language, categoryData, onBack }) {
  const data = categoryData ?? animalsData
  const allWords = data.translations[language.id]?.words ?? []
  const { speak } = useSpeech(language.id)

  const buildRound = () => {
    const words = shuffle(allWords).slice(0, PAIR_COUNT)
    return {
      left:  words.map(w => ({ id: w.id, emoji: w.emoji, tr: w.tr, matched: false })),
      right: shuffle(words.map(w => ({ id: w.id, word: w.word, matched: false }))),
    }
  }

  const [round, setRound]         = useState(buildRound)
  const [selLeft, setSelLeft]     = useState(null)  // seçilen sol id
  const [selRight, setSelRight]   = useState(null)  // seçilen sağ id
  const [flash, setFlash]         = useState(null)  // 'correct' | 'wrong'
  const [matches, setMatches]     = useState(0)
  const [errors, setErrors]       = useState(0)
  const [done, setDone]           = useState(false)
  const [locked, setLocked]       = useState(false)

  const handleLeft = (id) => {
    if (locked) return
    setSelLeft(id === selLeft ? null : id)
    setSelRight(null)
  }

  const handleRight = (id) => {
    if (locked || selLeft === null) return
    setSelRight(id)
    setLocked(true)

    if (selLeft === id) {
      // Doğru eşleşme
      const rightWord = round.right.find(r => r.id === id)
      speak(rightWord.word)
      setFlash('correct')
      setTimeout(() => {
        setRound(prev => ({
          left:  prev.left.map(l  => l.id === id ? { ...l,  matched: true } : l),
          right: prev.right.map(r => r.id === id ? { ...r, matched: true } : r),
        }))
        setMatches(m => {
          const next = m + 1
          if (next === PAIR_COUNT) setTimeout(() => setDone(true), 400)
          return next
        })
        setSelLeft(null); setSelRight(null); setFlash(null); setLocked(false)
      }, 700)
    } else {
      // Yanlış
      setFlash('wrong')
      setErrors(e => e + 1)
      setTimeout(() => {
        setSelLeft(null); setSelRight(null); setFlash(null); setLocked(false)
      }, 700)
    }
  }

  const restart = () => {
    setRound(buildRound())
    setSelLeft(null); setSelRight(null)
    setFlash(null); setMatches(0); setErrors(0)
    setDone(false); setLocked(false)
  }

  if (done) {
    const rating = errors === 0 ? '🌟🌟🌟' : errors <= 3 ? '🌟🌟' : '🌟'
    return (
      <div className="flex flex-col items-center justify-center min-h-svh gap-6 px-6">
        <div className="text-7xl">🎉</div>
        <h2 className="font-[Fredoka_One] text-4xl text-white text-center">Tüm eşleştirmeler tamam!<br /><span className="text-3xl">{rating}</span></h2>
        <p className="text-forest-200 text-xl font-semibold">{errors} hatayla bitirdin</p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button onClick={restart} className="bg-amber-400 hover:bg-amber-300 text-white font-[Fredoka_One] text-xl py-4 rounded-2xl shadow-lg active:scale-95 transition-all">Tekrar Oyna 🔄</button>
          <button onClick={onBack} className="text-forest-200 underline text-lg hover:text-white transition-colors text-center">← Oyun Seçimine Dön</button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center min-h-svh gap-5 px-4 py-8">
      <div className="flex items-center justify-between w-full max-w-sm">
        <button onClick={onBack} className="text-forest-200 hover:text-white text-lg transition-colors">← Geri</button>
        <span className="text-forest-200 font-semibold">{matches}/{PAIR_COUNT} ✓ · {errors} ✗</span>
        <span className="text-xl">{profile.avatar}</span>
      </div>

      <p className="text-white font-[Fredoka_One] text-xl">Sol + sağı eşleştir! {language.flag}</p>

      {flash && (
        <div className={`font-[Fredoka_One] text-2xl animate-bounce ${flash === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
          {flash === 'correct' ? '✅ Doğru!' : '❌ Tekrar dene!'}
        </div>
      )}

      <div className="flex gap-3 w-full max-w-sm">
        {/* Sol kolon: emoji + Türkçe */}
        <div className="flex flex-col gap-2 flex-1">
          {round.left.map(item => (
            <button
              key={item.id}
              onClick={() => !item.matched && handleLeft(item.id)}
              disabled={item.matched}
              className={`
                flex items-center gap-2 px-3 py-3 rounded-2xl shadow text-left transition-all
                ${item.matched
                  ? 'bg-green-400 opacity-60 cursor-default'
                  : selLeft === item.id
                    ? 'bg-amber-400 text-white scale-105'
                    : 'bg-white text-forest-800 hover:bg-forest-100 active:scale-95'}
              `}
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="font-[Fredoka_One] text-base">{item.tr}</span>
            </button>
          ))}
        </div>

        {/* Sağ kolon: yabancı kelime */}
        <div className="flex flex-col gap-2 flex-1">
          {round.right.map(item => (
            <button
              key={item.id}
              onClick={() => !item.matched && handleRight(item.id)}
              disabled={item.matched || selLeft === null}
              className={`
                px-3 py-3 rounded-2xl shadow font-[Fredoka_One] text-base transition-all
                ${item.matched
                  ? 'bg-green-400 text-white opacity-60 cursor-default'
                  : selLeft === null
                    ? 'bg-white text-forest-800 opacity-60'
                    : selRight === item.id && flash === 'wrong'
                      ? 'bg-red-400 text-white'
                      : 'bg-white text-forest-800 hover:bg-forest-100 active:scale-95'}
              `}
            >
              {item.word}
            </button>
          ))}
        </div>
      </div>

      {selLeft !== null && (
        <p className="text-forest-200 text-sm">Sağdaki eşini seç →</p>
      )}
    </div>
  )
}
