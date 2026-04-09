export default function QuizSummary({ profile, language, result, onReplay, onBack }) {
  const { score, results, totalWords } = result
  const correct = results.filter((r) => r.correct).length
  const wrong = results.filter((r) => !r.correct)
  const pct = Math.round((correct / results.length) * 100)

  let medal = '🥉'
  let message = 'İyi başlangıç!'
  if (pct === 100) { medal = '🏆'; message = 'Mükemmel!' }
  else if (pct >= 80) { medal = '🥇'; message = 'Harika!' }
  else if (pct >= 60) { medal = '🥈'; message = 'Çok iyi!' }

  return (
    <div className="flex flex-col items-center justify-center min-h-svh gap-6 px-6 py-8">
      {/* Medal & score */}
      <div className="text-center">
        <div className="text-8xl mb-2">{medal}</div>
        <h2 className="font-[Fredoka_One] text-4xl text-white">{message}</h2>
        <p className="text-forest-200 text-lg mt-1">{profile.avatar} {profile.name}</p>
      </div>

      {/* Score card */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="text-forest-800 font-semibold">Toplam Puan</span>
          <span className="font-[Fredoka_One] text-2xl text-amber-500">{score}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-forest-800 font-semibold">Doğru</span>
          <span className="font-[Fredoka_One] text-2xl text-green-500">{correct} ✅</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-forest-800 font-semibold">Yanlış</span>
          <span className="font-[Fredoka_One] text-2xl text-red-400">{wrong.length} ❌</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-400 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-center text-forest-400 text-sm font-semibold">{pct}% doğru</p>
      </div>

      {/* Yanlış yapılanlar */}
      {wrong.length > 0 && (
        <div className="w-full max-w-sm">
          <p className="text-forest-200 font-semibold mb-2">Tekrar çalış 📚</p>
          <div className="flex flex-wrap gap-2">
            {wrong.map(({ word }) => (
              <span
                key={word.id}
                className="bg-forest-700 text-white rounded-xl px-3 py-1 text-sm font-semibold"
              >
                {word.emoji} {word.word} ({word.tr})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Butonlar */}
      <div className="flex flex-col gap-3 w-full max-w-sm">
        <button
          onClick={onReplay}
          className="bg-amber-400 hover:bg-amber-300 text-white font-[Fredoka_One] text-xl py-4 rounded-2xl shadow-lg active:scale-95 transition-all"
        >
          Tekrar Quiz 🔄
        </button>
        <button
          onClick={onBack}
          className="text-forest-200 underline text-lg hover:text-white transition-colors text-center"
        >
          ← Dil Seçimine Dön
        </button>
      </div>
    </div>
  )
}
