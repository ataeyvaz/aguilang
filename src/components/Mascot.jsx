const COSTUMES = {
  none: { accessory: '🌟', msg: 'Hadi oynayalım!',  bg: 'bg-amber-400' },
  en:   { accessory: '🎩', msg: "Let's go!",         bg: 'bg-blue-500'  },
  de:   { accessory: '⚙️', msg: "Los geht's!",       bg: 'bg-yellow-500'},
  es:   { accessory: '🌺', msg: '¡Vamos!',           bg: 'bg-red-500'   },
}

export default function Mascot({ language = null, size = 'lg' }) {
  const key = language?.id ?? 'none'
  const costume = COSTUMES[key] ?? COSTUMES.none
  const baseSize  = size === 'lg' ? 'text-8xl' : 'text-5xl'
  const badgeSize = size === 'lg' ? 'text-3xl'  : 'text-xl'

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <div className="relative inline-block">
        <span className={`${baseSize} inline-block animate-bounce`}>🦅</span>
        <span
          className={`absolute -top-1 -right-3 ${badgeSize}
            ${costume.bg} rounded-full w-9 h-9 flex items-center justify-center shadow-md`}
          style={{ fontSize: size === 'lg' ? '1.1rem' : '0.8rem' }}
        >
          {costume.accessory}
        </span>
      </div>
      <p className="text-forest-200 font-semibold text-sm">{costume.msg}</p>
    </div>
  )
}
