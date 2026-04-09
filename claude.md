# AguiLang 🦅

Türkçe konuşan çocuklar (9 yaş) için İngilizce, Almanca ve İspanyolca öğreten web uygulaması.
Kartal (oğlum) ve kuzeni Emir için yapılıyor.

## Stack
- React + Vite + TailwindCSS
- localStorage (sıfır backend, sıfır maliyet)
- Kural tabanlı JS botu (API yok)
- Deploy: Vercel

## Proje yapısı
```
src/
  pages/       → tam ekran bileşenler (ProfileSelect, LanguageSelect, FlashCards, Quiz…)
  components/  → küçük, tekrar kullanılabilir parçalar (FlashCard, Badge, ProgressBar…)
  data/        → JSON kelime veritabanları
  hooks/       → custom React hooks (useProgress, useProfile…)
  utils/       → yardımcı fonksiyonlar
docs/          → mimari kararlar, yol haritası, kelime listesi planı
```

## Ses sistemi
- TTS (seslendirme): Web Speech API — `speechSynthesis` (sıfır maliyet, tarayıcı built-in)
- STT (sesli cevap): Web Speech API — `SpeechRecognition` (sıfır maliyet, Chrome/Edge)
- Dil kodları: İngilizce=en-GB, Almanca=de-DE, İspanyolca=es-ES
- Tüm ses işlemleri `src/hooks/useSpeech.js` hook'unda toplanacak

## Geliştirme komutları
- Çalıştır: `npm run dev`
- Build: `npm run build`
- Önizleme: `npm run preview`

## Tasarım kuralları
- Font: Fredoka One (başlıklar) + Nunito (metin)
- Renkler: forest-800 (#085041) ana, forest-400 (#1D9E75) vurgu, amber turuncu ikincil
- Hedef kitle çocuk — büyük tıklama alanları, net geri bildirim, emoji ağırlıklı
- Tailwind sınıfları kullan, inline style YAZMA

## Veri modeli (JSON)
Her kelime dosyası: `src/data/{kategori}-a{seviye}.json`
Yapı: `{ category, level, translations: { en/de/es: { label, flag, words: [{id, emoji, word, tr, pron}] } } }`

## Mevcut durum
→ Detay için: @docs/roadmap.md

## Önemli kural
Yeni bir sayfa eklerken önce `src/pages/` altına koy.
Bileşen 2+ sayfada kullanılacaksa `src/components/` a taşı.