
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIContentHook {
  generateStory: (theme: string) => Promise<any>;
  generateQuestion: (theme: string, difficulty?: string) => Promise<any>;
  generateCharacterInfo: (theme: string) => Promise<any>;
  isLoading: boolean;
}

export const useAIContent = (): AIContentHook => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const callAIFunction = async (contentType: string, theme: string, difficulty?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-game-content', {
        body: {
          contentType,
          theme,
          difficulty: difficulty || 'medium'
        }
      });

      if (error) {
        console.error('Erro na função AI:', error);
        toast({
          title: "Erro ao gerar conteúdo",
          description: "Usando conteúdo padrão temporariamente.",
          variant: "destructive"
        });
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao chamar função AI:', error);
      toast({
        title: "Erro de conexão",
        description: "Verifique sua conexão com a internet.",
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
