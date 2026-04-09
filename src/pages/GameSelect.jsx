export default function GameSelect({ profile, language, onSelect, onBack }) {
  const games = [
    { id: 'listening', icon: '🎧', label: 'Dinleme',     desc: 'Duy ve seç',           bg: 'bg-cyan-500',    hover: 'hover:bg-cyan-400'    },
    { id: 'memory',    icon: '🧠', label: 'Hafıza',      desc: 'Çiftleri bul',          bg: 'bg-purple-500',  hover: 'hover:bg-purple-400'  },
    { id: 'matching',  icon: '🔗', label: 'Eşleştir',    desc: 'Doğru çiftleri bağla',  bg: 'bg-orange-500',  hover: 'hover:bg-orange-400'  },
    { id: 'sentence',  icon: '✏️', label: 'Cümle',       desc: 'Boşluğu doldur',        bg: 'bg-rose-500',    hover: 'hover:bg-rose-400'    },
    { id: 'wordsearch',icon: '🔍', label: 'Kelime Bul',  desc: 'Kelimeleri bul',        bg: 'bg-teal-500',    hover: 'hover:bg-teal-400'    },
  ]

  return (
    <div className="flex flex-col items-center justify-center min-h-svh gap-8 px-6 py-8">
      <div className="text-center">
        <p className="text-forest-200 text-lg mb-1">{language.flag} {language.label} · {profile.avatar} {profile.name}</p>
        <h2 className="font-[Fredoka_One] text-4xl text-white">Hangi oyun? 🎮</h2>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        {games.map((g) => (
          <button
            key={g.id}
            onClick={() => onSelect(g.id)}
            className={`
              flex items-center gap-4 px-6 py-4 rounded-2xl
              ${g.bg} ${g.hover}
              shadow-lg active:scale-95 transition-all duration-150 text-left
            `}
          >
            <span className="text-4xl">{g.icon}</span>
            <div>
              <p className="font-[Fredoka_One] text-white text-xl">{g.label}</p>
              <p className="text-white/80 text-sm font-semibold">{g.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <button onClick={onBack} className="text-forest-200 underline text-lg hover:text-white transition-colors">
        ← Geri
      </button>
    </div>
  )
}
