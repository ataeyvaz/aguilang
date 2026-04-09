import { useState } from 'react'
import { readSettings } from '../hooks/useSettings'

const PAD = ['1','2','3','4','5','6','7','8','9','','0','⌫']

export default function ParentGate({ onSuccess, onBack }) {
  const [input, setInput]   = useState('')
  const [shake, setShake]   = useState(false)
  const [error, setError]   = useState(false)

  const handleKey = (key) => {
    if (key === '') return
    if (key === '⌫') { setInput(p => p.slice(0, -1)); setError(false); return }
    if (input.length >= 4) return
    const next = input + key
    setInput(next)
    setError(false)

    if (next.length === 4) {
      const { pin } = readSettings()
      if (next === pin) {
        onSuccess()
      } else {
        setShake(true)
        setError(true)
        setTimeout(() => { setShake(false); setInput('') }, 600)
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-svh gap-8 px-6">
      <div className="text-center">
        <div className="text-6xl mb-2">🔒</div>
        <h2 className="font-[Fredoka_One] text-3xl text-white">Ebeveyn Paneli</h2>
        <p className="text-forest-200 text-sm mt-1">4 haneli PIN kodunu gir</p>
      </div>

      {/* PIN göstergesi */}
      <div className={`flex gap-4 ${shake ? 'shake' : ''}`}>
        {[0,1,2,3].map(i => (
          <div
            key={i}
            className={`
              w-5 h-5 rounded-full border-2 transition-all
              ${i < input.length
                ? error ? 'bg-red-400 border-red-400' : 'bg-amber-400 border-amber-400'
                : 'border-forest-400 bg-transparent'}
            `}
          />
        ))}
      </div>

      {error && <p className="text-red-400 font-semibold text-sm -mt-4">Yanlış PIN!</p>}

      {/* Sayı tuş takımı */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {PAD.map((key, i) => (
          <button
            key={i}
            onClick={() => handleKey(key)}
            disabled={!key}
            className={`
              aspect-square rounded-2xl font-[Fredoka_One] text-2xl
              transition-all active:scale-90 shadow
              ${!key
                ? 'invisible'
                : key === '⌫'
                  ? 'bg-forest-600 text-forest-200 hover:bg-forest-500'
                  : 'bg-white text-forest-800 hover:bg-forest-100'}
            `}
          >
            {key}
          </button>
        ))}
      </div>

      <button onClick={onBack} className="text-forest-200 underline text-lg hover:text-white transition-colors">
        ← Geri
      </button>
    </div>
  )
}
