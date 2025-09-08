// VALIDADOR UNIFICADO - BACKEND E FRONTEND CONSISTENTES
// Substitui tanto src/utils/ContentValidator.ts quanto supabase/.../contentValidator.ts

import { getDisplayWord } from '@/utils/wordCleaner';

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  duplicateContents: string[];
  duplicateWords: string[];
}

// Validação de conteúdo única para backend e frontend
export const validateContent = (content: any, subject: string, theme: string): boolean => {
  if (!content) return false;
  
  const contentStr = JSON.stringify(content).toLowerCase();
  const themeLower = theme.toLowerCase();
  const subjectLower = subject.toLowerCase();
  
  console.log(`[UNIFIED-VALIDATOR] Analisando: ${subject} - ${theme}`);
  
  // VALIDAÇÃO DEMON SLAYER CONTEXTUAL
  const isDemonSlayerTheme = themeLower.includes('demon slayer') || 
                             themeLower.includes('tanjiro') || 
                             themeLower.includes('nezuko') || 
                             themeLower.includes('zenitsu') || 
                             themeLower.includes('inosuke');
  
  // Permitir demônios apenas em contexto Demon Slayer ou fantasia
  if (contentStr.includes('demônio') || contentStr.includes('demons')) {
    if (!isDemonSlayerTheme && !themeLower.includes('anime') && !themeLower.includes('fantasia') && !themeLower.includes('mitologia')) {
      console.log(`[UNIFIED-VALIDATOR] ❌ REJEITADO: Demônios fora de contexto apropriado`);
      return false;
    }
  }
  
  // ANTI-TEMPLATE RIGOROSO
  const mathTemplatePatterns = [
    'estava caminhando pela floresta',
    'encontrou um grupo de demônios',
    'quantos demônios',
    'quantos golpes',
    'para derrotá-los',
    'precisava calcular',
    'se derrotou 3',
    'pela manhã e 5 à tarde',
    'quantos derrotou no total'
  ];
  
  const hasMathTemplate = mathTemplatePatterns.some(pattern => 
    contentStr.includes(pattern)
  );
  
  if (hasMathTemplate) {
    console.log(`[UNIFIED-VALIDATOR] ❌ REJEITADO: Template matemático inadequado`);
    return false;
  }
  
  // VALIDAÇÃO ESPECÍFICA POR MATÉRIA
  if (subjectLower !== 'matemática') {
    if (contentStr.includes('quanto é') && (contentStr.includes(' + ') || contentStr.includes(' - ') || contentStr.includes(' x ') || contentStr.includes(' ÷ '))) {
      console.log(`[UNIFIED-VALIDATOR] ❌ REJEITADO: ${subject} com questão matemática inadequada`);
      return false;
    }
  }
  
  // VALIDAÇÃO CONTEÚDO EDUCATIVO
  const inappropriateWords = [
    'sangue', 'blood', 'morte', 'death', 'violência', 'violence',
    'matador', 'assassino', 'killer', 'luta', 'batalha', 'guerra'
  ];
  
  const hasInappropriateContent = inappropriateWords.some(word => 
    contentStr.includes(word)
  );
  
  if (hasInappropriateContent) {
    console.log(`[UNIFIED-VALIDATOR] ❌ REJEITADO: Conteúdo inadequado para educação`);
    return false;
  }
  
  console.log(`[UNIFIED-VALIDATOR] ✅ APROVADO: Conteúdo válido`);
  return true;
};

// Validação de unicidade de questões
export const validateUniqueQuestions = (questions: any[]): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    issues: [],
    duplicateContents: [],
    duplicateWords: []
  };

  if (!Array.isArray(questions) || questions.length === 0) {
    result.isValid = false;
    result.issues.push('Array de questões vazio ou inválido');
    return result;
  }

  // Verificar conteúdos duplicados
  const contents = questions.map(q => q?.content?.toLowerCase().trim()).filter(Boolean);
  const contentCounts = new Map<string, number>();
  
  contents.forEach(content => {
    const count = contentCounts.get(content) || 0;
    contentCounts.set(content, count + 1);
  });

  contentCounts.forEach((count, content) => {
    if (count > 1) {
      result.isValid = false;
      result.duplicateContents.push(content);
    }
  });

  // Verificar palavras secretas duplicadas (usando getDisplayWord)
  const words = questions.map(q => {
    if (!q?.word) return '';
    const cleanWord = getDisplayWord(q.word);
    return cleanWord?.toLowerCase().trim() || '';
  }).filter(Boolean);
  const wordCounts = new Map<string, number>();
  
  words.forEach(word => {
    const count = wordCounts.get(word) || 0;
    wordCounts.set(word, count + 1);
  });

  wordCounts.forEach((count, word) => {
    if (count > 1) {
      result.isValid = false;
      result.duplicateWords.push(word);
      result.issues.push(`Palavra secreta duplicada: ${word}`);
    }
  });

  // Verificar estrutura básica
  questions.forEach((q, index) => {
    if (!q?.content) {
      result.issues.push(`Questão ${index}: sem conteúdo`);
      result.isValid = false;
    }
    if (!Array.isArray(q?.choices) || q.choices.length !== 4) {
      result.issues.push(`Questão ${index}: deve ter exatamente 4 alternativas`);
      result.isValid = false;
    }
    if (!q?.answer) {
      result.issues.push(`Questão ${index}: sem resposta`);
      result.isValid = false;
    }
    if (!q?.word) {
      result.issues.push(`Questão ${index}: sem palavra secreta`);
      result.isValid = false;
    }
  });

  if (!result.isValid) {
    console.error('🚨 VALIDAÇÃO FALHOU:', result);
  } else {
    console.log('✅ VALIDAÇÃO PASSOU: Todas questões são únicas');
  }

  return result;
};

// Força geração única para evitar duplicatas
export const forceUniqueGeneration = (questions: any[], gameParams?: any): any[] => {
  console.log('[UNIFIED-VALIDATOR] Forçando geração única para evitar duplicatas');
  
  const validation = validateUniqueQuestions(questions);
  
  if (!validation.isValid) {
    console.log('🔄 FORÇANDO REGENERAÇÃO POR DUPLICATAS');
    
    return questions.map((question, index) => ({
      ...question,
      content: question.content ? `${question.content} [Q${index + 1}]` : `Questão ${index + 1}`,
      word: question.word || `palavra${index}`,
      _internalId: `${question.word || `palavra${index}`}_${Date.now()}_${index}`,
      _forceUnique: true
    }));
  }
  
  return questions;
};

// Validação final antes de retornar questões ao jogo
export const finalValidation = (questions: any[]): boolean => {
  const validation = validateUniqueQuestions(questions);
  
  if (!validation.isValid) {
    console.error('[UNIFIED-VALIDATOR] ❌ FALHA CRÍTICA:', validation.issues);
    return false;
  }
  
  console.log('[UNIFIED-VALIDATOR] ✅ Todas as questões são únicas e válidas');
  return true;
};

export const logQuestionDetails = (questions: any[]) => {
  console.log('📋 DETALHES DAS QUESTÕES GERADAS:');
  questions.forEach((q, index) => {
    console.log(`${index}: ${q?.content?.substring(0, 100) || 'SEM CONTEÚDO'}...`);
    console.log(`   Palavra: ${q?.word || 'SEM PALAVRA'}`);
  });
};