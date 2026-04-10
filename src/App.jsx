import { useState } from 'react'
import { useProfile }    from './hooks/useProfile'
import { CATEGORIES as CAT_LIST } from './data/categories'
import { useProgress }   from './hooks/useProgress'
import { useSettings }   from './hooks/useSettings'
import { useDailyPlan }  from './hooks/useDailyPlan'
import { useSession }    from './hooks/useSession'
import { checkTimeRestriction, readVacationMode, getEnergyPatch } from './hooks/useParentControls'
import ProfileSelect     from './pages/ProfileSelect'
import Dashboard         from './pages/Dashboard'
import LanguageSelect    from './pages/LanguageSelect'
import CategorySelect    from './pages/CategorySelect'
import ModeSelect        from './pages/ModeSelect'
import FlashCards        from './pages/FlashCards'
import QuizScreen        from './pages/QuizScreen'
import QuizSummary       from './pages/QuizSummary'
import GameSelect        from './pages/GameSelect'
import ListeningGame     from './pages/ListeningGame'
import MemoryGame        from './pages/MemoryGame'
import MatchingGame      from './pages/MatchingGame'
import SentenceGame      from './pages/SentenceGame'
import WordSearchGame    from './pages/WordSearchGame'
import LevelUp           from './pages/LevelUp'
import ParentGate        from './pages/ParentGate'
import ParentPanel       from './pages/ParentPanel'
import DialogueScreen    from './pages/DialogueScreen'
import DailyMission      from './pages/DailyMission'
import SessionComplete   from './pages/SessionComplete'

export default function App() {
  const { activeProfile, setActiveProfile, clearActiveProfile } = useProfile()
  const {
    progress, earnedBadges,
    recordCards, recordQuiz, recordGame, recordLanguage,
    markLevelUpSeen, shouldLevelUp,
  } = useProgress(activeProfile?.id)
  const { settings } = useSettings()
  const { todayPlan } = useDailyPlan()
  const { startSession, recordCard, endSession, sessionData, getHardWords } = useSession()

  const [screen, setScreen]               = useState('profile')
  const [language, setLanguage]           = useState(null)
  const [category, setCategory]           = useState(null)
  const [quizResult, setQuizResult]       = useState(null)
  const [fromDailyMission, setFromDailyMission] = useState(false)
  const [activePlan, setActivePlan]       = useState(null)

  // ── Navigasyon ──
  const goProfile   = () => { clearActiveProfile(); setLanguage(null); setCategory(null); setQuizResult(null); setFromDailyMission(false); setScreen('profile') }
  const goDash      = () => setScreen('dashboard')
  const goDialogue  = () => setScreen('dialogue')
  const goLanguage = () => { setLanguage(null); setCategory(null); setQuizResult(null); setFromDailyMission(false); setScreen('language') }
  const goCategory = () => { setCategory(null); setQuizResult(null); setScreen('category') }
  const goMode     = () => { setQuizResult(null); setScreen('mode') }
  const goGames    = () => setScreen('game-select')
  const goDailyMission = () => setScreen('daily-mission')

  // ── Handlers ──
  const onSelectProfile  = (p) => { setActiveProfile(p); setScreen('daily-mission') }

  // Daily mission başlatıldığında plan'dan dil ve kategori otomatik seç
  const onDailyMissionStart = (plan) => {
    const langObj = LANG_MAP[plan.langId] ?? { id: plan.langId, flag: '', label: plan.langId }
    const cat = CAT_LIST.find(c => c.id === plan.categoryId) ?? CAT_LIST[0]
    setLanguage(langObj)
    setCategory(cat)
    setFromDailyMission(true)
    setActivePlan(plan)
    recordLanguage(langObj.id)
    startSession(plan.categoryId, plan.langId)
    setScreen('flashcards')
  }

  const LANG_MAP = {
    en: { id: 'en', flag: '🇬🇧', label: 'English' },
    de: { id: 'de', flag: '🇩🇪', label: 'Deutsch' },
    es: { id: 'es', flag: '🇪🇸', label: 'Español' },
  }

  const onSelectLanguage = (langOrId) => {
    const lang = typeof langOrId === 'string' ? (LANG_MAP[langOrId] ?? { id: langOrId, flag: '', label: langOrId }) : langOrId
    setLanguage(lang); recordLanguage(lang.id); setScreen('category')
  }

  const onSelectCategory = (catOrId) => {
    const cat = typeof catOrId === 'string' ? CAT_LIST.find(c => c.id === catOrId) : catOrId
    if (cat) { setCategory(cat); setScreen('mode') }
  }

  const onSelectMode = (mode) => {
    if (mode === 'games') setScreen('game-select')
    else if (mode === 'quiz') setScreen('quiz')
    else setScreen('flashcards')
  }

  const onSelectGame = (id) => { recordGame(id); setScreen(`game-${id}`) }

  const onQuizFinish = (result) => {
    const perfect = result.results.every(r => r.correct)
    recordQuiz({
      points: result.score,
      perfect,
      results: result.results,
      langId: language?.id,
    })
    setQuizResult(result)
    setScreen('quiz-summary')
  }

  const onFlashCardsDone = (count) => {
    recordCards(count)
    if (fromDailyMission) {
      const final = endSession(count)
      if (activePlan?.quizEnabled) {
        setScreen('quiz')
      } else {
        setScreen('session-complete')
      }
    } else {
      goMode()
    }
  }

  const onQuizFinishFromMission = (result) => {
    const perfect = result.results.every(r => r.correct)
    recordQuiz({ points: result.score, perfect, results: result.results, langId: language?.id })
    setQuizResult(result)
    if (activePlan?.gameEnabled) {
      setScreen('game-select')
    } else {
      setScreen('session-complete')
    }
  }

  const s = screen

  // ── Zaman kısıtlaması kontrolü (profil seçildikten sonra aktif) ──
  if (s !== 'profile' && s !== 'parent-gate' && s !== 'parent-panel') {
    const { blocked, message } = checkTimeRestriction()
    if (blocked) return (
      <div style={{
        minHeight: '100svh', background: '#EEF7FF',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px', fontFamily: "'Nunito', sans-serif", textAlign: 'center',
      }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>🦅</div>
        <p style={{ fontSize: 20, fontWeight: 800, color: '#003d47', whiteSpace: 'pre-line', marginBottom: 24 }}>
          {message}
        </p>
        <button
          onClick={goProfile}
          style={{
            background: 'linear-gradient(135deg, #00687e, #0097b2)',
            color: '#fff', border: 'none', borderRadius: 16,
            padding: '14px 32px', fontSize: 16, fontWeight: 800,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Ana Sayfaya Dön
        </button>
      </div>
    )
  }

  // ── Tatil modu bilgisi ──
  const isVacation = readVacationMode().active

  if (s === 'profile')   return <ProfileSelect onSelect={onSelectProfile} />

  if (s === 'daily-mission') return (
    <DailyMission
      todayPlan={todayPlan}
      profile={activeProfile}
      onStart={onDailyMissionStart}
      onSkip={goDash}
    />
  )

  if (s === 'session-complete') return (
    <SessionComplete
      sessionData={sessionData}
      hardWords={getHardWords()}
      onHome={goDash}
      onPlayAgain={goDailyMission}
    />
  )

  if (s === 'dashboard') return (
    <Dashboard
      profile={activeProfile}
      progress={progress}
      earnedBadges={earnedBadges}
      settings={settings}
      onPlay={goLanguage}
      onDialogue={goDialogue}
      onBack={goProfile}
      onParent={() => setScreen('parent-gate')}
    />
  )

  if (s === 'dialogue') return (
    <DialogueScreen profile={activeProfile} onBack={goDash} />
  )

  if (s === 'parent-gate') return (
    <ParentGate onSuccess={() => setScreen('parent-panel')} onBack={goDash} />
  )

  if (s === 'parent-panel') return (
    <ParentPanel onClose={goDash} />
  )

  if (s === 'language')  return (
    <LanguageSelect profile={activeProfile} onSelectLang={onSelectLanguage} onBack={goDash} />
  )

  if (s === 'category') return (
    <CategorySelect profile={activeProfile} lang={language?.id} onSelectCategory={onSelectCategory} onBack={goLanguage} />
  )

  if (s === 'mode')      return (
    <ModeSelect profile={activeProfile} language={language} category={category} onSelect={onSelectMode} onBack={goCategory} />
  )

  if (s === 'flashcards') return (
    <FlashCards profile={activeProfile} language={language} categoryData={category?.data} onBack={goMode} onDone={onFlashCardsDone} />
  )

  if (s === 'quiz') return (
    <QuizScreen
      profile={activeProfile} language={language} categoryData={category?.data}
      onFinish={fromDailyMission ? onQuizFinishFromMission : onQuizFinish}
      onBack={fromDailyMission ? goDailyMission : goMode}
    />
  )

  if (s === 'quiz-summary') {
    const afterSummary = shouldLevelUp ? () => setScreen('level-up') : goMode
    return (
      <QuizSummary
        profile={activeProfile} language={language} result={quizResult}
        onReplay={() => setScreen('quiz')} onBack={afterSummary}
      />
    )
  }

  if (s === 'level-up') return (
    <LevelUp profile={activeProfile} onContinue={() => { markLevelUpSeen(); goMode() }} />
  )

  const catData = category?.data

  if (s === 'game-select')     return <GameSelect     profile={activeProfile} language={language} onSelect={onSelectGame} onBack={fromDailyMission ? () => setScreen('session-complete') : goMode} />
  if (s === 'game-listening')  return <ListeningGame  profile={activeProfile} language={language} categoryData={catData} onBack={goGames} />
  if (s === 'game-memory')     return <MemoryGame     profile={activeProfile} language={language} categoryData={catData} onBack={goGames} />
  if (s === 'game-matching')   return <MatchingGame   profile={activeProfile} language={language} categoryData={catData} onBack={goGames} />
  if (s === 'game-sentence')   return <SentenceGame   profile={activeProfile} language={language} categoryData={catData} onBack={goGames} />
  if (s === 'game-wordsearch') return <WordSearchGame profile={activeProfile} language={language} categoryData={catData} onBack={goGames} />

  return null
}
