export interface PartyTheme {
  id: string
  name: string
  emoji: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    gradient: string
    text: string
    textLight: string
  }
  icon?: string
}

export const partyThemes: Record<string, PartyTheme> = {
  classic: {
    id: 'classic',
    name: 'Classic Party',
    emoji: '🎉',
    description: 'Purple and pink gradient - perfect for any celebration',
    colors: {
      primary: '#9333ea', // purple-600
      secondary: '#ec4899', // pink-500
      accent: '#f97316', // orange-500
      gradient: 'from-purple-500 via-pink-500 to-orange-500',
      text: '#1f2937', // gray-800
      textLight: '#6b7280', // gray-500
    },
  },
  birthday: {
    id: 'birthday',
    name: 'Birthday Bash',
    emoji: '🎂',
    description: 'Bright and cheerful with balloons and cake vibes',
    colors: {
      primary: '#f59e0b', // amber-500
      secondary: '#ec4899', // pink-500
      accent: '#8b5cf6', // violet-500
      gradient: 'from-amber-400 via-pink-500 to-violet-500',
      text: '#1f2937',
      textLight: '#6b7280',
    },
  },
  wedding: {
    id: 'wedding',
    name: 'Elegant Wedding',
    emoji: '💒',
    description: 'Sophisticated rose gold and ivory tones',
    colors: {
      primary: '#be185d', // pink-700
      secondary: '#9f1239', // rose-800
      accent: '#f9a8d4', // pink-300
      gradient: 'from-rose-400 via-pink-500 to-rose-600',
      text: '#1f2937',
      textLight: '#6b7280',
    },
  },
  babyShower: {
    id: 'babyShower',
    name: 'Baby Shower',
    emoji: '👶',
    description: 'Soft pastels for welcoming baby',
    colors: {
      primary: '#3b82f6', // blue-500
      secondary: '#ec4899', // pink-500
      accent: '#a78bfa', // violet-400
      gradient: 'from-blue-300 via-pink-300 to-purple-300',
      text: '#1f2937',
      textLight: '#6b7280',
    },
  },
  graduation: {
    id: 'graduation',
    name: 'Graduation Party',
    emoji: '🎓',
    description: 'Bold and proud - celebrate achievements',
    colors: {
      primary: '#1e40af', // blue-800
      secondary: '#ca8a04', // yellow-600
      accent: '#ffffff',
      gradient: 'from-blue-600 via-indigo-600 to-blue-800',
      text: '#1f2937',
      textLight: '#6b7280',
    },
  },
  halloween: {
    id: 'halloween',
    name: 'Halloween',
    emoji: '🎃',
    description: 'Spooky orange and black theme',
    colors: {
      primary: '#ea580c', // orange-600
      secondary: '#1f2937', // gray-800
      accent: '#8b5cf6', // violet-500
      gradient: 'from-orange-600 via-gray-800 to-orange-700',
      text: '#1f2937',
      textLight: '#6b7280',
    },
  },
  christmas: {
    id: 'christmas',
    name: 'Christmas',
    emoji: '🎄',
    description: 'Festive red and green holiday spirit',
    colors: {
      primary: '#dc2626', // red-600
      secondary: '#16a34a', // green-600
      accent: '#fbbf24', // yellow-400
      gradient: 'from-red-600 via-green-600 to-red-700',
      text: '#1f2937',
      textLight: '#6b7280',
    },
  },
  newyear: {
    id: 'newyear',
    name: 'New Year',
    emoji: '🎊',
    description: 'Sparkly gold and silver celebration',
    colors: {
      primary: '#eab308', // yellow-500
      secondary: '#6b7280', // gray-500
      accent: '#f59e0b', // amber-500
      gradient: 'from-yellow-400 via-amber-500 to-yellow-600',
      text: '#1f2937',
      textLight: '#6b7280',
    },
  },
  summer: {
    id: 'summer',
    name: 'Summer Party',
    emoji: '🌞',
    description: 'Bright tropical vibes',
    colors: {
      primary: '#06b6d4', // cyan-500
      secondary: '#f59e0b', // amber-500
      accent: '#ec4899', // pink-500
      gradient: 'from-cyan-400 via-yellow-400 to-orange-500',
      text: '#1f2937',
      textLight: '#6b7280',
    },
  },
  garden: {
    id: 'garden',
    name: 'Garden Party',
    emoji: '🌸',
    description: 'Fresh florals and spring colors',
    colors: {
      primary: '#10b981', // green-500
      secondary: '#ec4899', // pink-500
      accent: '#f59e0b', // amber-500
      gradient: 'from-green-400 via-emerald-500 to-teal-500',
      text: '#1f2937',
      textLight: '#6b7280',
    },
  },
}

export function getTheme(themeId: string): PartyTheme {
  return partyThemes[themeId] || partyThemes.classic
}
