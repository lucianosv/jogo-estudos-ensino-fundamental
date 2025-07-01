
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GameParameters } from '@/components/GameSetup';

interface AIContentHook {
  generateStory: (gameParams: GameParameters) => Promise<any>;
  generateQuestion: (gameParams: GameParameters, difficulty?: string) => Promise<any>;
  generateCharacterInfo: (gameParams: GameParameters) => Promise<any>;
  isLoading: boolean;
}

// Input validation and sanitization
const validateAndSanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input: must be a non-empty string');
  }
  
  // Remove potentially dangerous characters and limit length
  const sanitized = input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/['"]/g, '') // Remove quotes that could break JSON
    .trim()
    .substring(0, 100); // Limit length
  
  if (sanitized.length === 0) {
    throw new Error('Input cannot be empty after sanitization');
  }
  
  return sanitized;
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

  const callAIFunction = async (contentType: string, gameParams: GameParameters, customDifficulty?: string) => {
    setIsLoading(true);
    
    try {
      // Validate and sanitize inputs
      const sanitizedSubject = validateAndSanitizeInput(gameParams.subject);
      const sanitizedTheme = validateAndSanitizeInput(gameParams.theme);
      const sanitizedGrade = validateAndSanitizeInput(gameParams.schoolGrade);
      const difficulty = customDifficulty || getDifficultyForGrade(gameParams.schoolGrade);
      
      const validContentTypes = ['story', 'question', 'character_info'];
      
      if (!validContentTypes.includes(contentType)) {
        throw new Error('Invalid content type');
      }

      // Create more specific cache key including all parameters
      const cacheKey = `${contentType}_${sanitizedSubject}_${sanitizedTheme}_${sanitizedGrade}`;

      // Check cache first
      const { data: cachedContent, error: cacheError } = await supabase
        .from('generated_content')
        .select('content')
        .eq('content_type', contentType)
        .eq('theme', cacheKey)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!cacheError && cachedContent) {
        console.log('Returning cached content for:', contentType, cacheKey);
        return cachedContent.content;
      }

      console.log('Generating new content via AI function');
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
        console.error('AI function error:', error);
        throw new Error('Failed to generate content');
      }

      // Cache the generated content with the specific key
      if (data) {
        const { error: insertError } = await supabase
          .from('generated_content')
          .insert({
            content_type: contentType,
            theme: cacheKey,
            content: data,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
          });

        if (insertError) {
          console.warn('Failed to cache content:', insertError);
          // Don't throw error, just log it
        }
      }

      return data;
    } catch (error) {
      console.error('Error in AI content generation:', error);
      
      // Provide user-friendly error messages without exposing internals
      const userMessage = error instanceof Error && error.message.includes('Invalid input') 
        ? 'Por favor, verifique se os parâmetros estão corretos'
        : 'Erro temporário na geração de conteúdo. Usando conteúdo padrão.';
      
      toast({
        title: "Aviso",
        description: userMessage,
        variant: "destructive"
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const generateStory = async (gameParams: GameParameters) => {
    return await callAIFunction('story', gameParams);
  };

  const generateQuestion = async (gameParams: GameParameters, customDifficulty?: string) => {
    return await callAIFunction('question', gameParams, customDifficulty);
  };

  const generateCharacterInfo = async (gameParams: GameParameters) => {
    return await callAIFunction('character_info', gameParams);
  };

  return {
    generateStory,
    generateQuestion,
    generateCharacterInfo,
    isLoading
  };
};
