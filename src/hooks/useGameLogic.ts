
import { useState, useEffect, useCallback } from 'react';
import { GameParameters } from '@/components/GameSetup';
import { useAIContent } from '@/hooks/useAIContent';
import { generateIntelligentFallback } from '@/utils/intelligentFallbacks';

interface GameStep {
  type: "text" | "choice" | "question" | "input";
  content: string;
  choices?: string[];
  answer?: string;
  correct_response?: string;
  incorrect_response?: string;
}

interface Game {
  id: number;
  theme: string;
  background: string;
  password: string[];
  story: {
    title: string;
    content: string;
  };
  questions: Array<{
    content: string;
    choices: string[];
    answer: string;
    word: string;
  }>;
}

const generateDynamicSteps = (gameParams: GameParameters): GameStep[] => {
  const { subject, theme } = gameParams;
  
  return [
    {
      type: "text",
      content: `**Bem-vindo à Aventura de ${subject}!**\n\n[STORY_PLACEHOLDER]\n\nVocê está pronto para esta jornada de aprendizado?`
    },
    {
      type: "question",
      content: "Hora de testar seus conhecimentos!"
    },
    {
      type: "input",
      content: `**🎉 Parabéns!**\n\nVocê coletou todas as palavras secretas! Agora digite-as na ordem correta para desbloquear o final da aventura.\n\n*Dica: Use as palavras que você coletou durante as questões, separadas por espaços.*`
    },
    {
      type: "text",
      content: `**🌟 Fantástico!**\n\nVocê completou com sucesso a aventura de ${subject} sobre ${theme}! \n\nDurante esta jornada, você demonstrou conhecimento, determinação e inteligência. Continue sempre curioso e disposto a aprender!\n\n**Sua aventura de aprendizado nunca termina!** 📚✨`
    },
    {
      type: "choice",
      content: "**🎮 O que você gostaria de fazer agora?**",
      choices: [
        "🔄 Sim, quero uma nova aventura!",
        "📚 Não, quero encerrar por aqui"
      ]
    }
  ];
};

export const useGameLogic = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [collectedWords, setCollectedWords] = useState<string[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameParams, setGameParams] = useState<GameParameters | null>(null);
  const [dynamicStory, setDynamicStory] = useState<{title: string, content: string} | null>(null);
  const [dynamicSteps, setDynamicSteps] = useState<GameStep[]>([]);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);

  const { generateStory, isLoading } = useAIContent();

  // Gerar steps dinamicamente quando os parâmetros são definidos
  useEffect(() => {
    if (gameParams) {
      const steps = generateDynamicSteps(gameParams);
      setDynamicSteps(steps);
    }
  }, [gameParams]);

  // Gerar história dinamicamente - COM CONTROLE DE LOOP
  const generateDynamicStory = useCallback(async () => {
    if (!gameParams || !selectedGame || isGeneratingStory) return;

    if (selectedGame.story && selectedGame.story.content && !selectedGame.story.content.includes('será gerado em breve')) {
      return;
    }

    setIsGeneratingStory(true);
    try {
      console.log('Gerando história para:', gameParams.subject, gameParams.theme);
      const storyData = await generateStory(gameParams);
      if (storyData && storyData.title && storyData.content) {
        setDynamicStory(storyData);
      } else {
        // Usar fallback inteligente se a IA falhar
        const fallbackStory = generateIntelligentFallback(gameParams, 'story');
        setDynamicStory(fallbackStory);
      }
    } catch (error) {
      console.error('Erro ao gerar história:', error);
      // Usar fallback inteligente
      const fallbackStory = generateIntelligentFallback(gameParams, 'story');
      setDynamicStory(fallbackStory);
    } finally {
      setIsGeneratingStory(false);
    }
  }, [gameParams, selectedGame, generateStory, isGeneratingStory]);

  // Chamada única para gerar história
  useEffect(() => {
    if (gameParams && selectedGame && !dynamicStory && !isGeneratingStory) {
      generateDynamicStory();
    }
  }, [gameParams, selectedGame, dynamicStory, isGeneratingStory, generateDynamicStory]);

  const handleRestart = useCallback(() => {
    setCurrentStepIndex(0);
    setCollectedWords([]);
    setSelectedGame(null);
    setGameStarted(false);
    setGameParams(null);
    setDynamicStory(null);
    setDynamicSteps([]);
    setIsGeneratingStory(false);
  }, []);

  const handleSetupComplete = useCallback((params: GameParameters) => {
    setGameParams(params);
    
    // Criar um jogo genérico personalizado para qualquer tema
    const genericGame: Game = {
      id: Date.now(),
      theme: params.theme,
      background: 'default',
      password: ['aventura'],
      story: {
        title: `Aventura de ${params.subject}: ${params.theme}`,
        content: `Prepare-se para uma jornada sobre ${params.theme} para a série ${params.schoolGrade}. (O conteúdo para esta aventura será gerado em breve!)`
      },
      questions: []
    };
    setSelectedGame(genericGame);
  }, []);

  const handleCollectWord = useCallback((word: string) => {
    setCollectedWords((prev) =>
      prev.includes(word) ? prev : [...prev, word]
    );
  }, []);

  return {
    // State
    currentStepIndex,
    collectedWords,
    selectedGame,
    gameStarted,
    gameParams,
    dynamicStory,
    dynamicSteps,
    isGeneratingStory,
    isLoading,
    
    // Actions
    setCurrentStepIndex,
    setGameStarted,
    handleRestart,
    handleSetupComplete,
    handleCollectWord,
    
    // Computed
    currentStep: dynamicSteps[currentStepIndex],
    isQuestionStep: dynamicSteps[currentStepIndex]?.type === "question"
  };
};
