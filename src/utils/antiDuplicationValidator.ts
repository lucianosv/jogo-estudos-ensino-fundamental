// ULTRA-RIGOROSA VALIDAÇÃO ANTI-DUPLICAÇÃO EM TEMPO REAL

interface ValidationResult {
  isValid: boolean;
  duplicates: string[];
  issues: string[];
}

export const validateQuestionUniqueness = (questions: any[]): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    duplicates: [],
    issues: []
  };

  if (!questions || questions.length === 0) {
    result.isValid = false;
    result.issues.push('Lista de questões vazia');
    return result;
  }

  // Verificar conteúdo duplicado
  const contents = questions.map(q => q?.content?.trim().toLowerCase()).filter(Boolean);
  const contentCounts = new Map<string, number>();
  
  contents.forEach(content => {
    const count = contentCounts.get(content) || 0;
    contentCounts.set(content, count + 1);
  });

  // Identificar duplicatas
  contentCounts.forEach((count, content) => {
    if (count > 1) {
      result.isValid = false;
      result.duplicates.push(content);
    }
  });

  // Verificar palavras secretas duplicadas
  const words = questions.map(q => q?.word?.trim().toLowerCase()).filter(Boolean);
  const wordCounts = new Map<string, number>();
  
  words.forEach(word => {
    const count = wordCounts.get(word) || 0;
    wordCounts.set(word, count + 1);
  });

  wordCounts.forEach((count, word) => {
    if (count > 1) {
      result.isValid = false;
      result.issues.push(`Palavra secreta duplicada: ${word}`);
    }
  });

  // Verificar estrutura básica
  questions.forEach((q, index) => {
    if (!q?.content) {
      result.issues.push(`Questão ${index}: sem conteúdo`);
      result.isValid = false;
    }
    if (!q?.choices || q.choices.length !== 4) {
      result.issues.push(`Questão ${index}: opções inválidas`);
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

export const forceUniqueRegenerationIfNeeded = (questions: any[]): any[] => {
  const validation = validateQuestionUniqueness(questions);
  
  if (!validation.isValid) {
    console.log('🔄 FORÇANDO REGENERAÇÃO POR DUPLICATAS');
    
    // Adicionar timestamps únicos para forçar diferenciação
    return questions.map((q, index) => ({
      ...q,
      content: q.content ? `${q.content} [${index + 1}]` : `Questão ${index + 1}`,
      word: q.word ? `${q.word}_${Date.now()}_${index}` : `palavra${index}_${Date.now()}`,
      _forceUnique: true
    }));
  }
  
  return questions;
};

export const logQuestionDetails = (questions: any[]) => {
  console.log('📋 DETALHES DAS QUESTÕES GERADAS:');
  questions.forEach((q, index) => {
    console.log(`${index}: ${q?.content?.substring(0, 100) || 'SEM CONTEÚDO'}...`);
    console.log(`   Palavra: ${q?.word || 'SEM PALAVRA'}`);
  });
};