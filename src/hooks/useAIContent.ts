
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GameParameters } from '@/components/GameSetup';
import { generateIntelligentFallback } from '@/utils/intelligentFallbacks';

interface AIContentHook {
  generateStory: (gameParams: GameParameters) => Promise<any>;
  generateQuestion: (gameParams: GameParameters, difficulty?: string) => Promise<any>;
  generateCharacterInfo: (gameParams: GameParameters) => Promise<any>;
  isLoading: boolean;
}

// Validação simples de entrada
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
      
      console.log('Chamando Edge Function para:', contentType, sanitizedSubject, sanitizedTheme);

      const { data, error } = await supabase.functions.invoke('generate-game-content', {
        body: {
          contentType,
          subject: sanitizedSubject,
          theme: sanitizedTheme,
          schoolGrade: sanitizedGrade,
          themeDetails: gameParams.themeDetails,
          difficulty
        }
      });

      if (error) {
        console.error('Erro na Edge Function:', error);
        throw new Error('Failed to generate content');
      }

      if (data) {
        console.log('Conteúdo gerado com sucesso:', contentType);
        return data;
      } else {
        throw new Error('No content generated');
      }

    } catch (error) {
      console.error('Erro na geração de conteúdo:', error);
      
      // Usar fallback inteligente
      const fallbackContent = generateIntelligentFallback(gameParams, contentType as 'story' | 'question' | 'character_info');
      
      if (fallbackContent) {
        toast({
          title: "Conteúdo Personalizado",
          description: `Conteúdo gerado para ${gameParams.subject} - ${gameParams.schoolGrade}`,
        });
        return fallbackContent;
      }
      
      toast({
        title: "Erro na Geração",
        description: `Não foi possível gerar conteúdo para ${gameParams.subject}`,
        variant: "destructive"
      });
      
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
