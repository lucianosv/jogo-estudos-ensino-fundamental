
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

export const useAIContent = (): AIContentHook => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const callAIFunction = useCallback(async (contentType: string, gameParams: GameParameters, customDifficulty?: string) => {
    if (isLoading) {
      console.log('Já está carregando, ignorando nova chamada');
      return null;
    }

    setIsLoading(true);
    
    try {
      // Validar entradas
      const sanitizedSubject = validateInput(gameParams.subject);
      const sanitizedTheme = validateInput(gameParams.theme);
      const sanitizedGrade = validateInput(gameParams.schoolGrade);
      const difficulty = customDifficulty || getDifficultyForGrade(gameParams.schoolGrade);
      
      console.log(`[${contentType}] TENTATIVA 1: API Gemini para:`, sanitizedSubject, sanitizedTheme, sanitizedGrade);

      // TENTATIVA 1: API Gemini (SEMPRE PRIMEIRO)
      try {
        const { data, error } = await supabase.functions.invoke('generate-game-content', {
          body: {
            contentType,
            subject: sanitizedSubject,
            theme: sanitizedTheme,
            schoolGrade: sanitizedGrade,
            themeDetails: gameParams.themeDetails,
            difficulty,
            forceRegenerate: false
          }
        });

        if (!error && data && validateGeneratedContent(data, gameParams)) {
          console.log(`[${contentType}] ✅ API GEMINI FUNCIONOU - conteúdo validado`);
          return data;
        } else {
          console.log(`[${contentType}] ❌ API Gemini falhou ou validação rejeitou:`, error);
        }
      } catch (apiError) {
        console.log(`[${contentType}] ❌ Erro na API Gemini:`, apiError);
      }

      console.log(`[${contentType}] TENTATIVA 2: Fallback expandido granular`);

      // TENTATIVA 2: Fallback expandido granular
      const expandedFallback = getExpandedGranularFallback(gameParams, contentType as 'question' | 'story');
      if (expandedFallback) {
        console.log(`[${contentType}] ✅ FALLBACK EXPANDIDO ENCONTRADO`);
        
        if (contentType === 'question' && Array.isArray(expandedFallback)) {
          // Verificar se as 4 questões têm palavras-chave únicas
          if (ensureUniqueKeywords(expandedFallback)) {
            console.log(`[${contentType}] ✅ Fallback expandido com 4 questões únicas aprovado`);
            return expandedFallback;
          }
        }
        
        if (contentType === 'story' && !Array.isArray(expandedFallback)) {
          console.log(`[${contentType}] ✅ História do fallback expandido aprovada`);
          return expandedFallback;
        }
      }

      console.log(`[${contentType}] TENTATIVA 3: Fallback inteligente como último recurso`);

      // TENTATIVA 3: Fallback inteligente (ÚLTIMO RECURSO)
      const fallbackContent = generateIntelligentFallback(gameParams, contentType as 'story' | 'question' | 'character_info');
      
      if (fallbackContent && validateGeneratedContent(fallbackContent, gameParams)) {
        console.log(`[${contentType}] ✅ FALLBACK INTELIGENTE usado e validado`);
        return fallbackContent;
      }
      
      throw new Error('Nenhum conteúdo válido disponível');

    } catch (error) {
      console.error(`[${contentType}] ❌ ERRO GERAL:`, error);
      
      // EM CASO DE ERRO TOTAL, AINDA TENTAR FALLBACK INTELIGENTE
      try {
        const emergencyFallback = generateIntelligentFallback(gameParams, contentType as 'story' | 'question' | 'character_info');
        console.log(`[${contentType}] ⚠️ USANDO FALLBACK DE EMERGÊNCIA`);
        return emergencyFallback;
      } catch (emergencyError) {
        console.error(`[${contentType}] ❌ FALHA TOTAL:`, emergencyError);
        return null;
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const generateStory = useCallback(async (gameParams: GameParameters) => {
    console.log(`[STORY] Iniciando geração para: ${gameParams.subject} - ${gameParams.theme} - ${gameParams.schoolGrade}`);
    return await callAIFunction('story', gameParams);
  }, [callAIFunction]);

  const generateQuestion = useCallback(async (gameParams: GameParameters, customDifficulty?: string) => {
    console.log(`[QUESTION] Iniciando geração para: ${gameParams.subject} - ${gameParams.theme} - ${gameParams.schoolGrade}`);
    return await callAIFunction('question', gameParams, customDifficulty);
  }, [callAIFunction]);

  const generateCharacterInfo = useCallback(async (gameParams: GameParameters) => {
    console.log(`[CHARACTER] Iniciando geração para: ${gameParams.subject} - ${gameParams.theme} - ${gameParams.schoolGrade}`);
    return await callAIFunction('character_info', gameParams);
  }, [callAIFunction]);

  return {
    generateStory,
    generateQuestion,
    generateCharacterInfo,
    isLoading
  };
};
