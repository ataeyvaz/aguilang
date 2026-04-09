import { useState, useEffect, useRef } from 'react'
import { useSpeech } from '../hooks/useSpeech'
import Confetti from '../components/Confetti'

import marketDlg     from '../data/dialogues/market-a1.json'
import schoolDlg     from '../data/dialogues/school-a1.json'
import parkDlg       from '../data/dialogues/park-a1.json'
import homeDlg       from '../data/dialogues/home-a1.json'
import restaurantDlg from '../data/dialogues/restaurant-a1.json'
import travelDlg     from '../data/dialogues/travel-a1.json'

const ALL_DIALOGUES = [
  marketDlg, schoolDlg, parkDlg, homeDlg, restaurantDlg, travelDlg,
]

const LANGS = [
  { id: 'en', flag: '🇬🇧', label: 'EN' },
  { id: 'de', flag: '🇩🇪', label: 'DE' },
  { id: 'es', flag: '🇪🇸', label: 'ES' },
]

// ── Eşleştirme yardımcıları ──────────────────────────────────

function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[¡!¿?.,'";\-:]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Yazılı cevap: noktalama/büyük harf farkını yok say */
function typeMatch(typed, target) {
  return normalize(typed) === normalize(target)
}

/** STT cevap: hedef kelimelerin %60+ eşleşirse doğru say */
function fuzzyMatch(transcript, target) {
  const tWords = normalize(transcript).split(' ').filter(Boolean)
  const aWords = normalize(target).split(' ').filter(Boolean)
  if (!tWords.length || !aWords.length) return false
  const hit = aWords.filter(w => tWords.some(t => t === w || t.startsWith(w) || w.startsWith(t)))
  return hit.length / aWords.length >= 0.6
}

// ── Diyalog Listesi ──────────────────────────────────────────

function DialogueList({ langId, setLangId, onSelect, onBack }) {
  return (
    <div className="min-h-svh bg-forest-800 flex flex-col px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={onBack} className="text-forest-200 hover:text-white text-lg transition-colors">
          ← Geri
        </button>
        <h1 className="font-[Fredoka_One] text-white text-2xl">💬 Diyaloglar</h1>
        <div className="w-12" />
      </div>

      {/* Dil sekmeleri */}
      <div className="flex gap-2 bg-forest-700 rounded-2xl p-1 mb-5">
        {LANGS.map(l => (
          <button
            key={l.id}
            onClick={() => setLangId(l.id)}
            className={`
              flex-1 py-2.5 rounded-xl font-bold text-base transition-all
              ${langId === l.id
                ? 'bg-white text-forest-800 shadow'
                : 'text-forest-200 hover:text-white'}
            `}
          >
            {l.flag} {l.label}
          </button>
        ))}
      </div>

      {/* Senaryo kartları */}
      <div className="flex flex-col gap-3">
        {ALL_DIALOGUES.map(d => (
          <button
            key={d.id}
            onClick={() => onSelect(d)}
            className="flex items-center gap-4 bg-white/10 hover:bg-white/20 active:scale-95 rounded-2xl p-4 text-left transition-all"
          >
            <span className="text-5xl leading-none">{d.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-[Fredoka_One] text-white text-xl leading-tight">{d.title}</p>
              <p className="text-forest-200 text-sm mt-0.5">
                {d.lines.length} satır · Seviye {d.level}
              </p>
            </div>
            <span className="text-forest-200 text-xl flex-shrink-0">›</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Handoff Ekranı (MOD 1 — Aynı Cihaz) ────────────────────

function HandoffScreen({ speaker, prevSpeaker, lineIndex, totalLines, onReady }) {
  const isFirst       = lineIndex === 0
  const speakerChange = !isFirst && prevSpeaker && prevSpeaker !== speaker
  const isKartal      = speaker === 'Kartal'

  return (
    <div className="min-h-svh bg-forest-800 flex flex-col items-center justify-center px-6 gap-8">
      <div className="text-8xl select-none" style={{ animation: 'bounce 1s infinite' }}>
        📱
      </div>

      <div className="text-center">
        <p className={`font-[Fredoka_One] text-4xl mb-3 ${isKartal ? 'text-blue-300' : 'text-green-300'}`}>
          {isKartal ? '🦅' : '👦'} {speaker}'ın sırası!
        </p>

        {speakerChange ? (
          <p className="text-forest-200 text-lg">
            Telefonu <span className="text-white font-bold">{prevSpeaker}</span>'e ver
          </p>
        ) : isFirst ? (
          <p className="text-forest-200 text-lg">Diyaloğu sen başlatıyorsun</p>
        ) : null}
      </div>

      {/* İlerleme */}
      <p className="text-forest-400 text-sm">
        {lineIndex + 1} / {totalLines}. satır
      </p>

      <button
        onClick={onReady}
        className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-white font-[Fredoka_One] text-2xl px-14 py-5 rounded-3xl shadow-xl transition-all"
      >
        Hazırım! →
      </button>
    </div>
  )
}

// ── Ana Bileşen ──────────────────────────────────────────────

export default function DialogueScreen({ onBack }) {
  // Diyalog-düzeyinde state
  const [subView,   setSubView]   = useState('list')   // list | handoff | play | done
  const [langId,    setLangId]    = useState('en')
  const [dialogue,  setDialogue]  = useState(null)
  const [lineIndex, setLineIndex] = useState(0)
  const [doneLines, setDoneLines] = useState([])        // tamamlanan satırlar
  const [score,     setScore]     = useState(0)

  // Satır-düzeyinde state
  const attemptsRef  = useRef(0)                        // mevcut satır için deneme sayısı
  const [typed,      setTyped]      = useState('')
  const [showHint,   setShowHint]   = useState(false)
  const [feedback,   setFeedback]   = useState(null)    // null | 'correct' | 'wrong'
  const [shake,      setShake]      = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const bubblesEndRef = useRef(null)

  const { speak, isSpeaking, ttsSupported,
          startListening, stopListening, isListening,
          transcript, sttSupported } = useSpeech(langId)

  const currentLine = dialogue?.lines[lineIndex]
  const targetText  = currentLine?.[langId] ?? ''

  // Yeni satır yüklenince balonların sonuna kaydır
  useEffect(() => {
    if (subView === 'play') {
      bubblesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [doneLines, subView])

  // STT transcript → otomatik kontrol
  useEffect(() => {
    if (subView !== 'play' || !transcript || !currentLine || feedback) return
    handleResult(fuzzyMatch(transcript, targetText))
  }, [transcript]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Navigasyon ──────────────────────────────────────────

  const handleSelectDialogue = (d) => {
    setDialogue(d)
    setLineIndex(0)
    setDoneLines([])
    setScore(0)
    attemptsRef.current = 0
    setTyped('')
    setShowHint(false)
    setFeedback(null)
    setSubView('handoff')
  }

  const handleHandoffReady = () => {
    setTyped('')
    setShowHint(false)
    setFeedback(null)
    setSubView('play')
  }

  // ── Cevap değerlendirme ─────────────────────────────────

  const handleResult = (correct) => {
    if (feedback === 'correct') return  // zaten doğru, işleme

    if (correct) {
      const pts = attemptsRef.current === 0 ? 10 : 5
      setScore(s => s + pts)
      setFeedback('correct')
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 2200)
      speak(targetText)                 // doğru cümleyi seslendir

      setTimeout(() => {
        const newDone = [...doneLines, {
          speaker:  currentLine.speaker,
          langText: targetText,
          tr:       currentLine.tr,
        }]
        setDoneLines(newDone)

        const nextIdx = lineIndex + 1
        if (nextIdx >= dialogue.lines.length) {
          setSubView('done')
        } else {
          attemptsRef.current = 0
          setLineIndex(nextIdx)
          setFeedback(null)
          setSubView('handoff')
        }
      }, 1500)

    } else {
      attemptsRef.current += 1
      setFeedback('wrong')
      setShake(true)
      setTimeout(() => setShake(false), 450)
      setShowHint(true)                 // yanlışta ipucunu otomatik aç
      setTimeout(() => {
        setFeedback(null)
        setTyped('')
      }, 1200)
    }
  }

  const handleTypeSubmit = () => {
    if (feedback === 'correct' || !typed.trim()) return
    handleResult(typeMatch(typed, targetText))
  }

  // ── SUB-VIEW: list ──────────────────────────────────────
  if (subView === 'list') {
    return (
      <DialogueList
        langId={langId}
        setLangId={setLangId}
        onSelect={handleSelectDialogue}
        onBack={onBack}
      />
    )
  }

  // ── SUB-VIEW: handoff ───────────────────────────────────
  if (subView === 'handoff') {
    const prevSpeaker = lineIndex > 0 ? dialogue.lines[lineIndex - 1].speaker : null
    return (
      <HandoffScreen
        speaker={currentLine.speaker}
        prevSpeaker={prevSpeaker}
        lineIndex={lineIndex}
        totalLines={dialogue.lines.length}
        onReady={handleHandoffReady}
      />
    )
  }

  // ── SUB-VIEW: done ──────────────────────────────────────
  if (subView === 'done') {
    return (
      <div className="min-h-svh bg-forest-800 flex flex-col items-center justify-center px-6 gap-6">
        <Confetti active />
        <div className="text-center">
          <p className="text-7xl mb-3">🎉</p>
          <h2 className="font-[Fredoka_One] text-white text-4xl mb-2">Tebrikler!</h2>
          <p className="text-forest-200 text-lg">{dialogue.title} tamamlandı!</p>
        </div>

        <div className="bg-white/10 rounded-3xl px-12 py-6 text-center">
          <p className="font-[Fredoka_One] text-amber-400 text-6xl">{score}</p>
          <p className="text-forest-200 text-sm mt-1">puan kazandın ⭐</p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => handleSelectDialogue(dialogue)}
            className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-white font-[Fredoka_One] text-xl py-4 rounded-2xl shadow-lg transition-all"
          >
            🔄 Tekrar Oyna
          </button>
          <button
            onClick={() => setSubView('list')}
            className="bg-forest-700 hover:bg-forest-600 active:scale-95 text-white font-[Fredoka_One] text-xl py-4 rounded-2xl transition-all"
          >
            💬 Başka Diyalog
          </button>
          <button
            onClick={onBack}
            className="text-forest-200 hover:text-white underline text-base transition-colors"
          >
            ← Ana Menü
          </button>
        </div>
      </div>
    )
  }

  // ── SUB-VIEW: play ──────────────────────────────────────
  const progress      = (lineIndex / dialogue.lines.length) * 100
  const isKartal      = currentLine.speaker === 'Kartal'
  const speakerColor  = isKartal ? 'text-blue-300' : 'text-green-300'
  const answered      = feedback === 'correct'

  return (
    <div className="flex flex-col min-h-svh bg-forest-800">
      <Confetti active={showConfetti} />

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-2 flex-shrink-0">
        <button
          onClick={() => setSubView('list')}
          className="text-forest-200 hover:text-white text-lg transition-colors"
        >
          ← Geri
        </button>
        <p className="font-[Fredoka_One] text-white text-lg truncate mx-2">
          {dialogue.emoji} {dialogue.title}
        </p>
        <span className="text-amber-400 font-[Fredoka_One] text-lg whitespace-nowrap">
          {score} ⭐
        </span>
      </div>

      {/* İlerleme çubuğu */}
      <div className="mx-4 mb-1 h-2.5 bg-forest-700 rounded-full overflow-hidden flex-shrink-0">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-center text-forest-200 text-xs mb-3 flex-shrink-0">
        {lineIndex} / {dialogue.lines.length} satır tamamlandı
      </p>

      {/* Konuşma balonları */}
      <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-3 pb-4">
        {doneLines.map((line, i) => {
          const left = line.speaker === 'Kartal'
          return (
            <div key={i} className={`flex ${left ? 'justify-start' : 'justify-end'}`}>
              <div className={`
                max-w-[82%] rounded-2xl px-4 py-3 shadow-sm
                ${left ? 'bg-blue-100 rounded-tl-sm' : 'bg-green-100 rounded-tr-sm'}
              `}>
                <p className={`text-xs font-bold mb-1 ${left ? 'text-blue-500' : 'text-green-600'}`}>
                  {left ? '🦅' : '👦'} {line.speaker}
                </p>
                <p className="text-forest-800 text-base font-semibold leading-snug">
                  {line.langText}
                </p>
                <p className="text-gray-400 text-xs mt-1 italic">{line.tr}</p>
              </div>
            </div>
          )
        })}

        {/* Aktif satır — konuşmacı göstergesi (metin gösterilmez) */}
        <div className={`flex ${isKartal ? 'justify-start' : 'justify-end'}`}>
          <div className={`
            rounded-2xl px-4 py-3 shadow-sm border-2 border-dashed
            ${isKartal
              ? 'bg-blue-50 border-blue-300 rounded-tl-sm'
              : 'bg-green-50 border-green-300 rounded-tr-sm'}
          `}>
            <p className={`text-xs font-bold ${isKartal ? 'text-blue-500' : 'text-green-600'}`}>
              {isKartal ? '🦅' : '👦'} {currentLine.speaker} yazıyor…
            </p>
          </div>
        </div>

        <div ref={bubblesEndRef} />
      </div>

      {/* Input paneli */}
      <div className="bg-forest-700 rounded-t-3xl px-4 pt-4 pb-6 flex-shrink-0 flex flex-col gap-3">

        {/* Kimin sırası */}
        <p className={`font-semibold text-sm ${speakerColor}`}>
          {isKartal ? '🦅' : '👦'} {currentLine.speaker} olarak söyle:
        </p>

        {/* İpucu + Dinle satırı */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowHint(h => !h)}
            className={`
              flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all text-left px-3
              ${showHint
                ? 'bg-amber-400 text-white'
                : 'bg-forest-600 text-forest-200 hover:text-white'}
            `}
          >
            💡 {showHint ? currentLine.hint : 'İpucu göster'}
          </button>
          {ttsSupported && (
            <button
              onClick={() => speak(targetText)}
              disabled={isSpeaking}
              className="bg-forest-600 hover:bg-forest-500 disabled:opacity-40 text-forest-200 hover:text-white px-4 py-2.5 rounded-xl text-xl transition-all"
              title="Doğru cevabı dinle"
            >
              {isSpeaking ? '⏳' : '🔊'}
            </button>
          )}
        </div>

        {/* STT butonu */}
        {sttSupported && (
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={answered}
            className={`
              w-full py-3 rounded-2xl font-[Fredoka_One] text-xl transition-all active:scale-95
              ${isListening
                ? 'bg-red-500 animate-pulse text-white'
                : 'bg-forest-600 text-forest-200 hover:text-white disabled:opacity-40'}
            `}
          >
            {isListening ? '⏹ Dinliyorum…' : '🎤 Sesli Söyle'}
          </button>
        )}

        {/* STT sonucu */}
        {transcript && subView === 'play' && (
          <p className="text-forest-200 text-xs text-center">
            Duydum: <span className="text-white font-semibold">"{transcript}"</span>
          </p>
        )}

        {/* Yazarak cevap */}
        <div className="flex gap-2">
          <input
            type="text"
            value={typed}
            onChange={e => setTyped(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleTypeSubmit()}
            disabled={answered}
            placeholder="Yazarak cevapla…"
            className={`
              flex-1 rounded-2xl px-4 py-3 text-forest-800 font-semibold
              outline-none border-4 transition-all disabled:opacity-60
              ${feedback === 'correct' ? 'border-green-400 bg-green-50'
                : feedback === 'wrong'   ? 'border-red-400 bg-red-50'
                : 'border-transparent bg-white focus:border-amber-400'}
              ${shake ? 'shake' : ''}
            `}
          />
          <button
            onClick={handleTypeSubmit}
            disabled={answered || !typed.trim()}
            className="bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-white font-[Fredoka_One] text-xl px-5 rounded-2xl active:scale-95 transition-all"
          >
            ✓
          </button>
        </div>

        {/* Geri bildirim */}
        {feedback && (
          <p className={`
            text-center font-[Fredoka_One] text-xl
            ${feedback === 'correct' ? 'text-green-400 animate-bounce' : 'text-red-400'}
          `}>
            {feedback === 'correct' ? '✅ Harika!' : '❌ Tekrar dene!'}
          </p>
        )}
      </div>
    </div>
  )
}
