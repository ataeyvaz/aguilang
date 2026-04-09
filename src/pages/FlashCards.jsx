import { useState, useEffect } from 'react'
import animalsData from '../data/animals-a1.json'
import { useSpeech } from '../hooks/useSpeech'

export default function FlashCards({ profile, language, categoryData, onBack, onDone }) {
  const data  = categoryData ?? animalsData
  const words = data.translations[language.id]?.words ?? []

  const [index,   setIndex]   = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [done,    setDone]    = useState(false)
  const [reveal,  setReveal]  = useState(false)

  const { speak, isSpeaking, ttsSupported } = useSpeech(language.id)

  const word     = words[index]
  const progress = ((index + 1) / words.length) * 100

  useEffect(() => {
    if (flipped && ttsSupported) speak(word.word)
  }, [flipped, word.word, ttsSupported]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setReveal(false)
    const t = setTimeout(() => setReveal(true), 60)
    return () => clearTimeout(t)
  }, [index, flipped])

  const handleFlip   = () => setFlipped(true)
  const handleRepeat = () => setFlipped(false)
  const handleNext   = () => {
    if (index + 1 >= words.length) { setDone(true); onDone?.(words.length) }
    else { setIndex(i => i + 1); setFlipped(false) }
  }
  const handleRestart = () => { setIndex(0); setFlipped(false); setDone(false) }

  // ── Bitiş ekranı ──
  if (done) {
    return (
      <div style={{
        minHeight: '100vh', background: '#EEF7FF',
        fontFamily: "'Plus Jakarta Sans', 'Be Vietnam Pro', sans-serif",
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 28, padding: '40px 24px',
      }}>
        <div style={{
          width: 120, height: 120, borderRadius: '50%',
          background: '#ffffff', border: '3px solid #b3e4ef',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 60, boxShadow: '0 8px 32px rgba(0,104,126,0.15)',
        }}>🎉</div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: '#0d1b2a' }}>
            Tebrikler, {profile.name}!
          </h2>
          <p style={{ margin: '8px 0 0', fontSize: 16, color: '#4a6572', fontWeight: 600 }}>
            {words.length} kelimeyi tamamladın! 🌟
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
          <button onClick={handleRestart} style={{
            height: 60, borderRadius: 18, border: 'none',
            background: 'linear-gradient(135deg,#00b896,#00687e)',
            color: '#fff', fontSize: 18, fontWeight: 800,
            cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,104,126,0.3)',
          }}>
            🔄 Tekrar Oyna
          </button>
          <button onClick={onBack} style={{
            height: 60, borderRadius: 18,
            background: '#ffffff', border: '2px solid #c0d8e4',
            color: '#4a6572', fontSize: 16, fontWeight: 700,
            cursor: 'pointer',
          }}>
            ← Geri Dön
          </button>
        </div>
      </div>
    )
  }

  // ── Ana ekran ──
  return (
    <div style={{
      minHeight: '100vh', background: '#EEF7FF',
      fontFamily: "'Plus Jakarta Sans', 'Be Vietnam Pro', sans-serif",
      display: 'flex', flexDirection: 'column',
      padding: '20px 20px 32px', gap: 20,
    }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={{
          background: '#b3e4ef', border: 'none', borderRadius: 12,
          color: '#00687e', width: 40, height: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 18, fontWeight: 700,
        }}>←</button>
        <span style={{ fontSize: 13, color: '#4a6572', fontWeight: 700 }}>
          {language.flag} {language.label}
        </span>
        <span style={{ fontSize: 24 }}>{profile.avatar}</span>
      </div>

      {/* Progress */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#00687e', textTransform: 'uppercase', letterSpacing: 0.8 }}>
            {data.category ?? 'Kartlar'}
          </span>
          <span style={{ fontSize: 12, color: '#4a6572', fontWeight: 600 }}>
            {index + 1} / {words.length}
          </span>
        </div>
        <div style={{ height: 10, background: '#c0d8e4', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 10,
            background: 'linear-gradient(90deg,#00b896,#00687e)',
            width: `${progress}%`, transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Kart alanı */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>

        {/* Emoji daire */}
        <button
          onClick={!flipped ? handleFlip : undefined}
          style={{
            width: 160, height: 160, borderRadius: '50%',
            background: '#ffffff',
            border: '3px solid #b3e4ef',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 80, cursor: flipped ? 'default' : 'pointer',
            boxShadow: '0 8px 32px rgba(0,104,126,0.12)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => { if (!flipped) e.currentTarget.style.transform = 'scale(1.05)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
          aria-label="Kartı çevir"
        >
          {word.emoji}
        </button>

        {/* İçerik */}
        <div style={{
          width: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 16, textAlign: 'center',
          opacity: reveal ? 1 : 0,
          transform: reveal ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.3s, transform 0.3s',
        }}>
          {!flipped ? (
            <>
              <div style={{
                background: '#ffffff', border: '2px solid #c0d8e4',
                borderRadius: 18, padding: '16px 32px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
              }}>
                <div style={{ fontSize: 11, color: '#6b8fa1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>
                  Türkçe
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#00687e' }}>
                  {word.tr}
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#6b8fa1', fontWeight: 600 }}>
                👆 Kelimeyi görmek için dokun
              </p>
            </>
          ) : (
            <>
              {/* Yabancı kelime */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h1 style={{ margin: 0, fontSize: 52, fontWeight: 900, color: '#0d1b2a', letterSpacing: -1 }}>
                  {word.word}
                </h1>
                {ttsSupported && (
                  <button
                    onClick={e => { e.stopPropagation(); speak(word.word) }}
                    disabled={isSpeaking}
                    style={{
                      width: 42, height: 42, borderRadius: '50%',
                      background: '#b3e4ef', border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, cursor: 'pointer', flexShrink: 0,
                      opacity: isSpeaking ? 0.5 : 1,
                    }}
                  >
                    {isSpeaking ? '⏳' : '🔊'}
                  </button>
                )}
              </div>

              {/* IPA */}
              <p style={{ margin: 0, fontSize: 17, color: '#6b8fa1', fontWeight: 600 }}>
                /{word.pron}/
              </p>

              {/* Türkçe */}
              <div style={{
                background: '#ffffff', border: '2px solid #c0d8e4',
                borderRadius: 18, padding: '14px 28px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
              }}>
                <div style={{ fontSize: 11, color: '#6b8fa1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>
                  Türkçe
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#00687e' }}>
                  {word.tr}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Aksiyon butonları */}
      <div style={{ display: 'grid', gridTemplateColumns: flipped ? '1fr 1fr' : '1fr', gap: 12 }}>
        {flipped ? (
          <>
            <button onClick={handleRepeat} style={{
              height: 72, borderRadius: 20, border: '2px solid #c0d8e4',
              background: '#ffffff', color: '#4a6572',
              fontSize: 16, fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'transform 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span style={{ fontSize: 22 }}>🔄</span>
              <span>Öğreniyorum</span>
            </button>

            <button onClick={handleNext} style={{
              height: 72, borderRadius: 20, border: 'none',
              background: 'linear-gradient(135deg,#00b896,#00687e)',
              color: '#fff', fontSize: 16, fontWeight: 800,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 4px 16px rgba(0,104,126,0.3)',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span style={{ fontSize: 22 }}>✅</span>
              <span>{index + 1 >= words.length ? 'Bitir!' : 'Biliyorum!'}</span>
            </button>
          </>
        ) : (
          <button onClick={handleFlip} style={{
            height: 72, borderRadius: 20, border: 'none',
            background: '#00687e', color: '#fff',
            fontSize: 18, fontWeight: 800, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: '0 4px 16px rgba(0,104,126,0.25)',
            transition: 'transform 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span style={{ fontSize: 24 }}>👆</span>
            Kartı Çevir
          </button>
        )}
      </div>
    </div>
  )
}
