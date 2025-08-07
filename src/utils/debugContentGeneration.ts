// FERRAMENTA DE DEBUG PARA TESTAR GERAÇÃO DE CONTEÚDO ÚNICO
import { GameParameters } from "@/components/GameSetup";
import { generateIntelligentFallback } from "@/utils/intelligentFallbacks";
import { getExpandedGranularFallback } from "@/utils/expandedGranularFallbacks";
import { getRomaQuestionByIndex } from "@/utils/expandedRomaFallbacks";
import { validateUniqueQuestions } from "@/utils/uniqueContentValidator";

// Teste específico para História - Roma Antiga - 6º ano
export const testRomaAntiga6Ano = () => {
  console.log('🧪 TESTANDO: História → Roma Antiga → 6º ano');
  
  const gameParams: GameParameters = {
    subject: 'História',
    theme: 'Roma Antiga',
    schoolGrade: '6º ano',
    themeDetails: ''
  };

  const questions = [];
  
  // Testar geração de 4 questões com índices diferentes
  for (let i = 0; i < 4; i++) {
    console.log(`\n📝 TESTANDO QUESTÃO ${i + 1}:`);
    
    // Teste 1: Fallback Roma específico
    const romaQuestion = getRomaQuestionByIndex('6º ano', i);
    console.log(`Roma específica: ${romaQuestion.content.substring(0, 50)}...`);
    
    // Teste 2: Fallback expandido granular
    const expandedQuestion = getExpandedGranularFallback(gameParams, 'question', i);
    console.log(`Expandido granular: ${expandedQuestion ? JSON.stringify(expandedQuestion).substring(0, 50) : 'null'}...`);
    
    // Teste 3: Fallback inteligente
    const intelligentQuestion = generateIntelligentFallback(gameParams, 'question', i);
    console.log(`Inteligente: ${intelligentQuestion?.content?.substring(0, 50)}...`);
    
    questions.push(romaQuestion);
  }
  
  // Validar que todas são únicas
  const validation = validateUniqueQuestions(questions);
  console.log(`\n✅ RESULTADO DA VALIDAÇÃO:`, validation);
  
  if (validation.isValid) {
    console.log('🎉 SUCESSO: Todas as 4 questões são únicas!');
  } else {
    console.error('❌ FALHA: Questões duplicadas detectadas:', validation.duplicateContents);
  }
  
  return questions;
};

// Teste completo do sistema
export const testCompleteSystem = () => {
  console.log('🚀 TESTE COMPLETO DO SISTEMA DE GERAÇÃO DE CONTEÚDO ÚNICO');
  
  const scenarios: GameParameters[] = [
    { subject: 'História', theme: 'Roma Antiga', schoolGrade: '6º ano', themeDetails: '' },
    { subject: 'Ciências', theme: 'Corpo Humano', schoolGrade: '6º ano', themeDetails: '' },
    { subject: 'Ciências', theme: 'Sistema Solar', schoolGrade: '3º ano', themeDetails: '' },
    { subject: 'Matemática', theme: 'Multiplicação', schoolGrade: '4º ano', themeDetails: '' }
  ];
  
  scenarios.forEach((scenario, index) => {
    console.log(`\n📋 CENÁRIO ${index + 1}: ${scenario.subject} → ${scenario.theme} → ${scenario.schoolGrade}`);
    
    const questions = [];
    for (let i = 0; i < 4; i++) {
      const question = generateIntelligentFallback(scenario, 'question', i);
      if (question) questions.push(question);
    }
    
    const validation = validateUniqueQuestions(questions);
    console.log(`Resultado: ${validation.isValid ? '✅ APROVADO' : '❌ REPROVADO'}`);
    
    if (!validation.isValid) {
      console.error(`Problemas: ${validation.issues.join(', ')}`);
    }
  });
};