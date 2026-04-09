import { useState, useEffect, useRef } from 'react'
import animalsData from '../data/animals-a1.json'
import { useSpeech } from '../hooks/useSpeech'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

const PAIR_COUNT = 6

export default function MemoryGame({ profile, language, categoryData, onBack }) {
  const data = categoryData ?? animalsData
  const allWords = data.translations[language.id]?.words ?? []
  const { speak } = useSpeech(language.id)

  const buildCards = () => {
    const words = shuffle(allWords).slice(0, PAIR_COUNT)
    const cards = []
    words.forEach((w, i) => {
      cards.push({ uid: `emoji-${i}`, pairId: w.id, type: 'emoji',  content: w.emoji, word: w.word })
      cards.push({ uid: `word-${i}`,  pairId: w.id, type: 'word',   content: w.word,  word: w.word })
    })
    return shuffle(cards).map((c, idx) => ({ ...c, index: idx, flipped: false, matched: false }))
  }

  const [cards, setCards]           = useState(buildCards)
  const [flippedIdx, setFlippedIdx] = useState([])   // max 2 indexler
  const [moves, setMoves]           = useState(0)
  const [matches, setMatches]       = useState(0)
  const [done, setDone]             = useState(false)
  const [locked, setLocked]         = useState(false)

  // İki kart açıkken kontrol et
  useEffect(() => {
    if (flippedIdx.length !== 2) return
    setLocked(true)
    const [a, b] = flippedIdx.map(i => cards[i])
    setMoves(m => m + 1)

    if (a.pairId === b.pairId) {
      // Eşleşti
      speak(a.word)
      setCards(prev => prev.map(c =>
        c.pairId === a.pairId ? { ...c, matched: true } : c
      ))
      setMatches(m => {
        const next = m + 1
        if (next === PAIR_COUNT) setTimeout(() => setDone(true), 600)
        return next
      })
      setFlippedIdx([])
      setLocked(false)
    } else {
      // Eşleşmedi — kısa süre göster, sonra kapat
      setTimeout(() => {
        setCards(prev => prev.map(c =>
          flippedIdx.includes(c.index) ? { ...c, flipped: false } : c
        ))
        setFlippedIdx([])
        setLocked(false)
      }, 900)
    }
  }, [flippedIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFlip = (card) => {
    if (locked || card.flipped || card.matched || flippedIdx.length >= 2) return
    setCards(prev => prev.map(c => c.uid === card.uid ? { ...c, flipped: true } : c))
    setFlippedIdx(prev => [...prev, card.index])
  }

  const restart = () => {
    setCards(buildCards())
    setFlippedIdx([])
    setMoves(0)
    setMatches(0)
    setDone(false)
    setLocked(false)
  }

  if (done) {
    const rating = moves <= PAIR_COUNT + 2 ? '🌟🌟🌟' : moves <= PAIR_COUNT * 2 ? '🌟🌟' : '🌟'
    return (
      <div className="flex flex-col items-center justify-center min-h-svh gap-6 px-6">
        <div className="text-7xl">🎉</div>
        <h2 className="font-[Fredoka_One] text-4xl text-white text-center">
          Tüm çiftleri buldun!<br />
          <span className="text-3xl">{rating}</span>
        </h2>
        <p className="text-forest-200 text-xl font-semibold">{moves} hamlede tamamladın</p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button onClick={restart}
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

  return (
    <div className="flex flex-col items-center min-h-svh gap-5 px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-sm">
        <button onClick={onBack} className="text-forest-200 hover:text-white text-lg transition-colors">← Geri</button>
        <span className="text-forest-200 font-semibold">{matches}/{PAIR_COUNT} çift · {moves} hamle</span>
        <span className="text-xl">{profile.avatar}</span>
      </div>

      <p className="text-white font-[Fredoka_One] text-xl">Emoji + kelime çiftlerini bul!</p>

      {/* Kart ızgarası: 4 sütun */}
      <div className="grid grid-cols-4 gap-2 w-full max-w-sm">
        {cards.map((card) => (
          <button
            key={card.uid}
            onClick={() => handleFlip(card)}
            disabled={card.matched}
            className={`
              aspect-square rounded-2xl shadow-md text-center
              transition-all duration-300 active:scale-95
              flex items-center justify-center
              ${card.matched
                ? 'bg-green-400 opacity-60'
                : card.flipped
                  ? 'bg-white'
                  : 'bg-forest-600 hover:bg-forest-500'}
            `}
          >
            {card.flipped || card.matched ? (
              card.type === 'emoji'
                ? <span className="text-3xl">{card.content}</span>
                : <span className="font-[Fredoka_One] text-sm text-forest-800 px-1 leading-tight">{card.content}</span>
            ) : (
              <span className="text-2xl">❓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
