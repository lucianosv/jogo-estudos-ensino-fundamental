import { useState, useCallback } from 'react';
import { GameParameters } from '@/components/GameSetup';
import QuestionGenerationService from '@/services/QuestionGenerationService';
import { generateIntelligentFallback } from '@/utils/intelligentFallbacks';

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
        onStoryGenerated(storyData);
      } else {
        const fallbackStory = generateIntelligentFallback(gameParams, 'story');
        onStoryGenerated(fallbackStory?.story || { title: 'Aventura Educativa', content: 'Uma jornada de aprendizado te espera!' });
      }
    } catch (error) {
      console.error('Erro ao gerar história:', error);
      const fallbackStory = generateIntelligentFallback(gameParams, 'story');
      onStoryGenerated(fallbackStory?.story || { title: 'Aventura Educativa', content: 'Uma jornada de aprendizado te espera!' });
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