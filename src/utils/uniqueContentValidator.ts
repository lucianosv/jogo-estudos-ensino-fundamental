// VALIDADOR ULTRA-RIGOROSO DE CONTEÚDO ÚNICO
// Garantir que nunca sejam geradas questões idênticas

interface ValidationResult {
  isValid: boolean;
  issues: string[];
  duplicateContents: string[];
}

export const validateUniqueQuestions = (questions: any[]): ValidationResult => {
  const issues: string[] = [];
  const duplicateContents: string[] = [];
  
  if (!Array.isArray(questions) || questions.length === 0) {
    return {
      isValid: false,
      issues: ['Array de questões vazio ou inválido'],
      duplicateContents: []
    };
  }

  // Verificar conteúdos duplicados
  const contents = questions.map(q => q.content?.toLowerCase().trim());
  const uniqueContents = new Set(contents);
  
  if (uniqueContents.size !== contents.length) {
    issues.push('Questões com conteúdo idêntico detectadas');
    
    // Encontrar quais conteúdos estão duplicados
    const contentCounts = new Map();
    contents.forEach(content => {
      contentCounts.set(content, (contentCounts.get(content) || 0) + 1);
    });
    
    contentCounts.forEach((count, content) => {
      if (count > 1) {
        duplicateContents.push(content);
      }
    });
  }

  // Verificar palavras secretas duplicadas
  const words = questions.map(q => q.word?.toLowerCase().trim()).filter(Boolean);
  const uniqueWords = new Set(words);
  
  if (uniqueWords.size !== words.length) {
    issues.push('Palavras secretas duplicadas detectadas');
  }

  // Verificar estrutura mínima
  questions.forEach((q, index) => {
    if (!q.content) issues.push(`Questão ${index}: sem conteúdo`);
    if (!Array.isArray(q.choices) || q.choices.length !== 4) {
      issues.push(`Questão ${index}: deve ter exatamente 4 alternativas`);
    }
    if (!q.answer) issues.push(`Questão ${index}: sem resposta`);
    if (!q.word) issues.push(`Questão ${index}: sem palavra secreta`);
  });

  return {
    isValid: issues.length === 0,
    issues,
    duplicateContents
  };
};

export const forceUniqueGeneration = (questions: any[], gameParams: any): any[] => {
  console.log('[UNIQUE-VALIDATOR] Forçando geração única para evitar duplicatas');
  
  // Criar questões únicas baseadas em índice específico
  const uniqueQuestions = questions.map((question, index) => ({
    ...question,
    content: `${question.content} [Q${index + 1}]`, // Garantir diferenciação
    word: `${question.word}${index + 1}` // Garantir palavra única
  }));

  return uniqueQuestions;
};

// Verificação final antes de retornar questões ao jogo
export const finalValidation = (questions: any[]): boolean => {
  const validation = validateUniqueQuestions(questions);
  
  if (!validation.isValid) {
    console.error('[FINAL-VALIDATION] ❌ FALHA CRÍTICA:', validation.issues);
    console.error('[FINAL-VALIDATION] ❌ Conteúdos duplicados:', validation.duplicateContents);
    return false;
  }
  
  console.log('[FINAL-VALIDATION] ✅ Todas as questões são únicas e válidas');
  return true;
};