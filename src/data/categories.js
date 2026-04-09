import animalsData     from './animals-a1.json'
import colorsData      from './colors-a1.json'
import numbersData     from './numbers-a1.json'
import fruitsData      from './fruits-a1.json'
import bodyData        from './body-a1.json'
import familyData      from './family-a1.json'
import schoolData      from './school-a1.json'
import foodData        from './food-a1.json'
import greetingsData   from './greetings-a1.json'
import questionsData   from './questions-a1.json'
import vegetablesData  from './vegetables-a1.json'
import clothingData    from './clothing-a1.json'
import homeData        from './home-a1.json'
import transportData   from './transport-a1.json'
import timeData        from './time-a1.json'
import jobsData        from './jobs-a1.json'
import sportsData      from './sports-a1.json'
import placesData      from './places-a1.json'
import adjectivesData  from './adjectives-a1.json'
import verbsData       from './verbs-a1.json'

export const CATEGORIES = [
  { id: 'animals',    icon: '🐾', label: 'Hayvanlar',    color: 'bg-green-100   border-green-400',   data: animalsData    },
  { id: 'colors',     icon: '🎨', label: 'Renkler',      color: 'bg-pink-100    border-pink-400',    data: colorsData     },
  { id: 'numbers',    icon: '🔢', label: 'Sayılar',      color: 'bg-blue-100    border-blue-400',    data: numbersData    },
  { id: 'fruits',     icon: '🍎', label: 'Meyveler',     color: 'bg-red-100     border-red-400',     data: fruitsData     },
  { id: 'vegetables', icon: '🥕', label: 'Sebzeler',     color: 'bg-lime-100    border-lime-400',    data: vegetablesData },
  { id: 'body',       icon: '🫀', label: 'Vücut',        color: 'bg-orange-100  border-orange-400',  data: bodyData       },
  { id: 'family',     icon: '👨‍👩‍👧', label: 'Aile',         color: 'bg-purple-100  border-purple-400',  data: familyData     },
  { id: 'school',     icon: '🏫', label: 'Okul',         color: 'bg-yellow-100  border-yellow-400',  data: schoolData     },
  { id: 'food',       icon: '🍕', label: 'Yiyecekler',   color: 'bg-amber-100   border-amber-400',   data: foodData       },
  { id: 'greetings',  icon: '👋', label: 'Selamlaşma',   color: 'bg-teal-100    border-teal-400',    data: greetingsData  },
  { id: 'questions',  icon: '❓', label: 'Sorular',      color: 'bg-indigo-100  border-indigo-400',  data: questionsData  },
  { id: 'clothing',   icon: '👗', label: 'Kıyafetler',   color: 'bg-violet-100  border-violet-400',  data: clothingData   },
  { id: 'home',       icon: '🏠', label: 'Ev',           color: 'bg-stone-100   border-stone-400',   data: homeData       },
  { id: 'transport',  icon: '🚗', label: 'Ulaşım',       color: 'bg-sky-100     border-sky-400',     data: transportData  },
  { id: 'time',       icon: '⏰', label: 'Zaman',        color: 'bg-cyan-100    border-cyan-400',    data: timeData       },
  { id: 'jobs',       icon: '👷', label: 'Meslekler',    color: 'bg-emerald-100 border-emerald-400', data: jobsData       },
  { id: 'sports',     icon: '⚽', label: 'Sporlar',      color: 'bg-rose-100    border-rose-400',    data: sportsData     },
  { id: 'places',     icon: '🏙️', label: 'Yerler',       color: 'bg-fuchsia-100 border-fuchsia-400', data: placesData     },
  { id: 'adjectives', icon: '🌈', label: 'Sıfatlar',     color: 'bg-orange-100  border-orange-400',  data: adjectivesData },
  { id: 'verbs',      icon: '⚡', label: 'Fiiller',      color: 'bg-red-100     border-red-400',     data: verbsData      },
]

export function getCategoryData(categoryId) {
  return CATEGORIES.find(c => c.id === categoryId)?.data ?? animalsData
}
