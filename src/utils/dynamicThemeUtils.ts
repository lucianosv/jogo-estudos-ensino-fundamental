import { GameParameters } from "@/components/GameSetup";

export interface DynamicTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    gradient: string;
    border: string;
    button: string;
    buttonHover: string;
  };
  backgrounds: {
    left: string;
    right: string;
    bottom: string;
    pattern: string;
  };
  icons: {
    subject: string;
    challenge: string;
    success: string;
  };
  terminology: {
    challenge: string;
    quest: string;
    reward: string;
  };
}

const subjectThemes: Record<string, DynamicTheme> = {
  'Matemática': {
    colors: {
      primary: 'blue-600',
      secondary: 'indigo-500',
      accent: 'cyan-400',
      gradient: 'from-blue-600 via-indigo-500 to-purple-600',
      border: 'border-blue-400',
      button: 'bg-blue-600 text-white hover:bg-blue-700',
      buttonHover: 'hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700'
    },
    backgrounds: {
      left: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400',
      right: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=400',
      bottom: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800',
      pattern: 'geometric'
    },
    icons: {
      subject: '🔢',
      challenge: '⚡',
      success: '🎯'
    },
    terminology: {
      challenge: 'Desafio Matemático',
      quest: 'Aventura Numérica',
      reward: 'Fórmula Secreta'
    }
  },
  'História': {
    colors: {
      primary: 'amber-700',
      secondary: 'yellow-600',
      accent: 'orange-400',
      gradient: 'from-amber-700 via-yellow-600 to-orange-500',
      border: 'border-amber-400',
      button: 'bg-amber-700 text-white hover:bg-amber-800',
      buttonHover: 'hover:bg-amber-50 hover:border-amber-400 hover:text-amber-700'
    },
    backgrounds: {
      left: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400',
      right: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400',
      bottom: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      pattern: 'ancient'
    },
    icons: {
      subject: '📜',
      challenge: '⚔️',
      success: '👑'
    },
    terminology: {
      challenge: 'Desafio Histórico',
      quest: 'Jornada no Tempo',
      reward: 'Relíquia Antiga'
    }
  },
  'Ciências': {
    colors: {
      primary: 'green-600',
      secondary: 'emerald-500',
      accent: 'teal-400',
      gradient: 'from-green-600 via-emerald-500 to-teal-500',
      border: 'border-green-400',
      button: 'bg-green-600 text-white hover:bg-green-700',
      buttonHover: 'hover:bg-green-50 hover:border-green-400 hover:text-green-700'
    },
    backgrounds: {
      left: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      right: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400',
      bottom: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800',
      pattern: 'molecular'
    },
    icons: {
      subject: '🔬',
      challenge: '🧪',
      success: '🌟'
    },
    terminology: {
      challenge: 'Experimento Científico',
      quest: 'Expedição Científica',
      reward: 'Descoberta'
    }
  },
  'Português': {
    colors: {
      primary: 'purple-600',
      secondary: 'violet-500',
      accent: 'pink-400',
      gradient: 'from-purple-600 via-violet-500 to-pink-500',
      border: 'border-purple-400',
      button: 'bg-purple-600 text-white hover:bg-purple-700',
      buttonHover: 'hover:bg-purple-50 hover:border-purple-400 hover:text-purple-700'
    },
    backgrounds: {
      left: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
      right: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      bottom: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      pattern: 'literary'
    },
    icons: {
      subject: '📚',
      challenge: '✍️',
      success: '🏆'
    },
    terminology: {
      challenge: 'Desafio Literário',
      quest: 'Aventura das Palavras',
      reward: 'Verso Secreto'
    }
  },
  'Geografia': {
    colors: {
      primary: 'red-600',
      secondary: 'orange-500',
      accent: 'yellow-400',
      gradient: 'from-red-600 via-orange-500 to-yellow-500',
      border: 'border-red-400',
      button: 'bg-red-600 text-white hover:bg-red-700',
      buttonHover: 'hover:bg-red-50 hover:border-red-400 hover:text-red-700'
    },
    backgrounds: {
      left: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      right: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
      bottom: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
      pattern: 'geographic'
    },
    icons: {
      subject: '🌍',
      challenge: '🗺️',
      success: '🧭'
    },
    terminology: {
      challenge: 'Desafio Geográfico',
      quest: 'Exploração Mundial',
      reward: 'Coordenada Secreta'
    }
  }
};

export const getDynamicTheme = (gameParams: GameParameters): DynamicTheme => {
  const baseTheme = subjectThemes[gameParams.subject] || subjectThemes['Matemática'];
  
  // Se for Demon Slayer, manter as cores originais mas adaptar terminologia
  if (gameParams.theme.includes('Demon Slayer') || gameParams.theme.includes('Tanjiro') || 
      gameParams.theme.includes('Nezuko') || gameParams.theme.includes('Zenitsu') || 
      gameParams.theme.includes('Inosuke')) {
    return {
      ...baseTheme,
      terminology: {
        challenge: 'Desafio dos Caçadores',
        quest: 'Missão de Caçador',
        reward: 'Técnica Secreta'
      }
    };
  }

  return baseTheme;
};

export const getDifficultyLevel = (schoolGrade: string): 'easy' | 'medium' | 'hard' => {
  const grade = parseInt(schoolGrade.charAt(0));
  if (grade >= 1 && grade <= 3) return 'easy';
  if (grade >= 4 && grade <= 6) return 'medium';
  if (grade >= 7 && grade <= 9) return 'hard';
  return 'medium';
};

export const getSubjectIcon = (subject: string): string => {
  const theme = subjectThemes[subject];
  return theme ? theme.icons.subject : '📖';
};
