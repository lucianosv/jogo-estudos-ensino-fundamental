// SISTEMA UNIFICADO DE FALLBACKS HIERÁRQUICOS
// Substitui múltiplos arquivos de fallback por uma hierarquia organizada

import { GameParameters } from '@/components/GameSetup';
import { getGranularFallback } from '@/utils/granularFallbacks';
import { generateThematicFallback } from '@/utils/thematicFallbacks';
import { generateIntelligentFallback } from '@/utils/intelligentFallbacks';

export interface Question {
  content: string;
  choices: string[];
  answer: string;
  word: string;
  source?: string;
  id?: string;
}

export interface StoryData {
  title: string;
  content: string;
}

export type ContentType = 'question' | 'story' | 'character_info';

// HIERARQUIA ÚNICA DE FALLBACKS: Granular → Intelligent → Thematic → Emergency
export class UnifiedFallbackSystem {
  private static instance: UnifiedFallbackSystem;

  static getInstance(): UnifiedFallbackSystem {
    if (!UnifiedFallbackSystem.instance) {
      UnifiedFallbackSystem.instance = new UnifiedFallbackSystem();
    }
    return UnifiedFallbackSystem.instance;
  }

  // Gerar questão única seguindo hierarquia
  generateFallbackQuestion(gameParams: GameParameters, questionIndex: number = 0): Question {
    console.log(`[UNIFIED-FALLBACK] Gerando questão ${questionIndex} para ${gameParams.subject} - ${gameParams.theme}`);

    // NÍVEL 1: Granular (mais específico)
    const granularResult = getGranularFallback(gameParams, 'question');
    if (granularResult && Array.isArray(granularResult)) {
      const question = granularResult[questionIndex % granularResult.length];
      console.log(`[UNIFIED-FALLBACK] ✅ Usando fallback GRANULAR: ${question.content.substring(0, 50)}...`);
      return {
        ...question,
        source: 'granular',
        id: `granular_${questionIndex}_${Date.now()}`
      };
    }

    // NÍVEL 2: Intelligent (inteligente por matéria)
    const intelligentResult = generateIntelligentFallback(gameParams, 'question', questionIndex);
    if (intelligentResult?.question) {
      console.log(`[UNIFIED-FALLBACK] ✅ Usando fallback INTELLIGENT: ${intelligentResult.question.content.substring(0, 50)}...`);
      return {
        ...intelligentResult.question,
        source: 'intelligent',
        id: `intelligent_${questionIndex}_${Date.now()}`
      };
    }

    // NÍVEL 3: Thematic (por tema)
    const thematicResult = generateThematicFallback(gameParams);
    if (thematicResult) {
      console.log(`[UNIFIED-FALLBACK] ✅ Usando fallback THEMATIC: ${thematicResult.content.substring(0, 50)}...`);
      return {
        ...thematicResult,
        source: 'thematic',
        id: `thematic_${questionIndex}_${Date.now()}`
      };
    }

    // NÍVEL 4: Emergency (último recurso)
    console.log(`[UNIFIED-FALLBACK] ⚠️ Usando fallback EMERGENCY`);
    return this.generateEmergencyQuestion(gameParams, questionIndex);
  }

  // Gerar história seguindo hierarquia
  generateFallbackStory(gameParams: GameParameters): StoryData {
    console.log(`[UNIFIED-FALLBACK] Gerando história para ${gameParams.subject} - ${gameParams.theme}`);

    // NÍVEL 1: Granular
    const granularResult = getGranularFallback(gameParams, 'story') as StoryData;
    if (granularResult?.title && granularResult?.content) {
      console.log(`[UNIFIED-FALLBACK] ✅ Usando história GRANULAR: ${granularResult.title}`);
      return granularResult;
    }

    // NÍVEL 2: Intelligent
    const intelligentResult = generateIntelligentFallback(gameParams, 'story');
    if (intelligentResult?.story) {
      console.log(`[UNIFIED-FALLBACK] ✅ Usando história INTELLIGENT: ${intelligentResult.story.title}`);
      return intelligentResult.story;
    }

    // NÍVEL 3: Emergency
    console.log(`[UNIFIED-FALLBACK] ⚠️ Usando história EMERGENCY`);
    return this.generateEmergencyStory(gameParams);
  }

  // Questão de emergência (último recurso)
  private generateEmergencyQuestion(gameParams: GameParameters, questionIndex: number): Question {
    const { subject, schoolGrade, theme } = gameParams;
    
    const subjectChoices = {
      'História': ['Passado', 'Presente', 'Futuro', 'Memória'],
      'Ciências': ['Descoberta', 'Experimento', 'Natureza', 'Vida'],
      'Geografia': ['Lugar', 'Território', 'Paisagem', 'Região'],
      'Português': ['Palavra', 'Texto', 'Frase', 'Ideia'],
      'Matemática': ['Número', 'Cálculo', 'Resultado', 'Operação']
    };
    
    const choices = subjectChoices[subject as keyof typeof subjectChoices] || subjectChoices['Ciências'];
    
    return {
      content: `${subject} (${schoolGrade}): Questão ${questionIndex + 1} sobre ${theme}`,
      choices: choices,
      answer: choices[0],
      word: `emergency${questionIndex}_${Date.now()}`,
      source: 'emergency',
      id: `emergency_${questionIndex}_${Date.now()}`
    };
  }

  // História de emergência (último recurso)
  private generateEmergencyStory(gameParams: GameParameters): StoryData {
    const { subject, theme } = gameParams;
    
    return {
      title: `Aventura em ${subject}: ${theme}`,
      content: `Era uma vez um estudante curioso que embarcou numa aventura de aprendizado sobre ${theme}. Durante sua jornada, ele descobriu que cada matéria tinha seus próprios segredos e mistérios esperando para serem desvendados. Essa aventura transformou sua forma de ver o mundo e o conhecimento.`
    };
  }

  // Verificar se existe fallback disponível
  hasFallbackAvailable(gameParams: GameParameters, contentType: ContentType): boolean {
    if (contentType === 'question') {
      const granular = getGranularFallback(gameParams, 'question');
      if (granular) return true;
      
      const intelligent = generateIntelligentFallback(gameParams, 'question');
      if (intelligent?.question) return true;
      
      const thematic = generateThematicFallback(gameParams);
      if (thematic) return true;
      
      return true; // Emergency sempre disponível
    }
    
    if (contentType === 'story') {
      const granular = getGranularFallback(gameParams, 'story');
      if (granular) return true;
      
      const intelligent = generateIntelligentFallback(gameParams, 'story');
      if (intelligent?.story) return true;
      
      return true; // Emergency sempre disponível
    }
    
    return false;
  }

  // Limpar cache (se necessário no futuro)
  clearCache(): void {
    console.log('[UNIFIED-FALLBACK] Cache limpo');
  }
}

// Instância singleton para uso global
export const unifiedFallbackSystem = UnifiedFallbackSystem.getInstance();