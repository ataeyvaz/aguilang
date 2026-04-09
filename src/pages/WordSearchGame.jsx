import { useState, useCallback } from 'react'
import animalsData from '../data/animals-a1.json'
import { useSpeech } from '../hooks/useSpeech'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }


const GRID_SIZE = 10
const WORD_COUNT = 8
const LETTERS = 'ABCDEFGHIJKLMNOPRSTUVWYZ'
const DIRS = [[0,1],[1,0]] // yalnızca yatay + dikey (çocuk dostu)

function generateGrid(words) {
  const grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''))
  const placed = []

  for (const w of words) {
    const upper = w.word.toUpperCase().replace(/\s/g, '')
    let success = false
    let attempts = 0
    const shuffledDirs = shuffle(DIRS)
    while (!success && attempts < 150) {
      attempts++
      const [dr, dc] = shuffledDirs[attempts % shuffledDirs.length]
      const maxR = GRID_SIZE - dr * (upper.length - 1)
      const maxC = GRID_SIZE - dc * (upper.length - 1)
      if (maxR <= 0 || maxC <= 0) continue
      const r0 = Math.floor(Math.random() * maxR)
      const c0 = Math.floor(Math.random() * maxC)
      let fits = true
      for (let i = 0; i < upper.length; i++) {
        const ch = grid[r0 + dr * i][c0 + dc * i]
        if (ch !== '' && ch !== upper[i]) { fits = false; break }
      }
      if (fits) {
        const cells = []
        for (let i = 0; i < upper.length; i++) {
          grid[r0 + dr * i][c0 + dc * i] = upper[i]
          cells.push([r0 + dr * i, c0 + dc * i])
        }
        placed.push({ id: w.id, word: upper, tr: w.tr, emoji: w.emoji, cells })
        success = true
      }
    }
  }

  // Boş hücreleri doldur
  for (let r = 0; r < GRID_SIZE; r++)
    for (let c = 0; c < GRID_SIZE; c++)
      if (grid[r][c] === '') grid[r][c] = LETTERS[Math.floor(Math.random() * LETTERS.length)]

  return { grid, placed }
}

function cellKey(r, c) { return `${r},${c}` }

export default function WordSearchGame({ profile, language, categoryData, onBack }) {
  const data = categoryData ?? animalsData
  const allWords = data.translations[language.id]?.words ?? []
  const { speak } = useSpeech(language.id)

  const buildGame = useCallback(() => {
    // Kısa kelimeler önce, max WORD_COUNT tane
    const sorted = [...allWords]
      .filter(w => w.word.replace(/\s/g,'').length <= 8)
      .sort((a,b) => a.word.length - b.word.length)
    const picked = shuffle(sorted).slice(0, WORD_COUNT)
    return generateGrid(picked)
  }, [allWords])

  const [game, setGame]           = useState(buildGame)
  const [foundIds, setFoundIds]   = useState(new Set())
  const [selectStart, setSelectStart] = useState(null)  // [r,c]
  const [highlighted, setHighlighted] = useState(new Set()) // "r,c"

  const { grid, placed } = game
  const allFound = foundIds.size === placed.length

  // İki hücre arası düz çizgi hücreleri hesapla
  const getCellsBetween = (a, b) => {
    const [r1,c1] = a; const [r2,c2] = b
    const dr = Math.sign(r2-r1); const dc = Math.sign(c2-c1)
    // Yalnızca yatay veya dikey kabul et
    if (dr !== 0 && dc !== 0) return null
    const cells = []
    let r = r1; let c = c1
    while (r !== r2 + dr || c !== c2 + dc) { cells.push([r,c]); r += dr; c += dc }
    return cells
  }

  const handleCellClick = (r, c) => {
    if (allFound) return
    if (!selectStart) {
      setSelectStart([r,c])
      setHighlighted(new Set([cellKey(r,c)]))
      return
    }

    const [r1,c1] = selectStart
    if (r1 === r && c1 === c) { setSelectStart(null); setHighlighted(new Set()); return }

    const cells = getCellsBetween([r1,c1],[r,c])
    if (!cells) { setSelectStart([r,c]); setHighlighted(new Set([cellKey(r,c)])); return }

    const selected = cells.map(([rr,cc]) => grid[rr][cc]).join('')

    // Yerleştirilen kelimelerle karşılaştır
    const match = placed.find(p => {
      if (foundIds.has(p.id)) return false
      const pCells = p.cells.map(([rr,cc]) => cellKey(rr,cc)).join(',')
      const selCells = cells.map(([rr,cc]) => cellKey(rr,cc)).join(',')
      return pCells === selCells || p.word === selected
    })

    if (match) {
      speak(match.word.toLowerCase())
      setFoundIds(prev => new Set([...prev, match.id]))
    }

    setSelectStart(null)
    setHighlighted(new Set())
  }

  const isFound = (r, c) => placed.some(p => foundIds.has(p.id) && p.cells.some(([pr,pc]) => pr===r && pc===c))
  const isHighlighted = (r, c) => highlighted.has(cellKey(r,c))

  const restart = () => { setGame(buildGame()); setFoundIds(new Set()); setSelectStart(null); setHighlighted(new Set()) }

  return (
    <div className="flex flex-col items-center min-h-svh gap-4 px-3 py-6">
      <div className="flex items-center justify-between w-full max-w-sm">
        <button onClick={onBack} className="text-forest-200 hover:text-white text-lg transition-colors">← Geri</button>
        <span className="text-forest-200 font-semibold">{foundIds.size}/{placed.length} kelime</span>
        <span className="text-xl">{profile.avatar}</span>
      </div>

      <p className="text-white font-[Fredoka_One] text-lg text-center">
        {allFound ? '🎉 Tüm kelimeleri buldun!' : 'Başlangıcına dokun, sonuna dokun! 🔍'}
      </p>

      {/* Grid */}
      <div
        className="grid gap-0.5"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0,1fr))`, width: '100%', maxWidth: '360px' }}
      >
        {grid.map((row, r) =>
          row.map((letter, c) => {
            const found = isFound(r, c)
            const hi = isHighlighted(r, c)
            const isStart = selectStart && selectStart[0]===r && selectStart[1]===c
            return (
              <button
                key={cellKey(r,c)}
                onClick={() => handleCellClick(r,c)}
                className={`
                  aspect-square rounded flex items-center justify-center
                  font-[Fredoka_One] text-sm transition-all
                  ${found   ? 'bg-green-400 text-white'
                  : isStart ? 'bg-amber-500 text-white scale-110'
                  : hi      ? 'bg-amber-300 text-forest-800'
                  :           'bg-forest-600 text-white hover:bg-forest-500'}
                `}
              >
                {letter}
              </button>
            )
          })
        )}
      </div>

      {/* Kelime listesi */}
      <div className="flex flex-wrap gap-2 w-full max-w-sm justify-center">
        {placed.map(p => (
          <span
            key={p.id}
            className={`
              px-3 py-1 rounded-xl text-sm font-semibold flex items-center gap-1
              ${foundIds.has(p.id)
                ? 'bg-green-400 text-white line-through opacity-70'
                : 'bg-forest-700 text-white'}
            `}
          >
            {p.emoji} {p.word} <span className="text-xs opacity-70">({p.tr})</span>
          </span>
        ))}
      </div>

      {allFound && (
        <button onClick={restart}
          className="bg-amber-400 hover:bg-amber-300 text-white font-[Fredoka_One] text-xl px-10 py-4 rounded-2xl shadow-lg active:scale-95 transition-all">
          Yeni Oyun 🔄
        </button>
      )}
    </div>
  )
}
