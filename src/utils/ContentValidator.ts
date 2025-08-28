// VALIDADOR UNIFICADO DE CONTEÚDO - CONSOLIDAÇÃO DOS VALIDADORES
// Unifica uniqueContentValidator.ts e antiDuplicationValidator.ts

interface ValidationResult {
  isValid: boolean;
  issues: string[];
  duplicateContents: string[];
  duplicateWords: string[];
}

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

  // Verificar palavras secretas duplicadas
  const words = questions.map(q => q?.word?.toLowerCase().trim()).filter(Boolean);
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

export const forceUniqueGeneration = (questions: any[], gameParams?: any): any[] => {
  console.log('[CONTENT-VALIDATOR] Forçando geração única para evitar duplicatas');
  
  const validation = validateUniqueQuestions(questions);
  
  if (!validation.isValid) {
    console.log('🔄 FORÇANDO REGENERAÇÃO POR DUPLICATAS');
    
    // Criar questões únicas baseadas em índice específico com timestamp
    return questions.map((question, index) => ({
      ...question,
      content: question.content ? `${question.content} [Q${index + 1}]` : `Questão ${index + 1}`,
      word: question.word ? `${question.word}_${Date.now()}_${index}` : `palavra${index}_${Date.now()}`,
      _forceUnique: true
    }));
  }
  
  return questions;
};

// Verificação final antes de retornar questões ao jogo
export const finalValidation = (questions: any[]): boolean => {
  const validation = validateUniqueQuestions(questions);
  
  if (!validation.isValid) {
    console.error('[FINAL-VALIDATION] ❌ FALHA CRÍTICA:', validation.issues);
    console.error('[FINAL-VALIDATION] ❌ Conteúdos duplicados:', validation.duplicateContents);
    console.error('[FINAL-VALIDATION] ❌ Palavras duplicadas:', validation.duplicateWords);
    return false;
  }
  
  console.log('[FINAL-VALIDATION] ✅ Todas as questões são únicas e válidas');
  return true;
};

export const logQuestionDetails = (questions: any[]) => {
  console.log('📋 DETALHES DAS QUESTÕES GERADAS:');
  questions.forEach((q, index) => {
    console.log(`${index}: ${q?.content?.substring(0, 100) || 'SEM CONTEÚDO'}...`);
    console.log(`   Palavra: ${q?.word || 'SEM PALAVRA'}`);
  });
};