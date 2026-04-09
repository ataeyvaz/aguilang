import { useState, useEffect, useCallback, useRef } from 'react'
import animalsData from '../data/animals-a1.json'
import { useSpeech } from '../hooks/useSpeech'
import Confetti from '../components/Confetti'

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

function buildQuestion(wordPool, targetWord) {
  const wrong = shuffle(wordPool.filter((w) => w.id !== targetWord.id)).slice(0, 3)
  const options = shuffle([targetWord, ...wrong])
  return { target: targetWord, options }
}

// Cevap modları
const MODES = [
  { id: 'choice', label: '4 Şık',  icon: '🔢' },
  { id: 'speak',  label: 'Söyle',  icon: '🎤' },
  { id: 'type',   label: 'Yaz',    icon: '✏️' },
]

export default function QuizScreen({ profile, language, categoryData, onFinish, onBack }) {
  const data = categoryData ?? animalsData
  const allWords = data.translations[language.id]?.words ?? []

  const [queue]          = useState(() => shuffle(allWords))
  const [repeatQueue, setRepeatQueue] = useState([])
  const [phase, setPhase]             = useState('main') // 'main' | 'repeat'
  const [questionIndex, setQuestionIndex] = useState(0)
  const [question, setQuestion]       = useState(null)
  const [selected, setSelected]       = useState(null)   // choice modu
  const [typed, setTyped]             = useState('')      // type modu
  const [typeResult, setTypeResult]   = useState(null)   // 'correct' | 'wrong'
  const [score, setScore]             = useState(0)
  const [results, setResults]         = useState([])
  const [answerMode, setAnswerMode]   = useState('choice')
  const [showConfetti, setShowConfetti] = useState(false)
  const [shakeId, setShakeId]           = useState(null)   // yanlış seçenek id'si

  const { speak, isSpeaking, ttsSupported,
          startListening, stopListening, isListening,
          transcript, sttSupported, checkAnswer } = useSpeech(language.id)

  const currentQueue = phase === 'main' ? queue : repeatQueue
  const answered = selected !== null || typeResult !== null

  // Soru yükle
  const loadQuestion = useCallback((q, idx) => {
    if (idx >= q.length) return null
    return buildQuestion(allWords, q[idx])
  }, [allWords])

  useEffect(() => {
    const q = loadQuestion(currentQueue, questionIndex)
    setQuestion(q)
    setSelected(null)
    setTyped('')
    setTypeResult(null)
  }, [questionIndex, phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // Yeni soru gelince Türkçe kelimeyi seslendir
  useEffect(() => {
    if (question && ttsSupported) {
      // kısa gecikme: kart render olduktan sonra
      const t = setTimeout(() => speak(question.target.tr, { rate: 0.85 }), 300)
      return () => clearTimeout(t)
    }
  }, [question]) // eslint-disable-line react-hooks/exhaustive-deps

  // STT transcript gelince otomatik kontrol
  useEffect(() => {
    if (answerMode === 'speak' && transcript && !answered) {
      commitAnswer(checkAnswer(question.target.word))
    }
  }, [transcript]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Ortak cevap commit fonksiyonu ──
  const commitAnswer = useCallback((correct, wrongId = null) => {
    const delta = correct ? 10 : -3
    setScore((s) => s + delta)
    setResults((r) => [...r, { word: question.target, correct }])
    if (!correct) setRepeatQueue((rq) => [...rq, question.target])

    // Görsel geri bildirim
    if (correct) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 2200)
    } else if (wrongId) {
      setShakeId(wrongId)
      setTimeout(() => setShakeId(null), 450)
    }

    setTimeout(() => {
      const nextIdx = questionIndex + 1
      const newRepeatLen = repeatQueue.length + (correct ? 0 : 1)
      if (nextIdx >= currentQueue.length) {
        if (phase === 'main' && newRepeatLen > 0) {
          setPhase('repeat')
          setQuestionIndex(0)
        } else {
          onFinish({
            score: score + delta,
            results: [...results, { word: question.target, correct }],
            totalWords: allWords.length,
          })
        }
      } else {
        setQuestionIndex(nextIdx)
      }
    }, 1200)
  }, [question, questionIndex, currentQueue, phase, repeatQueue, score, results, allWords, onFinish])

  // ── Choice modu ──
  const handleChoice = (option) => {
    if (answered) return
    setSelected(option.id)
    const correct = option.id === question.target.id
    commitAnswer(correct, correct ? null : option.id)
  }

  // ── Type modu ──
  const handleTypeSubmit = () => {
    if (answered || !typed.trim()) return
    const correct = typed.trim().toLowerCase() === question.target.word.toLowerCase()
    setTypeResult(correct ? 'correct' : 'wrong')
    commitAnswer(correct)
  }

  if (!question) return null

  const totalInPhase = currentQueue.length
  const progress = ((questionIndex + 1) / totalInPhase) * 100

  return (
    <div className="flex flex-col items-center justify-center min-h-svh gap-5 px-6 py-8">
      <Confetti active={showConfetti} />

      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-sm">
        <button onClick={onBack} className="text-forest-200 hover:text-white text-lg transition-colors">
          ← Geri
        </button>
        <div className="flex items-center gap-2">
          {phase === 'repeat' && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">Tekrar</span>
          )}
          <span className="text-amber-400 font-[Fredoka_One] text-xl">{score} puan</span>
        </div>
        <span className="text-xl">{profile.avatar}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm h-3 bg-forest-700 rounded-full overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-forest-200 text-sm">{language.flag} {questionIndex + 1} / {totalInPhase}</p>

      {/* Soru kartı */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7 flex flex-col items-center gap-3">
        <span className="text-7xl">{question.target.emoji}</span>
        <div className="flex items-center gap-3">
          <p className="text-forest-800 font-[Fredoka_One] text-3xl">{question.target.tr}</p>
          {ttsSupported && (
            <button
              onClick={() => speak(question.target.tr, { rate: 0.85 })}
              disabled={isSpeaking}
              className="text-forest-400 hover:text-forest-600 disabled:opacity-40 text-2xl transition-colors"
              title="Tekrar dinle"
            >
              {isSpeaking ? '⏳' : '🔊'}
            </button>
          )}
        </div>
        <p className="text-forest-400 text-sm">{language.flag} ne denir?</p>
      </div>

      {/* Mod seçici */}
      <div className="flex gap-2 bg-forest-700 rounded-2xl p-1 w-full max-w-sm">
        {MODES.filter(m => m.id !== 'speak' || sttSupported).map((m) => (
          <button
            key={m.id}
            onClick={() => { setAnswerMode(m.id); stopListening() }}
            className={`
              flex-1 py-2 rounded-xl font-semibold text-sm transition-all
              ${answerMode === m.id
                ? 'bg-white text-forest-800 shadow'
                : 'text-forest-200 hover:text-white'}
            `}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* ── 4 ŞIK MODU ── */}
      {answerMode === 'choice' && (
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {question.options.map((opt) => {
            const isSelected = selected === opt.id
            const isCorrect  = opt.id === question.target.id
            let cls = 'bg-white text-forest-800 hover:bg-forest-100'
            if (selected !== null) {
              if (isCorrect)             cls = 'bg-green-400 text-white scale-105'
              else if (isSelected)       cls = 'bg-red-400 text-white'
              else                       cls = 'bg-white text-forest-800 opacity-40'
            }
            return (
              <button
                key={opt.id}
                onClick={() => handleChoice(opt)}
                disabled={selected !== null}
                className={`${cls} rounded-2xl py-4 px-3 font-[Fredoka_One] text-xl shadow-md transition-all duration-200 disabled:cursor-default ${shakeId === opt.id ? 'shake' : ''}`}
              >
                {opt.word}
              </button>
            )
          })}
        </div>
      )}

      {/* ── SÖYLE MODU ── */}
      {answerMode === 'speak' && (
        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={answered}
            className={`
              w-24 h-24 rounded-full shadow-xl text-4xl transition-all active:scale-90
              ${isListening
                ? 'bg-red-500 animate-pulse text-white'
                : answered
                  ? 'bg-gray-300 text-gray-400 cursor-default'
                  : 'bg-amber-400 hover:bg-amber-300 text-white'}
            `}
          >
            {isListening ? '⏹' : '🎤'}
          </button>
          <p className="text-forest-200 text-sm">
            {isListening
              ? 'Dinliyorum...'
              : answered
                ? ''
                : `"${question.target.word}" de bakalım!`}
          </p>
          {transcript && (
            <p className="text-white font-semibold">
              Duydum: <span className="text-amber-300">"{transcript}"</span>
            </p>
          )}
        </div>
      )}

      {/* ── YAZ MODU ── */}
      {answerMode === 'type' && (
        <div className="flex flex-col items-center gap-3 w-full max-w-sm">
          <input
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTypeSubmit()}
            disabled={answered}
            placeholder={`${language.flag} kelimeyi yaz...`}
            autoFocus
            className={`
              w-full rounded-2xl px-5 py-4 text-xl font-[Fredoka_One] text-forest-800
              shadow-md outline-none border-4 transition-all
              ${typeResult === 'correct' ? 'border-green-400 bg-green-50'
                : typeResult === 'wrong'   ? 'border-red-400 bg-red-50'
                : 'border-transparent bg-white focus:border-amber-400'}
              disabled:opacity-70
            `}
          />
          <button
            onClick={handleTypeSubmit}
            disabled={answered || !typed.trim()}
            className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-default text-white font-[Fredoka_One] text-xl py-4 rounded-2xl shadow-lg active:scale-95 transition-all"
          >
            Kontrol Et ✓
          </button>
          {typeResult === 'wrong' && (
            <p className="text-forest-200 text-sm">
              Doğrusu: <span className="text-white font-bold">{question.target.word}</span>
            </p>
          )}
        </div>
      )}

      {/* Geri bildirim mesajı */}
      {answered && (
        <p className="text-white font-semibold text-lg animate-bounce">
          {(selected === question.target.id || typeResult === 'correct' ||
            (answerMode === 'speak' && checkAnswer(question.target.word)))
            ? '✅ Harika!'
            : `❌ Doğrusu: ${question.target.word}`}
        </p>
      )}
    </div>
  )
}
