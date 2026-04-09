const MODES = [
  {
    id: 'flashcards',
    label: 'Kartlar',
    desc:  'Kelimeleri öğren',
    icon:  'style',
    fill:  true,
    grad:  'from-[#001a2e] to-[#001e17]',
    border:'border-[#003a5c]',
    accent:'text-[#7dd3fc]',
  },
  {
    id: 'quiz',
    label: 'Quiz',
    desc:  '4 şıklı test yap',
    icon:  'quiz',
    fill:  true,
    grad:  'from-[#1a001a] to-[#001e17]',
    border:'border-[#3a005c]',
    accent:'text-[#d8b4fe]',
  },
  {
    id: 'games',
    label: 'Oyunlar',
    desc:  '5 farklı oyun',
    icon:  'sports_esports',
    fill:  true,
    grad:  'from-[#1a0a00] to-[#001e17]',
    border:'border-[#5c2a00]',
    accent:'text-[#fb923c]',
  },
]

export default function ModeSelect({ profile, language, category, onSelect, onBack }) {
  return (
    <div className="flex flex-col min-h-svh bg-surface px-5 pt-6 pb-10">

      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest transition-colors flex-shrink-0"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>
        <div className="min-w-0">
          <p className="text-on-surface-variant text-xs font-medium truncate">
            {language?.flag} {language?.label}
            {category && <span> · {category.icon} {category.label}</span>}
          </p>
          <h1 className="font-headline font-extrabold text-on-surface text-2xl leading-tight">
            Ne yapmak istersin?
          </h1>
        </div>
      </div>

      {/* Maskot alanı */}
      <div className="flex justify-center py-6">
        <div className="text-center">
          <div className="text-6xl mb-2 select-none">
            {profile?.avatar ?? '🦅'}
          </div>
          <p className="text-on-surface-variant text-sm font-medium">
            {profile?.name}
          </p>
        </div>
      </div>

      {/* Mod kartları */}
      <div className="flex flex-col gap-4 flex-1">
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            className={`
              flex items-center gap-5 px-5 h-24 rounded-2xl border
              bg-gradient-to-br ${m.grad} ${m.border}
              active:scale-[0.97] transition-all duration-150 text-left
              hover:brightness-125
            `}
          >
            {/* İkon */}
            <div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center flex-shrink-0">
              <span
                className="material-symbols-outlined text-3xl text-on-surface"
                style={m.fill ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {m.icon}
              </span>
            </div>

            {/* Metin */}
            <div className="flex-1 min-w-0">
              <p className="font-headline font-extrabold text-on-surface text-xl leading-tight">
                {m.label}
              </p>
              <p className={`text-sm font-medium mt-0.5 ${m.accent}`}>
                {m.desc}
              </p>
            </div>

            {/* Ok */}
            <span className="material-symbols-outlined text-on-surface-variant text-xl flex-shrink-0">
              chevron_right
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
