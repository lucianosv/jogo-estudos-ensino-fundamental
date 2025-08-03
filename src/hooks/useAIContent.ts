
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

// Gerar chave de cache mais específica com timestamp para forçar renovação
const generateCacheKey = (contentType: string, gameParams: GameParameters): string => {
  const timestamp = Math.floor(Date.now() / (1000 * 60 * 10)); // Renovar a cada 10 minutos
  const randomSeed = Math.floor(Math.random() * 1000); // Adicionar aleatoriedade
  return `${contentType}_${gameParams.subject}_${gameParams.theme}_${gameParams.schoolGrade}_${timestamp}_${randomSeed}`;
};

export const useAIContent = (): AIContentHook => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const callAIFunction = useCallback(async (contentType: string, gameParams: GameParameters, customDifficulty?: string) => {
    if (isLoading) {
      console.log('[AI-CONTENT] Já está carregando, ignorando nova chamada');
      return null;
    }

    setIsLoading(true);
    
    try {
      // Validar entradas
      const sanitizedSubject = validateInput(gameParams.subject);
      const sanitizedTheme = validateInput(gameParams.theme);
      const sanitizedGrade = validateInput(gameParams.schoolGrade);
      const difficulty = customDifficulty || getDifficultyForGrade(gameParams.schoolGrade);
      
      console.log(`[AI-CONTENT] 🎯 INICIANDO GERAÇÃO: ${sanitizedSubject} -> ${sanitizedTheme} -> ${sanitizedGrade} (${contentType})`);

      // ✅ PRIORIDADE 1: FALLBACK EXPANDIDO GRANULAR (SEMPRE PRIMEIRO)
      console.log(`[AI-CONTENT] TENTATIVA 1: Fallback expandido granular`);
      const expandedFallback = getExpandedGranularFallback(gameParams, contentType as 'question' | 'story');
      
      if (expandedFallback) {
        console.log(`[AI-CONTENT] ✅ FALLBACK EXPANDIDO ENCONTRADO E VALIDADO`);
        
        if (contentType === 'question' && Array.isArray(expandedFallback)) {
          // Verificar se as 4 questões têm palavras-chave únicas
          if (ensureUniqueKeywords(expandedFallback) && expandedFallback.length === 4) {
            console.log(`[AI-CONTENT] ✅ SUCESSO: Fallback expandido com 4 questões únicas`);
            return expandedFallback;
          }
        }
        
        if (contentType === 'story' && !Array.isArray(expandedFallback)) {
          console.log(`[AI-CONTENT] ✅ SUCESSO: História do fallback expandido`);
          return expandedFallback;
        }
      }

      // 🔄 PRIORIDADE 2: FALLBACK INTELIGENTE (BACKUP CONFIÁVEL)
      console.log(`[AI-CONTENT] TENTATIVA 2: Fallback inteligente específico`);
      const intelligentFallback = generateIntelligentFallback(gameParams, contentType as 'story' | 'question' | 'character_info');
      
      if (intelligentFallback && validateGeneratedContent(intelligentFallback, gameParams)) {
        console.log(`[AI-CONTENT] ✅ SUCESSO: Fallback inteligente validado`);
        return intelligentFallback;
      }

      // ⚡ PRIORIDADE 3: API GEMINI (TERCEIRA OPÇÃO)
      console.log(`[AI-CONTENT] TENTATIVA 3: API Gemini como última opção`);
      
      try {
        // Usar chave de cache específica para evitar cache corrompido
        const cacheKey = generateCacheKey(contentType, gameParams);
        console.log(`[AI-CONTENT] Chave de cache: ${cacheKey}`);
        
        const { data, error } = await supabase.functions.invoke('generate-game-content', {
          body: {
            contentType,
            subject: sanitizedSubject,
            theme: sanitizedTheme,
            schoolGrade: sanitizedGrade,
            themeDetails: gameParams.themeDetails,
            difficulty,
            forceRegenerate: true, // Sempre forçar nova geração
            cacheKey // Usar chave específica
          }
        });

        if (!error && data && validateGeneratedContent(data, gameParams)) {
          console.log(`[AI-CONTENT] ✅ SUCESSO: API Gemini com conteúdo validado`);
          return data;
        } else {
          console.log(`[AI-CONTENT] ❌ API Gemini falhou na validação:`, error);
        }
      } catch (apiError) {
        console.log(`[AI-CONTENT] ❌ Erro na API Gemini:`, apiError);
      }

      // 🚨 EMERGÊNCIA: Usar fallback inteligente mesmo se falhou na validação anterior
      console.log(`[AI-CONTENT] EMERGÊNCIA: Forçando fallback de último recurso`);
      const emergencyFallback = generateIntelligentFallback(gameParams, contentType as 'story' | 'question' | 'character_info');
      
      if (emergencyFallback) {
        console.log(`[AI-CONTENT] ⚠️ EMERGÊNCIA: Usando fallback sem validação rigorosa`);
        return emergencyFallback;
      }
      
      throw new Error('Nenhum conteúdo disponível após todas as tentativas');

    } catch (error) {
      console.error(`[AI-CONTENT] ❌ ERRO GERAL FINAL:`, error);
      
      // ÚLTIMO RECURSO: Criar conteúdo mínimo funcional
      if (contentType === 'question') {
        return {
          content: `${gameParams.subject} - ${gameParams.theme} (${gameParams.schoolGrade}): Questão básica sobre o tema`,
          choices: ["Opção A", "Opção B", "Opção C", "Opção D"],
          answer: "Opção A",
          word: "conhecimento"
        };
      } else if (contentType === 'story') {
        return {
          title: `${gameParams.subject}: ${gameParams.theme}`,
          content: `História educativa sobre ${gameParams.theme} em ${gameParams.subject}.`
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
