import { useState, useCallback } from 'react';
import { GameParameters } from '@/components/GameSetup';
import { getDisplayWord } from '@/utils/wordCleaner';

interface GameStep {
  type: "text" | "choice" | "question" | "input" | "story_reveal";
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
      content: `**🎓 Bem-vindo à Aventura de ${subject}!**\n\n📚 Você está prestes a embarcar em uma jornada educativa sobre **${theme}**!\n\n🎯 **Como funciona:**\n• Responda às questões corretamente\n• Colete palavras secretas em cada acerto\n• Use as palavras para desbloquear a história final\n\nVocê está pronto para esta jornada de aprendizado?`
    },
    {
      type: "question",
      content: "Hora de testar seus conhecimentos!"
    },
    {
      type: "input",
      content: `**🔐 Hora da Senha Secreta!**\n\nVocê coletou todas as palavras secretas! Agora digite-as na ordem correta para desbloquear a história final da aventura.\n\n*Dica: Use as palavras que você coletou durante as questões, separadas por espaços.*`
    },
    {
      type: "story_reveal",
      content: `**🌟 História Revelada!**\n\n[FULL_STORY_PLACEHOLDER]\n\n**Parabéns por completar esta aventura educativa!** 🎉`
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

  const handleRestart = useCallback(() => {
    console.log('[GAME-LOGIC] 🔄 REINICIANDO JOGO COMPLETAMENTE');
    setCurrentStepIndex(0);
    setCollectedWords([]);
    setSelectedGame(null);
    setGameStarted(false);
    setGameParams(null);
    setDynamicStory(null);
    setDynamicSteps([]);
  }, []);

  const handleSetupComplete = useCallback((params: GameParameters) => {
    console.log('[GAME-LOGIC] 🎯 NOVO SETUP COMPLETO:', params);
    
    setDynamicStory(null);
    setCollectedWords([]);
    setCurrentStepIndex(0);
    setGameParams(params);
    
    const steps = generateDynamicSteps(params);
    setDynamicSteps(steps);
    
    const uniqueId = Date.now() + Math.floor(Math.random() * 10000);
    const genericGame: Game = {
      id: uniqueId,
      theme: params.theme,
      background: 'default',
      password: ['aventura'],
      story: {
        title: `Aventura de ${params.subject}: ${params.theme}`,
        content: `História será revelada quando você completar os desafios!`
      },
      questions: []
    };
    setSelectedGame(genericGame);
    
    console.log('[GAME-LOGIC] ✅ Jogo criado com ID único:', uniqueId);
  }, []);

  const handleCollectWord = useCallback((word: string) => {
    const cleanWord = getDisplayWord(word);
    console.log(`[GAME-LOGIC] Coletando palavra limpa: "${cleanWord}" (original: "${word}")`);
    setCollectedWords((prev) =>
      prev.includes(cleanWord) ? prev : [...prev, cleanWord]
    );
  }, []);

  const handlePasswordSuccess = useCallback(() => {
    setCurrentStepIndex(prev => prev + 1);
  }, []);

  const setDynamicStoryData = useCallback((story: {title: string, content: string}) => {
    setDynamicStory(story);
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
    
    // Actions
    setCurrentStepIndex,
    setGameStarted,
    handleRestart,
    handleSetupComplete,
    handleCollectWord,
    handlePasswordSuccess,
    setDynamicStoryData,
    
    // Computed
    currentStep: dynamicSteps[currentStepIndex],
    isQuestionStep: dynamicSteps[currentStepIndex]?.type === "question",
    isStoryRevealStep: dynamicSteps[currentStepIndex]?.type === "story_reveal"
  };
};