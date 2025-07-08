
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GameParameters } from '@/components/GameSetup';
import { generateIntelligentFallback } from '@/utils/intelligentFallbacks';
import { getGranularFallback } from '@/utils/granularFallbacks';

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

// Validação rigorosa de conteúdo
const validateAIContent = (content: any, gameParams: GameParameters): boolean => {
  if (!content) return false;
  
  const contentStr = JSON.stringify(content).toLowerCase();
  const { subject, theme } = gameParams;
  
  // Lista expandida de palavras inadequadas
  const forbiddenWords = [
    'demon', 'demônio', 'demonio', 'diabo', 'devil', 'satan', 'inferno',
    'matador', 'slayer', 'mata', 'mata-', 'assassin', 'killer',
    'anime', 'manga', 'tanjiro', 'nezuko', 'hashira', 'breathing',
    'sangue', 'blood', 'morte', 'death', 'violência', 'violence'
  ];
  
  // Verificar palavras proibidas
  for (const word of forbiddenWords) {
    if (contentStr.includes(word)) {
      console.warn(`[VALIDATION] Conteúdo rejeitado por conter: ${word}`);
      return false;
    }
  }
  
  // Verificar relevância temática
  const themeLower = theme.toLowerCase();
  if (themeLower.includes('solar') || themeLower.includes('planeta')) {
    const spaceWords = ['planeta', 'sol', 'sistema', 'espaço', 'universo', 'estrela', 'órbita', 'astronomia'];
    const hasSpaceContent = spaceWords.some(word => contentStr.includes(word));
    if (!hasSpaceContent) {
      console.warn(`[VALIDATION] Conteúdo sobre Sistema Solar rejeitado por não ter palavras relevantes`);
      return false;
    }
  }
  
  // Verificar se não é genérico demais
  if (contentStr.includes('questão básica') || contentStr.includes('exemplo genérico')) {
    console.warn(`[VALIDATION] Conteúdo rejeitado por ser muito genérico`);
    return false;
  }
  
  return true;
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
      
      console.log(`[${contentType}] Tentando gerar via IA para:`, sanitizedSubject, sanitizedTheme, sanitizedGrade);

      // Tentar gerar via IA primeiro
      const { data, error } = await supabase.functions.invoke('generate-game-content', {
        body: {
          contentType,
          subject: sanitizedSubject,
          theme: sanitizedTheme,
          schoolGrade: sanitizedGrade,
          themeDetails: gameParams.themeDetails,
          difficulty,
          forceRegenerate: false // Usar cache quando possível
        }
      });

      if (!error && data && validateAIContent(data, gameParams)) {
        console.log(`[${contentType}] Conteúdo IA validado com sucesso`);
        return data;
      }

      console.log(`[${contentType}] IA falhou ou conteúdo inválido, tentando fallback granular...`);
      
      // Tentar fallback granular primeiro
      const granularFallback = getGranularFallback(gameParams, contentType as 'question' | 'story');
      if (granularFallback) {
        console.log(`[${contentType}] Usando fallback granular específico`);
        // Para questões, retornar uma questão aleatória do conjunto disponível
        if (contentType === 'question' && Array.isArray(granularFallback)) {
          const randomQuestion = granularFallback[Math.floor(Math.random() * granularFallback.length)];
          return randomQuestion;
        }
        return granularFallback;
      }

      console.log(`[${contentType}] Fallback granular não disponível, usando fallback inteligente...`);
      
      // Usar fallback inteligente como último recurso
      const fallbackContent = generateIntelligentFallback(gameParams, contentType as 'story' | 'question' | 'character_info');
      
      if (fallbackContent) {
        console.log(`[${contentType}] Usando fallback inteligente`);
        return fallbackContent;
      }
      
      throw new Error('Nenhum conteúdo disponível');

    } catch (error) {
      console.error(`[${contentType}] Erro na geração de conteúdo:`, error);
      
      // Último recurso: fallback granular
      const granularFallback = getGranularFallback(gameParams, contentType as 'question' | 'story');
      if (granularFallback) {
        console.log(`[${contentType}] Usando fallback granular após erro`);
        // Para questões, retornar uma questão aleatória do conjunto disponível
        if (contentType === 'question' && Array.isArray(granularFallback)) {
          const randomQuestion = granularFallback[Math.floor(Math.random() * granularFallback.length)];
          return randomQuestion;
        }
        return granularFallback;
      }
      
      // Fallback inteligente final
      const fallbackContent = generateIntelligentFallback(gameParams, contentType as 'story' | 'question' | 'character_info');
      if (fallbackContent) {
        console.log(`[${contentType}] Usando fallback inteligente após erro`);
        return fallbackContent;
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, toast]);

  const generateStory = useCallback(async (gameParams: GameParameters) => {
    return await callAIFunction('story', gameParams);
  }, [callAIFunction]);

  const generateQuestion = useCallback(async (gameParams: GameParameters, customDifficulty?: string) => {
    return await callAIFunction('question', gameParams, customDifficulty);
  }, [callAIFunction]);

  const generateCharacterInfo = useCallback(async (gameParams: GameParameters) => {
    return await callAIFunction('character_info', gameParams);
  }, [callAIFunction]);

  return {
    generateStory,
    generateQuestion,
    generateCharacterInfo,
    isLoading
  };
};
