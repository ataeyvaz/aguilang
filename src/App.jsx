import { useState } from 'react'
import { useProfile }    from './hooks/useProfile'
import { CATEGORIES as CAT_LIST } from './data/categories'
import { useProgress }   from './hooks/useProgress'
import { useSettings }   from './hooks/useSettings'
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

export default function App() {
  const { activeProfile, setActiveProfile, clearActiveProfile } = useProfile()
  const {
    progress, earnedBadges,
    recordCards, recordQuiz, recordGame, recordLanguage,
    markLevelUpSeen, shouldLevelUp,
  } = useProgress(activeProfile?.id)
  const { settings } = useSettings()

  const [screen, setScreen]         = useState('profile')
  const [language, setLanguage]     = useState(null)
  const [category, setCategory]     = useState(null)
  const [quizResult, setQuizResult] = useState(null)

  // ── Navigasyon ──
  const goProfile   = () => { clearActiveProfile(); setLanguage(null); setCategory(null); setQuizResult(null); setScreen('profile') }
  const goDash      = () => setScreen('dashboard')
  const goDialogue  = () => setScreen('dialogue')
  const goLanguage = () => { setLanguage(null); setCategory(null); setQuizResult(null); setScreen('language') }
  const goCategory = () => { setCategory(null); setQuizResult(null); setScreen('category') }
  const goMode     = () => { setQuizResult(null); setScreen('mode') }
  const goGames    = () => setScreen('game-select')

  // ── Handlers ──
  const onSelectProfile  = (p) => { setActiveProfile(p); setScreen('dashboard') }

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

  const onFlashCardsDone = (count) => { recordCards(count); goMode() }

  const s = screen

  if (s === 'profile')   return <ProfileSelect onSelect={onSelectProfile} />

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
    <QuizScreen profile={activeProfile} language={language} categoryData={category?.data} onFinish={onQuizFinish} onBack={goMode} />
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

  if (s === 'game-select')     return <GameSelect     profile={activeProfile} language={language} onSelect={onSelectGame} onBack={goMode} />
  if (s === 'game-listening')  return <ListeningGame  profile={activeProfile} language={language} categoryData={catData} onBack={goGames} />
  if (s === 'game-memory')     return <MemoryGame     profile={activeProfile} language={language} categoryData={catData} onBack={goGames} />
  if (s === 'game-matching')   return <MatchingGame   profile={activeProfile} language={language} categoryData={catData} onBack={goGames} />
  if (s === 'game-sentence')   return <SentenceGame   profile={activeProfile} language={language} categoryData={catData} onBack={goGames} />
  if (s === 'game-wordsearch') return <WordSearchGame profile={activeProfile} language={language} categoryData={catData} onBack={goGames} />

  return null
}
