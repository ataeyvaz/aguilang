import { useState, useEffect, useCallback } from 'react'
import animalsData from '../data/animals-a1.json'
import { useSpeech } from '../hooks/useSpeech'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

// Genel cümle şablonları (tüm kategoriler için çalışır)
const TEMPLATES = {
  en: [
    () => `Look! It's a ___ !`,
    () => `I can see a ___ .`,
    () => `This is a ___ .`,
    () => `My favorite is the ___ .`,
    () => `I know this! It is a ___ .`,
  ],
  de: [
    () => `Schau! Das ist ein ___ !`,
    () => `Ich sehe ein ___ .`,
    () => `Das ist ein ___ .`,
    () => `Mein Lieblings ist ___ .`,
    () => `Ich kenne das! Es ist ein ___ .`,
  ],
  es: [
    () => `¡Mira! ¡Es un ___ !`,
    () => `Puedo ver un ___ .`,
    () => `Esto es un ___ .`,
    () => `Mi favorito es el ___ .`,
    () => `¡Lo sé! Es un ___ .`,
  ],
}

export default function SentenceGame({ profile, language, categoryData, onBack }) {
  const data = categoryData ?? animalsData
  const allWords = data.translations[language.id]?.words ?? []
  const templates = TEMPLATES[language.id] ?? TEMPLATES.en
  const { speak, isSpeaking, ttsSupported } = useSpeech(language.id)

  const buildQ = useCallback((word) => {
    const tmpl = templates[Math.floor(Math.random() * templates.length)]
    const sentence = tmpl(word)
    const wrong = shuffle(allWords.filter(w => w.id !== word.id)).slice(0, 3)
    const options = shuffle([word, ...wrong])
    return { word, sentence, options }
  }, [allWords, templates])

  const [queue]    = useState(() => shuffle(allWords))
  const [index, setIndex]     = useState(0)
  const [question, setQuestion] = useState(null)
  const [selected, setSelected] = useState(null)
  const [score, setScore]     = useState(0)
  const [correct, setCorrect] = useState(0)
  const [done, setDone]       = useState(false)

  useEffect(() => {
    const q = buildQ(queue[index])
    setQuestion(q)
    setSelected(null)
  }, [index]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!question) return null

  const handleSelect = (opt) => {
    if (selected !== null) return
    setSelected(opt.id)
    const isCorrect = opt.id === question.word.id
    if (isCorrect) { setScore(s => s + 10); setCorrect(c => c + 1); speak(question.word.word) }
    else setScore(s => s - 3)

    setTimeout(() => {
      if (index + 1 >= queue.length) setDone(true)
      else setIndex(i => i + 1)
    }, 1100)
  }

  if (done) {
    const pct = Math.round((correct / queue.length) * 100)
    const medal = pct === 100 ? '🏆' : pct >= 80 ? '🥇' : pct >= 60 ? '🥈' : '🥉'
    return (
      <div className="flex flex-col items-center justify-center min-h-svh gap-6 px-6">
        <div className="text-8xl">{medal}</div>
        <h2 className="font-[Fredoka_One] text-4xl text-white text-center">
          {pct >= 80 ? 'Harika!' : pct >= 60 ? 'Çok iyi!' : 'Daha çalış!'}<br />
          <span className="text-forest-200 text-2xl">{correct}/{queue.length} · {score} puan</span>
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
  // Cümleyi "___" öncesi ve sonrası parçalara böl
  const [before, after] = question.sentence.split('___')

  return (
    <div className="flex flex-col items-center justify-center min-h-svh gap-6 px-6 py-8">
      <div className="flex items-center justify-between w-full max-w-sm">
        <button onClick={onBack} className="text-forest-200 hover:text-white text-lg transition-colors">← Geri</button>
        <span className="text-amber-400 font-[Fredoka_One] text-xl">{score} puan</span>
        <span className="text-xl">{profile.avatar}</span>
      </div>

      <div className="w-full max-w-sm h-3 bg-forest-700 rounded-full overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-forest-200 text-sm">{language.flag} {index + 1} / {queue.length}</p>

      {/* Soru kartı */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7 flex flex-col items-center gap-4">
        <span className="text-7xl">{question.word.emoji}</span>

        {/* Cümle — ___ yerine boşluklu kutu */}
        <p className="text-forest-800 text-xl font-semibold text-center leading-relaxed">
          {before}
          <span className="inline-block bg-amber-100 border-b-4 border-amber-400 rounded px-3 mx-1 min-w-[80px] text-amber-600">
            {selected ? question.word.word : '   '}
          </span>
          {after}
        </p>

        {ttsSupported && selected && (
          <button onClick={() => speak(question.word.word)} disabled={isSpeaking}
            className="text-forest-400 hover:text-forest-600 text-2xl disabled:opacity-40 transition-colors">
            {isSpeaking ? '⏳' : '🔊'}
          </button>
        )}
      </div>

      {/* 4 seçenek */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {question.options.map((opt) => {
          const isSelected = selected === opt.id
          const isCorrect  = opt.id === question.word.id
          let cls = 'bg-white text-forest-800 hover:bg-forest-100'
          if (selected !== null) {
            if (isCorrect)       cls = 'bg-green-400 text-white scale-105'
            else if (isSelected) cls = 'bg-red-400 text-white'
            else                 cls = 'bg-white text-forest-800 opacity-40'
          }
          return (
            <button key={opt.id} onClick={() => handleSelect(opt)} disabled={selected !== null}
              className={`${cls} rounded-2xl py-4 font-[Fredoka_One] text-xl shadow-md transition-all duration-200 disabled:cursor-default flex flex-col items-center gap-1`}>
              <span className="text-3xl">{opt.emoji}</span>
              {opt.word}
            </button>
          )
        })}
      </div>

      {selected !== null && (
        <p className="text-white font-semibold text-lg animate-bounce">
          {selected === question.word.id ? '✅ Harika!' : `❌ Doğrusu: ${question.word.word}`}
        </p>
      )}
    </div>
  )
}
