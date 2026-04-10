import { useState } from 'react'
import { useProgress, BADGE_DEFS } from '../hooks/useProgress'
import { useSettings }              from '../hooks/useSettings'
import { useSpeech }                from '../hooks/useSpeech'
import { useDailyPlan, DEFAULT_WEEKLY_PLAN } from '../hooks/useDailyPlan'
import {
  useParentControls, ENERGY_PRESETS,
  readLangSettings,
} from '../hooks/useParentControls'
import { CATEGORIES as ALL_CATS }   from '../data/categories'
import animalsData                  from '../data/animals-a1.json'

const PROFILES = [
  { id: 'kartal', name: 'Kartal', avatar: '🦅' },
  { id: 'emir',   name: 'Emir',   avatar: '⚡' },
]

const TABS = [
  { id: 'stats',   label: '📊 İstatistik' },
  { id: 'plan',    label: '📅 Plan'       },
  { id: 'control', label: '⚙️ Kontrol'   },
  { id: 'sound',   label: '🔊 Ses'        },
  { id: 'goals',   label: '🎯 Hedef'      },
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

// ── Sekme: Kontrol ────────────────────────────────────────────

const CTRL_LANGS = [
  { id: 'en', flag: '🇬🇧', label: 'İngilizce' },
  { id: 'de', flag: '🇩🇪', label: 'Almanca'   },
  { id: 'es', flag: '🇪🇸', label: 'İspanyolca'},
]

const ENERGY_OPTIONS = [
  { id: 'low',    icon: '🔋',          label: 'Düşük',  desc: '5 kart · 10 dk · quiz kapalı' },
  { id: 'medium', icon: '🔋🔋',        label: 'Orta',   desc: '10 kart · 15 dk · quiz açık'  },
  { id: 'high',   icon: '🔋🔋🔋',      label: 'Yüksek', desc: '20 kart · 25 dk · quiz açık'  },
  { id: 'custom', icon: '⚙️',          label: 'Manuel', desc: 'Özelleştir'                   },
]

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <p className="text-amber-400 font-[Fredoka_One] text-base mb-3">{title}</p>
      {children}
    </div>
  )
}

function Toggle({ label, desc, value, onChange }) {
  return (
    <div className="flex items-center justify-between bg-forest-700 rounded-2xl px-4 py-3 mb-2">
      <div>
        <p className="text-white font-semibold text-sm">{label}</p>
        {desc && <p className="text-forest-200 text-xs mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ml-3
          ${value ? 'bg-amber-400' : 'bg-forest-600'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all
          ${value ? 'right-0.5' : 'left-0.5'}`} />
      </button>
    </div>
  )
}

function ControlTab() {
  const ctrl = useParentControls()
  const {
    langSettings, energyMode, activeCategories,
    timeSettings, vacationMode, notifSettings,
    setLangEnabled, setLangPriority,
    setEnergyMode, setCustomEnergy,
    setCategoryEnabled, setTimeSettings,
    setVacationMode, setNotif,
  } = ctrl

  // wordStats'tan performans analizi
  const [perfAnalysis] = useState(() => {
    try {
      const stats = JSON.parse(localStorage.getItem('aguilang_word_stats') || '{}')
      const entries = Object.entries(stats)
      if (!entries.length) return null
      const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const recent = entries.filter(([, s]) => s.lastSeen && new Date(s.lastSeen) >= sevenDaysAgo)
      if (!recent.length) return null
      const totalCorrect = recent.reduce((a, [, s]) => a + s.correct, 0)
      const totalSeen    = recent.reduce((a, [, s]) => a + s.seen, 0)
      const rate = totalSeen > 0 ? Math.round((totalCorrect / totalSeen) * 100) : 0
      const hardWords = entries
        .filter(([, s]) => s.wrong >= 2)
        .sort((a, b) => b[1].wrong - a[1].wrong)
        .slice(0, 4)
        .map(([id]) => id)
      let suggestion = ''
      if (rate >= 80) suggestion = 'Kart sayısını artırabilirsiniz.'
      else if (rate < 60) suggestion = 'Kart sayısını azaltın, tekrara odaklanın.'
      else suggestion = 'Mevcut tempo iyi gidiyor.'
      return { rate, hardWords, suggestion }
    } catch { return null }
  })

  const customE = energyMode.custom ?? ENERGY_PRESETS.medium

  return (
    <div className="flex flex-col">

      {/* BÖLÜM 1 — Dil Kontrolü */}
      <Section title="1. Dil Kontrolü">
        <p className="text-forest-200 text-xs mb-2">Öncelikli dil çocuğa ilk gösterilir.</p>
        {CTRL_LANGS.map(l => {
          const isEnabled  = langSettings.enabled.includes(l.id)
          const isPriority = langSettings.priority === l.id
          const isLast     = langSettings.enabled.length === 1 && isEnabled
          return (
            <div key={l.id} className="flex items-center gap-3 bg-forest-700 rounded-2xl px-4 py-3 mb-2">
              <span className="text-xl">{l.flag}</span>
              <span className="text-white font-semibold text-sm flex-1">{l.label}</span>
              {/* Öncelik radio */}
              <button
                onClick={() => isEnabled && setLangPriority(l.id)}
                title="Öncelikli yap"
                className={`w-6 h-6 rounded-full border-2 transition-all flex-shrink-0
                  ${isPriority ? 'bg-amber-400 border-amber-400' : 'border-forest-400 bg-transparent'}`}
              />
              {/* Açık/kapalı toggle */}
              <button
                onClick={() => !isLast && setLangEnabled(l.id, !isEnabled)}
                disabled={isLast}
                title={isLast ? 'En az 1 dil açık olmalı' : ''}
                className={`w-10 h-5 rounded-full transition-all relative flex-shrink-0
                  ${isEnabled ? 'bg-green-500' : 'bg-forest-600'}
                  ${isLast ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all
                  ${isEnabled ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>
          )
        })}
      </Section>

      {/* BÖLÜM 2 — Enerji Seviyesi */}
      <Section title="2. Enerji Seviyesi">
        <div className="grid grid-cols-2 gap-2 mb-3">
          {ENERGY_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setEnergyMode(opt.id)}
              className={`py-3 px-2 rounded-2xl text-sm font-semibold transition-all text-left
                ${energyMode.mode === opt.id ? 'bg-amber-400 text-white shadow-lg' : 'bg-forest-700 text-forest-200 hover:bg-forest-600'}`}
            >
              <div className="text-base mb-0.5">{opt.icon}</div>
              <div className="font-bold">{opt.label}</div>
              <div className={`text-xs mt-0.5 ${energyMode.mode === opt.id ? 'text-amber-100' : 'text-forest-300'}`}>
                {opt.desc}
              </div>
            </button>
          ))}
        </div>

        {energyMode.mode === 'custom' && (
          <div className="bg-forest-700 rounded-2xl p-4 flex flex-col gap-3">
            {[
              { key: 'cardLimit', label: 'Kart', min: 5, max: 30, step: 5 },
              { key: 'durationMinutes', label: 'Dakika', min: 5, max: 30, step: 5 },
            ].map(({ key, label, min, max, step }) => (
              <div key={key}>
                <div className="flex justify-between mb-1">
                  <span className="text-forest-200 text-xs font-semibold">{label}</span>
                  <span className="text-white text-xs font-bold">{customE[key]}</span>
                </div>
                <input
                  type="range" min={min} max={max} step={step}
                  value={customE[key]}
                  onChange={e => setCustomEnergy({ [key]: Number(e.target.value) })}
                  className="w-full accent-amber-400 h-2"
                />
              </div>
            ))}
            <div className="flex gap-2">
              {[
                { key: 'quizEnabled', label: '📝 Quiz' },
                { key: 'gameEnabled', label: '🎮 Oyun' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setCustomEnergy({ [key]: !customE[key] })}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all
                    ${customE[key] ? 'bg-green-500/30 border border-green-500/50 text-green-300' : 'bg-forest-600 text-forest-300'}`}
                >
                  {label} {customE[key] ? 'Açık' : 'Kapalı'}
                </button>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* BÖLÜM 3 — Kategori Yönetimi */}
      <Section title="3. Kategori Yönetimi">
        <p className="text-forest-200 text-xs mb-2">En az 3 kategori açık olmalı.</p>
        <div className="grid grid-cols-3 gap-2">
          {ALL_CATS.map(cat => {
            const isOn = activeCategories.includes(cat.id)
            const isLast = activeCategories.length <= 3 && isOn
            return (
              <button
                key={cat.id}
                onClick={() => !isLast && setCategoryEnabled(cat.id, !isOn)}
                disabled={isLast}
                className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-1
                  ${isOn ? 'bg-green-500/20 border border-green-500/40 text-green-300' : 'bg-forest-700 text-forest-400 opacity-60'}
                  ${isLast ? 'cursor-not-allowed' : ''}`}
              >
                <span className="text-base">{cat.icon}</span>
                <span className="leading-tight text-center">{cat.label}</span>
              </button>
            )
          })}
        </div>
      </Section>

      {/* BÖLÜM 4 — Zaman Kısıtlaması */}
      <Section title="4. Çalışma Saatleri">
        <div className="bg-forest-700 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <p className="text-forest-200 text-xs mb-1">Başlangıç</p>
              <input
                type="time"
                value={`${String(timeSettings.startHour).padStart(2,'0')}:${String(timeSettings.startMin).padStart(2,'0')}`}
                onChange={e => {
                  const [h, m] = e.target.value.split(':').map(Number)
                  setTimeSettings({ startHour: h, startMin: m })
                }}
                className="w-full bg-forest-600 text-white rounded-xl px-3 py-2.5 text-sm font-bold border-none outline-none"
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div className="flex-1">
              <p className="text-forest-200 text-xs mb-1">Bitiş</p>
              <input
                type="time"
                value={`${String(timeSettings.endHour).padStart(2,'0')}:${String(timeSettings.endMin).padStart(2,'0')}`}
                onChange={e => {
                  const [h, m] = e.target.value.split(':').map(Number)
                  setTimeSettings({ endHour: h, endMin: m })
                }}
                className="w-full bg-forest-600 text-white rounded-xl px-3 py-2.5 text-sm font-bold border-none outline-none"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>
          <Toggle
            label="Hafta Sonu"
            desc="Cumartesi ve Pazar aktif"
            value={timeSettings.weekendEnabled}
            onChange={v => setTimeSettings({ weekendEnabled: v })}
          />
        </div>
      </Section>

      {/* BÖLÜM 5 — Tatil Modu */}
      <Section title="5. Tatil Modu">
        <Toggle
          label="Tatil Modu 🏖️"
          desc={vacationMode.active ? 'Aktif — streak donduruldu' : 'Kapalı — streak normal sayılıyor'}
          value={vacationMode.active}
          onChange={v => setVacationMode(v)}
        />
      </Section>

      {/* BÖLÜM 6 — Bildirimler */}
      <Section title="6. Bildirimler">
        <Toggle
          label="Görev Tamamlandı"
          desc="Her oturum bitiminde bildirim"
          value={notifSettings.onComplete}
          onChange={v => setNotif('onComplete', v)}
        />
        <Toggle
          label="Seri Kırılma Uyarısı"
          desc="Günlük streak tehlikedeyse bildirim"
          value={notifSettings.streakWarning}
          onChange={v => setNotif('streakWarning', v)}
        />
        <Toggle
          label="Haftalık Özet"
          desc="Her Pazar 20:00"
          value={notifSettings.weeklyReport}
          onChange={v => setNotif('weeklyReport', v)}
        />
      </Section>

      {/* BÖLÜM 7 — Performans Önerisi */}
      <Section title="7. Performans Analizi">
        {perfAnalysis ? (
          <div className="bg-forest-700 rounded-2xl p-4 flex flex-col gap-2">
            <p className="text-white font-semibold text-sm">
              Son 7 günde{' '}
              <span className={`font-[Fredoka_One] text-lg ${perfAnalysis.rate >= 70 ? 'text-green-400' : 'text-amber-400'}`}>
                %{perfAnalysis.rate}
              </span>{' '}
              başarı
            </p>
            {perfAnalysis.hardWords.length > 0 && (
              <p className="text-forest-200 text-xs">
                Zorlandığı kelimeler: {perfAnalysis.hardWords.join(', ')}
              </p>
            )}
            <p className="text-amber-400 text-xs font-semibold">
              💡 {perfAnalysis.suggestion}
            </p>
          </div>
        ) : (
          <div className="bg-forest-700 rounded-2xl p-4 text-center">
            <p className="text-forest-200 text-sm">Henüz yeterli veri yok.</p>
            <p className="text-forest-300 text-xs mt-1">Birkaç oturum tamamlandıktan sonra analiz burada görünür.</p>
          </div>
        )}
      </Section>

    </div>
  )
}

// ── Sekme: Haftalık Plan ──────────────────────────────────────
const PLAN_CATEGORIES = [
  { id: 'animals',    icon: '🐾', label: 'Hayvanlar'  },
  { id: 'colors',     icon: '🎨', label: 'Renkler'    },
  { id: 'numbers',    icon: '🔢', label: 'Sayılar'    },
  { id: 'fruits',     icon: '🍎', label: 'Meyveler'   },
  { id: 'family',     icon: '👨‍👩‍👧', label: 'Aile'      },
  { id: 'food',       icon: '🍔', label: 'Yiyecek'    },
  { id: 'school',     icon: '🏫', label: 'Okul'       },
  { id: 'body',       icon: '🫀', label: 'Vücut'      },
  { id: 'greetings',  icon: '👋', label: 'Selamlaşma' },
]

const CARD_LIMITS = [5, 10, 15, 20]
const DURATIONS   = [5, 10, 15, 20]
const LANG_OPTIONS = [
  { id: 'en', flag: '🇬🇧', label: 'İngilizce' },
  { id: 'de', flag: '🇩🇪', label: 'Almanca'   },
  { id: 'es', flag: '🇪🇸', label: 'İspanyolca'},
]

const DAY_DISPLAY = {
  monday:    { tr: 'Pazartesi', short: 'Pzt' },
  tuesday:   { tr: 'Salı',      short: 'Sal' },
  wednesday: { tr: 'Çarşamba',  short: 'Çar' },
  thursday:  { tr: 'Perşembe',  short: 'Per' },
  friday:    { tr: 'Cuma',      short: 'Cum' },
  saturday:  { tr: 'Cumartesi', short: 'Cmt' },
  sunday:    { tr: 'Pazar',     short: 'Paz' },
}

function PlanTab() {
  const { weeklyPlan, updateDay, DAY_NAMES } = useDailyPlan()
  const [selectedDay, setSelectedDay] = useState('monday')

  const dayPlan = weeklyPlan[selectedDay] ?? DEFAULT_WEEKLY_PLAN[selectedDay]
  const catInfo = PLAN_CATEGORIES.find(c => c.id === dayPlan.categoryId) ?? PLAN_CATEGORIES[0]

  const update = (patch) => updateDay(selectedDay, patch)

  return (
    <div className="flex flex-col gap-4">
      {/* Gün seçici */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_NAMES.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`py-2 rounded-xl text-xs font-bold transition-all
              ${selectedDay === day ? 'bg-amber-400 text-white shadow' : 'bg-forest-700 text-forest-200 hover:bg-forest-600'}`}
          >
            {DAY_DISPLAY[day]?.short ?? day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Seçili gün başlığı */}
      <p className="text-white font-[Fredoka_One] text-lg">
        {DAY_DISPLAY[selectedDay]?.tr ?? selectedDay}
      </p>

      {/* Dil seçimi */}
      <div>
        <p className="text-forest-200 text-sm font-semibold mb-2">Dil</p>
        <div className="flex gap-2">
          {LANG_OPTIONS.map(l => (
            <button
              key={l.id}
              onClick={() => update({ langId: l.id })}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all
                ${dayPlan.langId === l.id ? 'bg-amber-400 text-white shadow' : 'bg-forest-700 text-forest-200 hover:bg-forest-600'}`}
            >
              {l.flag} {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Kategori seçimi */}
      <div>
        <p className="text-forest-200 text-sm font-semibold mb-2">Kategori</p>
        <div className="grid grid-cols-3 gap-2">
          {PLAN_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => update({ categoryId: cat.id })}
              className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-1
                ${dayPlan.categoryId === cat.id ? 'bg-amber-400 text-white shadow' : 'bg-forest-700 text-forest-200 hover:bg-forest-600'}`}
            >
              <span className="text-base">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Kart limiti */}
      <div>
        <p className="text-forest-200 text-sm font-semibold mb-2">Kart Sayısı</p>
        <div className="flex gap-2">
          {CARD_LIMITS.map(n => (
            <button
              key={n}
              onClick={() => update({ cardLimit: n })}
              className={`flex-1 py-2.5 rounded-xl font-[Fredoka_One] text-lg transition-all
                ${dayPlan.cardLimit === n ? 'bg-amber-400 text-white shadow' : 'bg-forest-700 text-forest-200 hover:bg-forest-600'}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Süre */}
      <div>
        <p className="text-forest-200 text-sm font-semibold mb-2">Süre (dakika)</p>
        <div className="flex gap-2">
          {DURATIONS.map(n => (
            <button
              key={n}
              onClick={() => update({ durationMinutes: n })}
              className={`flex-1 py-2.5 rounded-xl font-[Fredoka_One] text-lg transition-all
                ${dayPlan.durationMinutes === n ? 'bg-amber-400 text-white shadow' : 'bg-forest-700 text-forest-200 hover:bg-forest-600'}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Quiz / Oyun toggle */}
      <div className="flex gap-3">
        <button
          onClick={() => update({ quizEnabled: !dayPlan.quizEnabled })}
          className={`flex-1 py-3 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2
            ${dayPlan.quizEnabled ? 'bg-green-500/30 border border-green-500/50 text-green-300' : 'bg-forest-700 text-forest-300'}`}
        >
          📝 Quiz {dayPlan.quizEnabled ? 'Açık' : 'Kapalı'}
        </button>
        <button
          onClick={() => update({ gameEnabled: !dayPlan.gameEnabled })}
          className={`flex-1 py-3 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2
            ${dayPlan.gameEnabled ? 'bg-green-500/30 border border-green-500/50 text-green-300' : 'bg-forest-700 text-forest-300'}`}
        >
          🎮 Oyun {dayPlan.gameEnabled ? 'Açık' : 'Kapalı'}
        </button>
      </div>

      {/* Özet */}
      <div className="bg-forest-700 rounded-2xl p-4 flex items-center gap-3">
        <span className="text-2xl">{catInfo.icon}</span>
        <div>
          <p className="text-white font-semibold text-sm">
            {catInfo.label} · {LANG_OPTIONS.find(l => l.id === dayPlan.langId)?.flag} ·{' '}
            {dayPlan.cardLimit} kart · {dayPlan.durationMinutes} dk
          </p>
          <p className="text-forest-200 text-xs mt-0.5">
            {dayPlan.quizEnabled ? '📝 Quiz ' : ''}{dayPlan.gameEnabled ? '🎮 Oyun' : ''}
            {!dayPlan.quizEnabled && !dayPlan.gameEnabled ? 'Sadece kartlar' : ''}
          </p>
        </div>
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
        {activeTab === 'stats'   && <StatsTab profileId={activeProfile} />}
        {activeTab === 'plan'    && <PlanTab />}
        {activeTab === 'control' && <ControlTab />}
        {activeTab === 'sound'   && <SoundTab settings={settings} save={save} />}
        {activeTab === 'goals'   && <GoalsTab settings={settings} save={save} />}
      </div>
    </div>
  )
}
