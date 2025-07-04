
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
      
      console.log(`[${contentType}] Chamando Edge Function para:`, sanitizedSubject, sanitizedTheme, sanitizedGrade);

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
        console.error(`[${contentType}] Erro na Edge Function:`, error);
        
        // Usar fallback inteligente imediatamente
        const fallbackContent = generateIntelligentFallback(gameParams, contentType as 'story' | 'question' | 'character_info');
        
        if (fallbackContent) {
          console.log(`[${contentType}] Usando fallback inteligente`);
          toast({
            title: "Conteúdo Personalizado",
            description: `Usando conteúdo educativo para ${gameParams.subject} - ${gameParams.schoolGrade}`,
          });
          return fallbackContent;
        }
        
        throw error;
      }

      if (data && (data.title || data.content || data.choices)) {
        console.log(`[${contentType}] Conteúdo gerado com sucesso via IA`);
        return data;
      } else {
        console.log(`[${contentType}] Dados inválidos da IA, usando fallback`);
        const fallbackContent = generateIntelligentFallback(gameParams, contentType as 'story' | 'question' | 'character_info');
        return fallbackContent;
      }

    } catch (error) {
      console.error(`[${contentType}] Erro na geração de conteúdo:`, error);
      
      // Usar fallback inteligente como última tentativa
      const fallbackContent = generateIntelligentFallback(gameParams, contentType as 'story' | 'question' | 'character_info');
      
      if (fallbackContent) {
        console.log(`[${contentType}] Usando fallback após erro`);
        toast({
          title: "Conteúdo Educativo",
          description: `Conteúdo gerado para ${gameParams.subject} - ${gameParams.schoolGrade}`,
        });
        return fallbackContent;
      }
      
      toast({
        title: "Erro na Geração",
        description: `Problema ao gerar conteúdo para ${gameParams.subject}. Verifique a configuração da API.`,
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
