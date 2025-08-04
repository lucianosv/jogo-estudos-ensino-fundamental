import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GameParameters } from '@/components/GameSetup';
import { generateIntelligentFallback, validateGeneratedContent } from '@/utils/intelligentFallbacks';
import { getExpandedGranularFallback, ensureUniqueKeywords } from '@/utils/expandedGranularFallbacks';

interface AIContentHook {
  generateStory: (gameParams: GameParameters) => Promise<any>;
  generateQuestion: (gameParams: GameParameters, difficulty?: string) => Promise<any>;
  generateCharacterInfo: (gameParams: GameParameters) => Promise<any>;
  isLoading: boolean;
}

// Validação melhorada de entrada
const validateInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input');
  }
  return input.trim().substring(0, 100);
};

// Mapear dificuldade baseada na série escolar
const getDifficultyForGrade = (schoolGrade: string): string => {
  const grade = parseInt(schoolGrade.charAt(0));
  if (grade >= 1 && grade <= 3) return 'easy';
  if (grade >= 4 && grade <= 6) return 'medium';
  if (grade >= 7 && grade <= 9) return 'hard';
  return 'medium';
};

// Chave de cache ultra-específica para evitar corrupção
const generateUltraSpecificCacheKey = (contentType: string, gameParams: GameParameters): string => {
  const timestamp = Math.floor(Date.now() / (1000 * 60 * 5)); // 5 minutos
  const randomSeed = Math.floor(Math.random() * 100);
  const subjectKey = gameParams.subject.replace(/\s+/g, '_');
  const themeKey = gameParams.theme.replace(/\s+/g, '_');
  return `${contentType}_${subjectKey}_${themeKey}_${gameParams.schoolGrade}_v3_${timestamp}_${randomSeed}`;
};

export const useAIContent = (): AIContentHook => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const callAIFunction = useCallback(async (contentType: string, gameParams: GameParameters, customDifficulty?: string) => {
    if (isLoading) {
      console.log('[AI-CONTENT] 🔄 Já está carregando, ignorando nova chamada');
      return null;
    }

    setIsLoading(true);
    
    try {
      // Validar entradas
      const sanitizedSubject = validateInput(gameParams.subject);
      const sanitizedTheme = validateInput(gameParams.theme);
      const sanitizedGrade = validateInput(gameParams.schoolGrade);
      const difficulty = customDifficulty || getDifficultyForGrade(gameParams.schoolGrade);
      
      console.log(`[AI-CONTENT] 🎯 INICIANDO NOVA LÓGICA: ${sanitizedSubject} -> ${sanitizedTheme} -> ${sanitizedGrade}`);

      // ✅ PRIORIDADE 1: FALLBACK EXPANDIDO GRANULAR (SEMPRE PRIMEIRO)
      console.log(`[AI-CONTENT] 🥇 PRIORIDADE 1: Tentando fallback expandido granular`);
      const expandedFallback = getExpandedGranularFallback(gameParams, contentType as 'question' | 'story');
      
      if (expandedFallback) {
        console.log(`[AI-CONTENT] ✅ FALLBACK EXPANDIDO ENCONTRADO E VALIDADO`);
        
        if (contentType === 'question' && Array.isArray(expandedFallback)) {
          if (ensureUniqueKeywords(expandedFallback) && expandedFallback.length === 4) {
            console.log(`[AI-CONTENT] ✅ SUCESSO PRIORIDADE 1: 4 questões únicas do fallback expandido`);
            return expandedFallback;
          }
        }
        
        if (contentType === 'story' && !Array.isArray(expandedFallback)) {
          console.log(`[AI-CONTENT] ✅ SUCESSO PRIORIDADE 1: História do fallback expandido`);
          return expandedFallback;
        }
      }

      // 🥈 PRIORIDADE 2: FALLBACK INTELIGENTE (BACKUP CONFIÁVEL)
      console.log(`[AI-CONTENT] 🥈 PRIORIDADE 2: Tentando fallback inteligente específico`);
      const intelligentFallback = generateIntelligentFallback(gameParams, contentType as 'story' | 'question' | 'character_info');
      
      if (intelligentFallback && validateGeneratedContent(intelligentFallback, gameParams)) {
        console.log(`[AI-CONTENT] ✅ SUCESSO PRIORIDADE 2: Fallback inteligente validado`);
        return intelligentFallback;
      }

      // 🥉 PRIORIDADE 3: API GEMINI STREAMING (ÚLTIMA OPÇÃO)
      console.log(`[AI-CONTENT] 🥉 PRIORIDADE 3: Tentando API Gemini STREAMING como última opção`);
      
      try {
        // Usar chave ultra-específica para evitar cache corrompido
        const ultraCacheKey = generateUltraSpecificCacheKey(contentType, gameParams);
        console.log(`[AI-CONTENT] 🔑 Chave ultra-específica: ${ultraCacheKey}`);
        
        const { data, error } = await supabase.functions.invoke('generate-game-content', {
          body: {
            contentType,
            subject: sanitizedSubject,
            theme: sanitizedTheme,
            schoolGrade: sanitizedGrade,
            themeDetails: gameParams.themeDetails,
            difficulty,
            forceRegenerate: true, // SEMPRE forçar nova geração para limpar cache
            cacheKey: ultraCacheKey
          }
        });

        if (!error && data && validateGeneratedContent(data, gameParams)) {
          // VALIDAÇÃO EXTRA ANTI-CORRUPÇÃO
          const dataStr = JSON.stringify(data).toLowerCase();
          if (!dataStr.includes('demônio') && !dataStr.includes('estava caminhando')) {
            console.log(`[AI-CONTENT] ✅ SUCESSO PRIORIDADE 3: API Gemini STREAMING validada`);
            return data;
          } else {
            console.log(`[AI-CONTENT] 🚨 API Gemini retornou conteúdo corrompido - rejeitado`);
          }
        } else {
          console.log(`[AI-CONTENT] ❌ API Gemini STREAMING falhou:`, error);
        }
      } catch (apiError) {
        console.log(`[AI-CONTENT] ❌ Erro na API Gemini STREAMING:`, apiError);
      }

      // 🚨 EMERGÊNCIA: Usar fallback inteligente forçado
      console.log(`[AI-CONTENT] 🚨 EMERGÊNCIA: Forçando fallback de último recurso`);
      const emergencyFallback = generateIntelligentFallback(gameParams, contentType as 'story' | 'question' | 'character_info');
      
      if (emergencyFallback) {
        console.log(`[AI-CONTENT] ⚠️ EMERGÊNCIA: Usando fallback sem validação rigorosa`);
        return emergencyFallback;
      }
      
      throw new Error('Nenhum conteúdo disponível após todas as tentativas');

    } catch (error) {
      console.error(`[AI-CONTENT] ❌ ERRO GERAL FINAL:`, error);
      
      // ÚLTIMO RECURSO: Conteúdo específico por matéria (SEM MATEMÁTICA)
      if (contentType === 'question') {
        if (gameParams.subject === 'Ciências' && gameParams.theme.toLowerCase().includes('corpo')) {
          return {
            content: `Qual é a função principal do coração no corpo humano?`,
            choices: ["Filtrar o sangue", "Bombear sangue", "Produzir sangue", "Armazenar sangue"],
            answer: "Bombear sangue",
            word: "circulação"
          };
        } else {
          return {
            content: `${gameParams.subject} - ${gameParams.theme}: Questão educativa sobre o tema`,
            choices: ["Opção A", "Opção B", "Opção C", "Opção D"],
            answer: "Opção A",
            word: "conhecimento"
          };
        }
      } else if (contentType === 'story') {
        return {
          title: `${gameParams.subject}: ${gameParams.theme}`,
          content: `História educativa específica sobre ${gameParams.theme} em ${gameParams.subject}.`
        };
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const generateStory = useCallback(async (gameParams: GameParameters) => {
    console.log(`[STORY] 📚 Gerando história para: ${gameParams.subject} - ${gameParams.theme} - ${gameParams.schoolGrade}`);
    return await callAIFunction('story', gameParams);
  }, [callAIFunction]);

  const generateQuestion = useCallback(async (gameParams: GameParameters, customDifficulty?: string) => {
    console.log(`[QUESTION] ❓ Gerando questões para: ${gameParams.subject} - ${gameParams.theme} - ${gameParams.schoolGrade}`);
    return await callAIFunction('question', gameParams, customDifficulty);
  }, [callAIFunction]);

  const generateCharacterInfo = useCallback(async (gameParams: GameParameters) => {
    console.log(`[CHARACTER] 👤 Gerando info para: ${gameParams.subject} - ${gameParams.theme} - ${gameParams.schoolGrade}`);
    return await callAIFunction('character_info', gameParams);
  }, [callAIFunction]);

  return {
    generateStory,
    generateQuestion,
    generateCharacterInfo,
    isLoading
  };
};
