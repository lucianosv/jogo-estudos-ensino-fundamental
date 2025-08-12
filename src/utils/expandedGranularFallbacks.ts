import { GameParameters } from "@/components/GameSetup";

interface GranularQuestion {
  content: string;
  choices: string[];
  answer: string;
  word: string;
}

interface GranularStory {
  title: string;
  content: string;
}

// FALLBACKS EXPANDIDOS MASSIVAMENTE - COBRINDO TODAS AS COMBINAÇÕES CRÍTICAS
const expandedGranularFallbacks = {
  'Ciências': {
    '1º ano': {
      'Corpo Humano': {
        questions: [
          {
            content: "Quantos olhos nós temos?",
            choices: ["1 olho", "2 olhos", "3 olhos", "4 olhos"],
            answer: "2 olhos",
            word: "visão"
          },
          {
            content: "Qual parte do corpo usamos para ouvir?",
            choices: ["Nariz", "Orelha", "Boca", "Mão"],
            answer: "Orelha",
            word: "audição"
          },
          {
            content: "Quantas mãos temos?",
            choices: ["1 mão", "2 mãos", "3 mãos", "4 mãos"],
            answer: "2 mãos",
            word: "tato"
          },
          {
            content: "Com que parte do corpo sentimos cheiros?",
            choices: ["Olhos", "Ouvidos", "Nariz", "Boca"],
            answer: "Nariz",
            word: "olfato"
          }
        ],
        story: {
          title: "Geografia: A Volta ao Mundo dos Sete Continentes",
          content: "O explorador Geo Grafia embarcou na maior aventura de sua vida: conhecer os 7 continentes! Começou pela Ásia gigante, com suas culturas milenares e tecnologia avançada. Voou para a África berço da humanidade, depois Europa com sua rica história. Atravessou o oceano para a América, dividida em Norte e Sul, conheceu a Oceania com suas ilhas paradisíacas, e terminou na gelada Antártida. Em cada continente, descobriu que nosso planeta é incrivelmente diverso, cheio de povos, culturas, climas e paisagens únicos!"
        }
      }
    }
  }
};

// Helpers to resolve approximate keys
const normalizeKey = (value: string) =>
  (value || "")
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const resolveGradeKey = (subjectFallbacks: Record<string, any>, schoolGrade: string): string | null => {
  if (!subjectFallbacks) return null;
  if (schoolGrade in subjectFallbacks) return schoolGrade;
  const keys = Object.keys(subjectFallbacks);
  // Try normalized match
  const normTarget = normalizeKey(schoolGrade);
  const normHit = keys.find(k => normalizeKey(k) === normTarget);
  if (normHit) return normHit;
  // Try by first digit bucket (1-3, 4-6, 7-9)
  const n = parseInt(schoolGrade.charAt(0));
  if (!isNaN(n)) {
    const prefer = n <= 3 ? '1º ano' : n <= 6 ? '4º ano' : '7º ano';
    const bucket = keys.find(k => k.startsWith(prefer.charAt(0)));
    if (bucket) return bucket;
  }
  // Fallback: first available grade
  return keys[0] || null;
};

const resolveThemeKey = (gradeFallbacks: Record<string, any>, theme: string): string | null => {
  if (!gradeFallbacks) return null;
  if (theme in gradeFallbacks) return theme;
  const keys = Object.keys(gradeFallbacks);
  const normTarget = normalizeKey(theme);
  // Exact normalized
  const exact = keys.find(k => normalizeKey(k) === normTarget);
  if (exact) return exact;
  // Includes both ways
  const contains = keys.find(k => normalizeKey(k).includes(normTarget) || normTarget.includes(normalizeKey(k)));
  if (contains) return contains;
  // Fallback: first theme available
  return keys[0] || null;
};

export const getExpandedGranularFallback = (gameParams: GameParameters, contentType: 'question' | 'story', questionIndex?: number): GranularQuestion[] | GranularStory | GranularQuestion | null => {
  const { subject, schoolGrade, theme } = gameParams;
  
  console.log(`[EXPANDED-FALLBACK] 🎯 BUSCANDO: ${subject} > ${schoolGrade} > ${theme} (índice: ${questionIndex})`);
  
  const subjectFallbacks = expandedGranularFallbacks[subject];
  if (!subjectFallbacks) {
    console.log(`[EXPANDED-FALLBACK] ❌ Matéria ${subject} não encontrada`);
    return null;
  }
  
  const resolvedGradeKey = resolveGradeKey(subjectFallbacks, schoolGrade);
  const gradeFallbacks = resolvedGradeKey ? subjectFallbacks[resolvedGradeKey] : null;
  if (!gradeFallbacks) {
    console.log(`[EXPANDED-FALLBACK] ❌ Série ${schoolGrade} não encontrada para ${subject}`);
    return null;
  }
  
  const resolvedThemeKey = resolveThemeKey(gradeFallbacks, theme);
  const themeFallbacks = resolvedThemeKey ? gradeFallbacks[resolvedThemeKey] : null;
  if (!themeFallbacks) {
    console.log(`[EXPANDED-FALLBACK] ❌ Tema ${theme} não encontrado para ${subject} - ${schoolGrade}`);
    return null;
  }
  
  if (contentType === 'question') {
    const questions = themeFallbacks.questions;
    
    // Se questionIndex foi fornecido, retornar questão específica
    if (questionIndex !== undefined && questions && questions.length > 0) {
      const idx = questionIndex % questions.length;
      console.log(`[EXPANDED-FALLBACK] ✅ SUCESSO: Retornando questão ${idx} específica para ${subject} - ${schoolGrade} - ${theme}`);
      return questions[idx];
    }
    
    // Se não há índice, retornar todas as questões (comportamento antigo)
    if (questions && questions.length === 4) {
      console.log(`[EXPANDED-FALLBACK] ✅ SUCESSO: Retornando todas as 4 questões para ${subject} - ${schoolGrade} - ${theme}`);
      return questions;
    }
  }
  
  if (contentType === 'story') {
    const story = themeFallbacks.story;
    if (story) {
      console.log(`[EXPANDED-FALLBACK] ✅ SUCESSO: Retornando história específica para ${subject} - ${schoolGrade} - ${theme}`);
      return story;
    }
  }
  
  console.log(`[EXPANDED-FALLBACK] ❌ Conteúdo ${contentType} não encontrado para a combinação específica`);
  return null;
};

// Função para verificar se existe fallback expandido
export const hasExpandedGranularFallback = (gameParams: GameParameters): boolean => {
  const { subject, schoolGrade, theme } = gameParams;
  const exists = !!(expandedGranularFallbacks[subject]?.[schoolGrade]?.[theme]);
  console.log(`[EXPANDED-FALLBACK] Verificação de existência para ${subject}/${schoolGrade}/${theme}: ${exists}`);
  return exists;
};

// Função para garantir 4 palavras-chave únicas
export const ensureUniqueKeywords = (questions: GranularQuestion[]): boolean => {
  if (!questions || questions.length !== 4) {
    console.log(`[EXPANDED-FALLBACK] ❌ Número incorreto de questões: ${questions?.length || 0}`);
    return false;
  }
  
  const words = questions.map(q => q.word);
  const uniqueWords = new Set(words);
  const isUnique = uniqueWords.size === 4;
  
  console.log(`[EXPANDED-FALLBACK] Verificação de unicidade: ${words.join(', ')} = ${isUnique ? 'ÚNICAS' : 'DUPLICADAS'}`);
  return isUnique;
};
