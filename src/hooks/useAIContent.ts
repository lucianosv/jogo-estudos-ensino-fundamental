
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIContentHook {
  generateStory: (theme: string) => Promise<any>;
  generateQuestion: (theme: string, difficulty?: string) => Promise<any>;
  generateCharacterInfo: (theme: string) => Promise<any>;
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

const validateDifficulty = (difficulty: string): string => {
  const validDifficulties = ['easy', 'medium', 'hard'];
  if (!validDifficulties.includes(difficulty)) {
    return 'medium'; // Default fallback
  }
  return difficulty;
};

export const useAIContent = (): AIContentHook => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const callAIFunction = async (contentType: string, theme: string, difficulty?: string) => {
    setIsLoading(true);
    
    try {
      // Validate and sanitize inputs
      const sanitizedTheme = validateAndSanitizeInput(theme);
      const validatedDifficulty = difficulty ? validateDifficulty(difficulty) : 'medium';
      const validContentTypes = ['story', 'question', 'character_info'];
      
      if (!validContentTypes.includes(contentType)) {
        throw new Error('Invalid content type');
      }

      // Check cache first
      const { data: cachedContent, error: cacheError } = await supabase
        .from('generated_content')
        .select('content')
        .eq('content_type', contentType)
        .eq('theme', sanitizedTheme)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!cacheError && cachedContent) {
        console.log('Returning cached content for:', contentType, sanitizedTheme);
        return cachedContent.content;
      }

      console.log('Generating new content via AI function');
      const { data, error } = await supabase.functions.invoke('generate-game-content', {
        body: {
          contentType,
          theme: sanitizedTheme,
          difficulty: validatedDifficulty
        }
      });

      if (error) {
        console.error('AI function error:', error);
        throw new Error('Failed to generate content');
      }

      // Cache the generated content
      if (data) {
        const { error: insertError } = await supabase
          .from('generated_content')
          .insert({
            content_type: contentType,
            theme: sanitizedTheme,
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
        ? 'Por favor, verifique se o tema está correto'
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

  const generateStory = async (theme: string) => {
    return await callAIFunction('story', theme);
  };

  const generateQuestion = async (theme: string, difficulty: string = 'medium') => {
    return await callAIFunction('question', theme, difficulty);
  };

  const generateCharacterInfo = async (theme: string) => {
    return await callAIFunction('character_info', theme);
  };

  return {
    generateStory,
    generateQuestion,
    generateCharacterInfo,
    isLoading
  };
};
