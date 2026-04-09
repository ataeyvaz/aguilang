import { useState } from 'react'
import { useProgress, BADGE_DEFS } from '../hooks/useProgress'
import { useSettings }              from '../hooks/useSettings'
import { useSpeech }                from '../hooks/useSpeech'
import animalsData                  from '../data/animals-a1.json'

const PROFILES = [
  { id: 'kartal', name: 'Kartal', avatar: '🦅' },
  { id: 'emir',   name: 'Emir',   avatar: '⚡' },
]

const TABS = [
  { id: 'stats', label: '📊 İstatistik' },
  { id: 'sound', label: '🔊 Ses'        },
  { id: 'goals', label: '🎯 Hedef'      },
]

const RATE_PRESETS = [
  { label: '🐌 Yavaş',  value: 0.7 },
  { label: '🐇 Normal', value: 0.9 },
  { label: '🚀 Hızlı',  value: 1.2 },
]

const CARD_GOALS  = [5, 10, 15, 20]
const QUIZ_GOALS  = [1, 2, 3, 5]

// ── Sekme: İstatistik ──────────────────────────────────────────
function StatsTab({ profileId }) {
  const { progress, earnedBadges } = useProgress(profileId)
  const allAnimals = animalsData.translations['en']?.words ?? []

  const hardWordEntries = Object.entries(progress.hardWords || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  const avgScore = progress.quizHistory.length
    ? Math.round(progress.quizHistory.reduce((s, q) => s + (q.correct / q.total) * 100, 0) / progress.quizHistory.length)
    : null

  return (
    <div className="flex flex-col gap-5">
      {/* Genel istatistikler */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: '🔥 Günlük Seri',  value: `${progress.streak} gün` },
          { label: '⭐ Toplam Puan',  value: progress.totalPoints },
          { label: '🃏 Kart Görüldü', value: progress.totalCards },
          { label: '🎯 Quiz Sayısı',  value: progress.totalQuizzes },
          { label: '💯 Tam Puan',     value: `${progress.perfectQuizzes} quiz` },
          { label: '📈 Ort. Başarı',  value: avgScore !== null ? `%${avgScore}` : '—' },
        ].map(item => (
          <div key={item.label} className="bg-forest-700 rounded-2xl p-3 text-center">
            <p className="text-forest-200 text-xs font-semibold">{item.label}</p>
            <p className="font-[Fredoka_One] text-white text-xl mt-0.5">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Son quiz geçmişi */}
      {progress.quizHistory.length > 0 && (
        <div>
          <p className="text-forest-200 font-semibold text-sm mb-2">Son Quizler</p>
          <div className="flex flex-col gap-1.5">
            {progress.quizHistory.slice(0, 7).map((q, i) => {
              const pct = Math.round((q.correct / q.total) * 100)
              const langFlag = q.langId === 'en' ? '🇬🇧' : q.langId === 'de' ? '🇩🇪' : '🇪🇸'
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-sm w-5">{langFlag}</span>
                  <div className="flex-1 h-5 bg-forest-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pct >= 80 ? 'bg-green-400' : pct >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-white text-xs font-bold w-10 text-right">%{pct}</span>
                  <span className="text-forest-200 text-xs w-16">{q.date}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Zor kelimeler */}
      {hardWordEntries.length > 0 && (
        <div>
          <p className="text-forest-200 font-semibold text-sm mb-2">Zorlanan Kelimeler</p>
          <div className="flex flex-wrap gap-2">
            {hardWordEntries.map(([wordId, count]) => {
              const word = allAnimals.find(w => w.id === wordId)
              return word ? (
                <span key={wordId} className="bg-red-500/30 border border-red-500/50 text-red-300 text-sm px-2 py-1 rounded-xl font-semibold">
                  {word.emoji} {word.word} <span className="text-red-400 text-xs">×{count}</span>
                </span>
              ) : null
            })}
          </div>
        </div>
      )}

      {/* Rozetler */}
      <div>
        <p className="text-forest-200 font-semibold text-sm mb-2">
          Rozetler {earnedBadges.length}/{BADGE_DEFS.length}
        </p>
        <div className="flex flex-wrap gap-2">
          {BADGE_DEFS.map(b => {
            const earned = earnedBadges.some(e => e.id === b.id)
            return (
              <span key={b.id} title={b.desc}
                className={`text-xl transition-all ${earned ? '' : 'grayscale opacity-30'}`}>
                {b.icon}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Sekme: Ses ────────────────────────────────────────────────
function SoundTab({ settings, save }) {
  const { speak, isSpeaking } = useSpeech('en')

  return (
    <div className="flex flex-col gap-6">
      {/* TTS aç/kapat */}
      <div className="flex items-center justify-between bg-forest-700 rounded-2xl px-5 py-4">
        <div>
          <p className="text-white font-semibold">Sesli Okuma (TTS)</p>
          <p className="text-forest-200 text-sm">Kelimeleri otomatik seslendirme</p>
        </div>
        <button
          onClick={() => save({ ttsEnabled: !settings.ttsEnabled })}
          className={`
            w-14 h-7 rounded-full transition-all relative
            ${settings.ttsEnabled ? 'bg-amber-400' : 'bg-forest-600'}
          `}
        >
          <span className={`
            absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all
            ${settings.ttsEnabled ? 'right-0.5' : 'left-0.5'}
          `} />
        </button>
      </div>

      {/* Hız seçimi */}
      <div>
        <p className="text-white font-semibold mb-3">Konuşma Hızı</p>
        <div className="flex gap-3">
          {RATE_PRESETS.map(p => (
            <button
              key={p.value}
              onClick={() => save({ ttsRate: p.value })}
              className={`
                flex-1 py-3 rounded-2xl font-semibold text-sm transition-all
                ${Math.abs(settings.ttsRate - p.value) < 0.05
                  ? 'bg-amber-400 text-white shadow-lg'
                  : 'bg-forest-700 text-forest-200 hover:bg-forest-600'}
              `}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Test butonu */}
      <button
        onClick={() => speak('Hello, my name is Eagle!', { rate: settings.ttsRate })}
        disabled={!settings.ttsEnabled || isSpeaking}
        className="bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-default text-white font-[Fredoka_One] text-lg py-4 rounded-2xl shadow active:scale-95 transition-all"
      >
        {isSpeaking ? '🔉 Çalıyor...' : '🔊 Test Et'}
      </button>
    </div>
  )
}

// ── Sekme: Hedef ──────────────────────────────────────────────
function GoalsTab({ settings, save }) {
  const [pinMode, setPinMode]   = useState(false)
  const [pin1, setPin1]         = useState('')
  const [pin2, setPin2]         = useState('')
  const [pinMsg, setPinMsg]     = useState(null)

  const changePin = () => {
    if (pin1.length !== 4 || !/^\d{4}$/.test(pin1)) {
      setPinMsg({ ok: false, text: 'PIN 4 rakam olmalı' }); return
    }
    if (pin1 !== pin2) {
      setPinMsg({ ok: false, text: 'PIN\'ler eşleşmiyor' }); return
    }
    save({ pin: pin1 })
    setPinMsg({ ok: true, text: 'PIN güncellendi ✓' })
    setPinMode(false); setPin1(''); setPin2('')
    setTimeout(() => setPinMsg(null), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Günlük kart hedefi */}
      <div>
        <p className="text-white font-semibold mb-1">Günlük Kart Hedefi</p>
        <p className="text-forest-200 text-sm mb-3">Kartal ve Emir her gün kaç kart görmeli?</p>
        <div className="flex gap-2">
          {CARD_GOALS.map(n => (
            <button key={n} onClick={() => save({ dailyCardGoal: n })}
              className={`flex-1 py-3 rounded-2xl font-[Fredoka_One] text-lg transition-all
                ${settings.dailyCardGoal === n ? 'bg-amber-400 text-white shadow-lg' : 'bg-forest-700 text-forest-200 hover:bg-forest-600'}`}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Günlük quiz hedefi */}
      <div>
        <p className="text-white font-semibold mb-1">Günlük Quiz Hedefi</p>
        <div className="flex gap-2">
          {QUIZ_GOALS.map(n => (
            <button key={n} onClick={() => save({ dailyQuizGoal: n })}
              className={`flex-1 py-3 rounded-2xl font-[Fredoka_One] text-lg transition-all
                ${settings.dailyQuizGoal === n ? 'bg-amber-400 text-white shadow-lg' : 'bg-forest-700 text-forest-200 hover:bg-forest-600'}`}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* PIN değiştir */}
      <div className="bg-forest-700 rounded-2xl p-4">
        <p className="text-white font-semibold mb-3">PIN Değiştir 🔒</p>
        {!pinMode ? (
          <button onClick={() => setPinMode(true)}
            className="w-full bg-forest-600 hover:bg-forest-500 text-forest-200 font-semibold py-3 rounded-xl transition-all">
            PIN'i Değiştir
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <input type="password" maxLength={4} value={pin1} onChange={e => setPin1(e.target.value)}
              placeholder="Yeni PIN (4 rakam)"
              className="w-full bg-forest-600 text-white placeholder-forest-400 px-4 py-3 rounded-xl outline-none border-2 border-transparent focus:border-amber-400 font-[Fredoka_One] text-xl tracking-widest" />
            <input type="password" maxLength={4} value={pin2} onChange={e => setPin2(e.target.value)}
              placeholder="Tekrar gir"
              className="w-full bg-forest-600 text-white placeholder-forest-400 px-4 py-3 rounded-xl outline-none border-2 border-transparent focus:border-amber-400 font-[Fredoka_One] text-xl tracking-widest" />
            <div className="flex gap-2">
              <button onClick={changePin}
                className="flex-1 bg-amber-400 hover:bg-amber-300 text-white font-semibold py-2 rounded-xl transition-all">Kaydet</button>
              <button onClick={() => { setPinMode(false); setPin1(''); setPin2('') }}
                className="flex-1 bg-forest-600 text-forest-200 font-semibold py-2 rounded-xl transition-all">İptal</button>
            </div>
          </div>
        )}
        {pinMsg && (
          <p className={`text-sm font-semibold mt-2 ${pinMsg.ok ? 'text-green-400' : 'text-red-400'}`}>
            {pinMsg.text}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Ana bileşen ───────────────────────────────────────────────
export default function ParentPanel({ onClose }) {
  const [activeProfile, setActiveProfile] = useState('kartal')
  const [activeTab, setActiveTab]         = useState('stats')
  const { settings, save }                = useSettings()

  return (
    <div className="flex flex-col min-h-svh px-4 py-6 gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-[Fredoka_One] text-2xl text-white">👨‍👩‍👧 Ebeveyn Paneli</h2>
        <button onClick={onClose} className="text-forest-200 hover:text-white text-2xl transition-colors">✕</button>
      </div>

      {/* Profil seçici */}
      <div className="flex gap-2 bg-forest-700 rounded-2xl p-1">
        {PROFILES.map(p => (
          <button key={p.id} onClick={() => setActiveProfile(p.id)}
            className={`flex-1 py-2.5 rounded-xl font-[Fredoka_One] text-lg transition-all
              ${activeProfile === p.id ? 'bg-white text-forest-800 shadow' : 'text-forest-200 hover:text-white'}`}>
            {p.avatar} {p.name}
          </button>
        ))}
      </div>

      {/* Sekme seçici */}
      <div className="flex gap-1 bg-forest-700 rounded-2xl p-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all
              ${activeTab === t.id ? 'bg-white text-forest-800 shadow' : 'text-forest-200 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Sekme içeriği */}
      <div className="flex-1 overflow-y-auto pb-4">
        {activeTab === 'stats' && <StatsTab profileId={activeProfile} />}
        {activeTab === 'sound' && <SoundTab settings={settings} save={save} />}
        {activeTab === 'goals' && <GoalsTab settings={settings} save={save} />}
      </div>
    </div>
  )
}
