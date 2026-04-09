import { useState, useEffect, useCallback } from 'react'
import animalsData from '../data/animals-a1.json'
import { useSpeech } from '../hooks/useSpeech'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

export default function ListeningGame({ profile, language, categoryData, onBack }) {
  const data = categoryData ?? animalsData
  const allWords = data.translations[language.id]?.words ?? []
  const { speak, isSpeaking, ttsSupported } = useSpeech(language.id)

  const [queue]    = useState(() => shuffle(allWords))
  const [index, setIndex]     = useState(0)
  const [options, setOptions] = useState([])
  const [selected, setSelected] = useState(null)
  const [score, setScore]     = useState(0)
  const [done, setDone]       = useState(false)
  const [correct, setCorrect] = useState(0)

  const current = queue[index]

  // 4 seçenek: doğru kelime + 3 yanlış (emoji + Türkçe)
  const buildOptions = useCallback((word) => {
    const wrong = shuffle(allWords.filter(w => w.id !== word.id)).slice(0, 3)
    return shuffle([word, ...wrong])
  }, [allWords])

  // Yeni soru gelince seçenekleri oluştur + kelimeyi seslendir
  useEffect(() => {
    const opts = buildOptions(current)
    setOptions(opts)
    setSelected(null)
    const t = setTimeout(() => speak(current.word), 400)
    return () => clearTimeout(t)
  }, [index]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (opt) => {
    if (selected !== null) return
    setSelected(opt.id)
    const isCorrect = opt.id === current.id
    if (isCorrect) { setScore(s => s + 10); setCorrect(c => c + 1) }
    else             setScore(s => s - 3)

    setTimeout(() => {
      if (index + 1 >= queue.length) setDone(true)
      else setIndex(i => i + 1)
    }, 1100)
  }

  // Bitiş ekranı
  if (done) {
    const pct = Math.round((correct / queue.length) * 100)
    const medal = pct === 100 ? '🏆' : pct >= 80 ? '🥇' : pct >= 60 ? '🥈' : '🥉'
    return (
      <div className="flex flex-col items-center justify-center min-h-svh gap-6 px-6">
        <div className="text-8xl">{medal}</div>
        <h2 className="font-[Fredoka_One] text-4xl text-white text-center">
          {pct >= 80 ? 'Süper!' : pct >= 60 ? 'İyi!' : 'Tekrar dene!'}<br />
          <span className="text-forest-200 text-2xl">{correct}/{queue.length} doğru · {score} puan</span>
        </h2>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button onClick={() => { setIndex(0); setScore(0); setCorrect(0); setDone(false) }}
            className="bg-amber-400 hover:bg-amber-300 text-white font-[Fredoka_One] text-xl py-4 rounded-2xl shadow-lg active:scale-95 transition-all">
            Tekrar Oyna 🔄
          </button>
          <button onClick={onBack} className="text-forest-200 underline text-lg hover:text-white transition-colors text-center">
            ← Oyun Seçimine Dön
          </button>
        </div>
      </div>
    )
  }

  const progress = ((index + 1) / queue.length) * 100

  return (
    <div className="flex flex-col items-center justify-center min-h-svh gap-6 px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-sm">
        <button onClick={onBack} className="text-forest-200 hover:text-white text-lg transition-colors">← Geri</button>
        <span className="text-amber-400 font-[Fredoka_One] text-xl">{score} puan</span>
        <span className="text-xl">{profile.avatar}</span>
      </div>

      {/* Progress */}
      <div className="w-full max-w-sm h-3 bg-forest-700 rounded-full overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-forest-200 text-sm">{language.flag} {index + 1} / {queue.length}</p>

      {/* Büyük hoparlör */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={() => speak(current.word)}
          disabled={isSpeaking || !ttsSupported}
          className={`
            w-36 h-36 rounded-full shadow-2xl text-6xl
            transition-all active:scale-90
            ${isSpeaking ? 'bg-amber-300 animate-pulse' : 'bg-amber-400 hover:bg-amber-300'}
            disabled:opacity-50 disabled:cursor-default
          `}
        >
          {isSpeaking ? '🔉' : '🔊'}
        </button>
        <p className="text-forest-200 text-sm font-semibold">
          {isSpeaking ? 'Dinle...' : 'Tekrar dinlemek için dokun'}
        </p>
      </div>

      <p className="text-white font-[Fredoka_One] text-2xl">Bu ne demek?</p>

      {/* 4 seçenek: emoji + Türkçe */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {options.map((opt) => {
          const isSelected = selected === opt.id
          const isCorrect  = opt.id === current.id
          let cls = 'bg-white text-forest-800 hover:bg-forest-100'
          if (selected !== null) {
            if (isCorrect)       cls = 'bg-green-400 text-white scale-105'
            else if (isSelected) cls = 'bg-red-400 text-white'
            else                 cls = 'bg-white text-forest-800 opacity-40'
          }
          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt)}
              disabled={selected !== null}
              className={`${cls} rounded-2xl py-5 flex flex-col items-center gap-1 shadow-md transition-all duration-200 disabled:cursor-default`}
            >
              <span className="text-4xl">{opt.emoji}</span>
              <span className="font-[Fredoka_One] text-lg">{opt.tr}</span>
            </button>
          )
        })}
      </div>

      {selected !== null && (
        <p className="text-white font-semibold text-lg animate-bounce">
          {selected === current.id ? '✅ Harika!' : `❌ "${current.word}" = ${current.tr}`}
        </p>
      )}
    </div>
  )
}
