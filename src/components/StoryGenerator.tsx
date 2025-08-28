import { useState, useCallback } from 'react';
import { GameParameters } from '@/components/GameSetup';
import QuestionGenerationService from '@/services/QuestionGenerationService';
import { unifiedFallbackSystem } from '@/services/UnifiedFallbackSystem';

interface StoryData {
  title: string;
  content: string;
}

export const useStoryGenerator = () => {
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const questionService = QuestionGenerationService.getInstance();

  const generateDynamicStory = useCallback(async (
    gameParams: GameParameters,
    onStoryGenerated: (story: StoryData) => void
  ) => {
    if (isGeneratingStory) return;

    setIsGeneratingStory(true);
    try {
      console.log('Gerando história para:', gameParams.subject, gameParams.theme);
      const storyData = await questionService.generateStory(gameParams);

      const looksAdventure = (s: any) => {
        const content = (s?.content || '').toLowerCase();
        return (
          content.includes('sua aventura:') ||
          content.includes('você ') ||
          /\n\s*1\./.test(s?.content || '')
        );
      };

      if (storyData && storyData.title && storyData.content && looksAdventure(storyData)) {
        console.log('✅ História gerada com sucesso via Gemini');
        onStoryGenerated(storyData);
      } else {
        console.log('⚠️ Gemini falhou, usando sistema de fallbacks hierárquico');
        const fallbackStory = unifiedFallbackSystem.generateFallbackStory(gameParams);
        onStoryGenerated(fallbackStory);
      }
    } catch (error) {
      console.error('❌ Erro ao gerar história:', error);
      console.log('🚨 Usando sistema de fallbacks de emergência');
      const fallbackStory = unifiedFallbackSystem.generateFallbackStory(gameParams);
      onStoryGenerated(fallbackStory);
    } finally {
      setIsGeneratingStory(false);
    }
  }, [questionService, isGeneratingStory]);

  return {
    generateDynamicStory,
    isGeneratingStory,
    isLoading: isGeneratingStory
  };
};