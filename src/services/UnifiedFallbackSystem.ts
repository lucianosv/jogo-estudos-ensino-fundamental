// SISTEMA UNIFICADO DE FALLBACKS HIERÁRQUICOS ROBUSTO
// NOVA HIERARQUIA: Supabase DB → Granular → Intelligent → Thematic → Emergency

import { GameParameters } from '@/components/GameSetup';
import { getGranularFallback } from '@/utils/granularFallbacks';
import { generateThematicFallback } from '@/utils/thematicFallbacks';
import { generateIntelligentFallback } from '@/utils/intelligentFallbacks';
import { databaseFallbackService, DatabaseQuestion, DatabaseStory } from '@/services/DatabaseFallbackService';

export interface Question {
  content: string;
  choices: string[];
  answer: string;
  word: string;
  source: 'database' | 'granular' | 'intelligent' | 'thematic' | 'emergency' | 'gemini' | 'fallback' | 'legacy' | 'preloaded';
  id?: string;
  uniqueId: string;
}

export interface StoryData {
  title: string;
  content: string;
}

export type ContentType = 'question' | 'story' | 'character_info';

// NOVA HIERARQUIA ROBUSTA: Supabase DB → Granular → Intelligent → Thematic → Emergency
export class UnifiedFallbackSystem {
  private static instance: UnifiedFallbackSystem;
  private fallbackNotificationCallback?: (type: 'question' | 'story', source: string) => void;

  static getInstance(): UnifiedFallbackSystem {
    if (!UnifiedFallbackSystem.instance) {
      UnifiedFallbackSystem.instance = new UnifiedFallbackSystem();
    }
    return UnifiedFallbackSystem.instance;
  }

  // Configurar callback para notificações
  setNotificationCallback(callback: (type: 'question' | 'story', source: string) => void) {
    this.fallbackNotificationCallback = callback;
  }

  private notifyFallbackUsed(type: 'question' | 'story', source: string) {
    if (this.fallbackNotificationCallback) {
      this.fallbackNotificationCallback(type, source);
    }
  }

  // Gerar questão única seguindo nova hierarquia robusta
  async generateFallbackQuestion(gameParams: GameParameters, questionIndex: number = 0): Promise<Question> {
    console.log(`[UNIFIED-FALLBACK] Gerando questão ${questionIndex} para ${gameParams.subject} - ${gameParams.theme}`);

    // NÍVEL 0: Supabase Database (prioritário)
    try {
      const databaseQuestions = await databaseFallbackService.getFallbackQuestions(gameParams);
      if (databaseQuestions.length > 0) {
        const dbQuestion = databaseQuestions[questionIndex % databaseQuestions.length];
        console.log(`[UNIFIED-FALLBACK] ✅ Usando fallback DATABASE: ${dbQuestion.content.substring(0, 50)}...`);
        this.notifyFallbackUsed('question', 'database');
        return {
          content: dbQuestion.content,
          choices: dbQuestion.choices,
          answer: dbQuestion.answer,
          word: dbQuestion.word,
          source: 'fallback' as const,
          uniqueId: `database_${questionIndex}_${Date.now()}`
        };
      }
    } catch (error) {
      console.log(`[UNIFIED-FALLBACK] ⚠️ Database fallback falhou:`, error);
    }

    // NÍVEL 1: Granular (mais específico)
    const granularResult = getGranularFallback(gameParams, 'question');
    if (granularResult && Array.isArray(granularResult)) {
      const question = granularResult[questionIndex % granularResult.length];
      console.log(`[UNIFIED-FALLBACK] ✅ Usando fallback GRANULAR: ${question.content.substring(0, 50)}...`);
      this.notifyFallbackUsed('question', 'intelligent');
      return {
        ...question,
        source: 'fallback' as const,
        uniqueId: `granular_${questionIndex}_${Date.now()}`,
        word: question.word || `granular_word_${questionIndex}`
      };
    }

    // NÍVEL 2: Intelligent (inteligente por matéria)
    const intelligentResult = generateIntelligentFallback(gameParams, 'question', questionIndex);
    if (intelligentResult?.question) {
      console.log(`[UNIFIED-FALLBACK] ✅ Usando fallback INTELLIGENT: ${intelligentResult.question.content.substring(0, 50)}...`);
      this.notifyFallbackUsed('question', 'intelligent');
      return {
        ...intelligentResult.question,
        source: 'fallback' as const,
        uniqueId: `intelligent_${questionIndex}_${Date.now()}`,
        word: intelligentResult.question.word || `intelligent_word_${questionIndex}`
      };
    }

    // NÍVEL 3: Thematic (por tema)
    const thematicResult = generateThematicFallback(gameParams);
    if (thematicResult) {
      console.log(`[UNIFIED-FALLBACK] ✅ Usando fallback THEMATIC: ${thematicResult.content.substring(0, 50)}...`);
      this.notifyFallbackUsed('question', 'thematic');
      return {
        ...thematicResult,
        source: 'fallback' as const,
        uniqueId: `thematic_${questionIndex}_${Date.now()}`,
        word: thematicResult.word || `thematic_word_${questionIndex}`
      };
    }

    // NÍVEL 4: Emergency (GARANTIDO - nunca falha)
    console.log(`[UNIFIED-FALLBACK] 🚨 Usando fallback EMERGENCY GARANTIDO`);
    this.notifyFallbackUsed('question', 'emergency');
    return this.generateEmergencyQuestion(gameParams, questionIndex);
  }

  // Gerar história seguindo nova hierarquia robusta
  async generateFallbackStory(gameParams: GameParameters): Promise<StoryData> {
    console.log(`[UNIFIED-FALLBACK] Gerando história para ${gameParams.subject} - ${gameParams.theme}`);

    // NÍVEL 0: Supabase Database (prioritário)
    try {
      const databaseStories = await databaseFallbackService.getFallbackStories(gameParams);
      if (databaseStories.length > 0) {
        const dbStory = databaseStories[0]; // Pegar primeira história disponível
        console.log(`[UNIFIED-FALLBACK] ✅ Usando história DATABASE: ${dbStory.title}`);
        this.notifyFallbackUsed('story', 'database');
        return {
          title: dbStory.title,
          content: dbStory.content
        };
      }
    } catch (error) {
      console.log(`[UNIFIED-FALLBACK] ⚠️ Database story fallback falhou:`, error);
    }

    // NÍVEL 1: Granular
    const granularResult = getGranularFallback(gameParams, 'story') as StoryData;
    if (granularResult?.title && granularResult?.content) {
      console.log(`[UNIFIED-FALLBACK] ✅ Usando história GRANULAR: ${granularResult.title}`);
      this.notifyFallbackUsed('story', 'intelligent');
      return granularResult;
    }

    // NÍVEL 2: Intelligent
    const intelligentResult = generateIntelligentFallback(gameParams, 'story');
    if (intelligentResult?.story) {
      console.log(`[UNIFIED-FALLBACK] ✅ Usando história INTELLIGENT: ${intelligentResult.story.title}`);
      this.notifyFallbackUsed('story', 'intelligent');
      return intelligentResult.story;
    }

    // NÍVEL 3: Emergency (GARANTIDO - nunca falha)
    console.log(`[UNIFIED-FALLBACK] 🚨 Usando história EMERGENCY GARANTIDA`);
    this.notifyFallbackUsed('story', 'emergency');
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
      source: 'emergency' as const,
      uniqueId: `emergency_${questionIndex}_${Date.now()}`
    };
  }

  // História de emergência (último recurso)
  private generateEmergencyStory(gameParams: GameParameters): StoryData {
    const { subject, theme } = gameParams;
    
    const storyTemplates = {
      'História': `Era uma vez uma jovem arqueóloga chamada Ana que descobriu pistas misteriosas sobre ${theme}. Com sua lupa mágica, ela podia ver o passado se desenrolar diante de seus olhos. Ana descobriu pessoas corajosas, eventos importantes e como as decisões do passado moldaram nosso presente. Cada descoberta a fazia entender melhor como a história conecta todas as épocas.`,
      
      'Ciências': `Era uma vez um menino chamado Pedro que ganhou um microscópio mágico de seu avô cientista. Ao observar o mundo através dele, Pedro descobriu os segredos de ${theme}. Ele viu como a natureza funciona, como os seres vivos se relacionam e como tudo no universo está conectado. Pedro ficou fascinado com as maravilhas da ciência!`,
      
      'Geografia': `Era uma vez uma menina chamada Sofia que encontrou um mapa-múndi que ganhava vida ao ser tocado. Através dele, ela viajou virtualmente e aprendeu sobre ${theme}. Sofia descobriu paisagens incríveis, conheceu diferentes culturas e entendeu como as pessoas vivem em lugares distantes. Cada lugar tinha sua própria beleza e importância especial.`,
      
      'Português': `Era uma vez um garoto chamado Lucas que descobriu uma biblioteca encantada onde as palavras saltavam dos livros! Junto com a Fada das Letras, ele explorou o mundo de ${theme}. Lucas aprendeu que as palavras têm poder para contar histórias, expressar sentimentos e conectar pessoas. Cada palavra era como uma pequena magia!`,
      
      'Matemática': `Era uma vez uma menina chamada Clara que encontrou um calculador mágico que resolvia problemas do dia a dia. Com ele, Clara descobriu que ${theme} estava presente em tudo ao seu redor - na natureza, nos jogos, na música e até nas estrelas! Ela percebeu que a matemática era uma linguagem universal que ajudava a entender o mundo.`
    };
    
    const storyContent = storyTemplates[subject as keyof typeof storyTemplates] || 
      `Era uma vez um estudante corajoso que se aventurou pelo fascinante mundo de ${theme}. Em sua jornada de descobertas, encontrou desafios interessantes e aprendeu lições valiosas. Cada passo o levava a compreender melhor os mistérios de ${subject}, transformando sua curiosidade em verdadeiro conhecimento.`;
    
    return {
      title: `A Grande Aventura de ${subject}: ${theme}`,
      content: storyContent
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