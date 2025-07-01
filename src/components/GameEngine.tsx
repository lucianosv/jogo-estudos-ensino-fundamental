
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import gameData from "@/data/demon-slayer-math-game.json";
import TextStep from "./game-steps/TextStep";
import ChoiceStep from "./game-steps/ChoiceStep";
import InputStep from "./game-steps/InputStep";
import BackgroundImages from "./BackgroundImages";
import GameHeader from "./GameHeader";
import StartScreen from "./StartScreen";
import { useToast } from "@/hooks/use-toast";
import { sanitizeText, logSecurityEvent } from "@/utils/securityUtils";
import QuestionsFlow from "./game-steps/QuestionsFlow";
import GameSetup, { GameParameters } from "./GameSetup";
import { useAIContent } from "@/hooks/useAIContent";
import { Loader2 } from "lucide-react";

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

const GameEngine = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [collectedWords, setCollectedWords] = useState<string[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [gameParams, setGameParams] = useState<GameParameters | null>(null);
  const [dynamicStory, setDynamicStory] = useState<{title: string, content: string} | null>(null);
  const [loadingStory, setLoadingStory] = useState(false);

  const { toast } = useToast();
  const { generateStory, isLoading } = useAIContent();

  const games = gameData.games as Game[];
  const allSteps = gameData.steps as GameStep[];
  // Filter out the old theme choice step, now handled by GameSetup
  const steps = allSteps.filter((step) => step.type !== 'choice' || !step.content.includes("Escolha seu herói"));
  const currentStep = steps[currentStepIndex];

  // Feedback de resposta
  const [showQuestionResult, setShowQuestionResult] = useState(false);
  const [lastQuestionCorrect, setLastQuestionCorrect] = useState<boolean | null>(null);

  // Identifica se o passo é de perguntas
  const isQuestionStep = currentStep?.type === "question";

  // Gerar história dinâmica baseada nos parâmetros
  useEffect(() => {
    const generateDynamicStory = async () => {
      if (!gameParams || !selectedGame) return;

      // Se já tem história estática do jogo, usar ela
      if (selectedGame.story && selectedGame.story.content && !selectedGame.story.content.includes('será gerado em breve')) {
        return;
      }

      setLoadingStory(true);
      try {
        const contextualizedTheme = gameParams.themeDetails 
          ? `${gameParams.theme} - ${gameParams.themeDetails}`
          : `${gameParams.subject} com tema ${gameParams.theme} para ${gameParams.schoolGrade}`;

        const storyData = await generateStory(contextualizedTheme);
        if (storyData && storyData.title && storyData.content) {
          setDynamicStory(storyData);
        }
      } catch (error) {
        console.error('Erro ao gerar história:', error);
        setDynamicStory({
          title: `Aventura de ${gameParams.subject}: ${gameParams.theme}`,
          content: `Bem-vindo à sua aventura de ${gameParams.subject} sobre ${gameParams.theme}! Você está pronto para enfrentar desafios incríveis e testar seus conhecimentos. Vamos começar!`
        });
      } finally {
        setLoadingStory(false);
      }
    };

    if (gameParams && selectedGame) {
      generateDynamicStory();
    }
  }, [gameParams, selectedGame, generateStory]);

  // Reinicia tudo
  const handleRestart = () => {
    setCurrentStepIndex(0);
    setCollectedWords([]);
    setSelectedGame(null);
    setGameStarted(false);
    setCurrentQuestionIndex(0);
    setShowQuestionResult(false);
    setLastQuestionCorrect(null);
    setGameParams(null);
    setDynamicStory(null);
  };

  const handleSetupComplete = (params: GameParameters) => {
    setGameParams(params);
    // Try to find a game that matches a character theme from the static data.
    const game = games.find(g => params.theme.includes(g.theme.split(" ")[0]));
    
    if (game) {
      // If a matching game is found (e.g., Demon Slayer), use it.
      setSelectedGame(game);
    } else {
      // If no specific game is found, create a generic one to avoid defaulting to incorrect content.
      // This ensures the theme and subject are respected, and the lack of questions
      // is handled gracefully by QuestionsFlow.
      const genericGame: Game = {
        ...games[0], // Use the first game as a structural template.
        id: Date.now(),
        theme: params.theme,
        background: 'default',
        password: ['aventura'],
        story: {
          title: `Aventura de ${params.subject}: ${params.theme}`,
          content: `Prepare-se para uma jornada sobre ${params.theme} para a série ${params.schoolGrade}. (O conteúdo para esta aventura será gerado em breve!)`
        },
        questions: [] // An empty array will show "Nenhuma pergunta disponível...".
      };
      setSelectedGame(genericGame);
    }
  };

  // Função para coleta de palavra única e evita duplicatas
  const handleCollectWord = (word: string) => {
    setCollectedWords((prev) =>
      prev.includes(word) ? prev : [...prev, word]
    );
  };

  // O que fazer após terminar todas as perguntas? Avança para a próxima etapa (história)
  const handleFinishQuestions = () => {
    setCurrentStepIndex((idx) => idx + 1);
    setCurrentQuestionIndex(0);
    setShowQuestionResult(false);
    setLastQuestionCorrect(null);
  };

  const handlePasswordSubmit = (password: string) => {
    if (!selectedGame) return;
    const sanitizedPassword = sanitizeText(password);
    const correctPassword = selectedGame.password.join(" ");
    if (sanitizedPassword.trim().toLowerCase() === correctPassword.toLowerCase()) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      logSecurityEvent('Incorrect password attempt', {
        expected: correctPassword,
        received: sanitizedPassword
      });
      toast({
        title: "❌ Senha incorreta!",
        description: "Use as palavras que você coletou na ordem correta.",
        variant: "destructive"
      });
    }
  };

  const handleFinalChoice = (choice: string) => {
    if (choice.includes("Sim")) {
      handleRestart();
    } else {
      toast({
        title: "🌸 Obrigado por jogar!",
        description: "Até a próxima aventura! 🌸",
      });
    }
  };

  if (!gameParams) {
    return <GameSetup onSetupComplete={handleSetupComplete} />;
  }

  if (!gameStarted) {
    return (
      <StartScreen 
        title={`Aventura de ${gameParams.subject}: ${gameParams.theme}`}
        description={`Prepare-se para desafios de ${gameParams.subject.toLowerCase()}!`}
        onStart={() => { setGameStarted(true); setCurrentStepIndex(0); }}
      />
    );
  }

  // Renderização do passo (agora delegando perguntas p/ QuestionsFlow)
  const renderStep = () => {
    if (!currentStep) return null;
    // Apenas UMA etapa questions agora, então ela cobre as 4 perguntas
    if (isQuestionStep && selectedGame) {
      return (
        <QuestionsFlow
          questions={selectedGame.questions}
          onCollectWord={handleCollectWord}
          onFinish={handleFinishQuestions}
          selectedGame={selectedGame}
          onRestart={handleRestart}
          gameParams={gameParams}
        />
      );
    }
    switch (currentStep.type) {
      case "text":
        let content = currentStep.content;        
        if (content.includes("[STORY_PLACEHOLDER]") && selectedGame) {
          // Usar história dinâmica se disponível, senão usar a estática
          const storyToUse = dynamicStory || selectedGame.story;
          
          if (loadingStory) {
            return (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-lg">Gerando sua história personalizada...</p>
                <p className="text-sm text-gray-600 mt-2">{gameParams.subject} - {gameParams.theme}</p>
              </div>
            );
          }
          
          content = content.replace(
            "[STORY_PLACEHOLDER]", 
            `**${storyToUse.title}**\n\n${storyToUse.content}`
          );
        }
        return (
          <TextStep 
            content={content}
            onNext={() => setCurrentStepIndex(idx => idx + 1)}
            collectedWords={collectedWords}
            selectedGame={selectedGame}
          />
        );
      case "choice":
        return (
          <ChoiceStep 
            content={currentStep.content}
            choices={currentStep.choices || []}
            onChoice={currentStepIndex === steps.length - 1 ? handleFinalChoice :
              () => setCurrentStepIndex(idx => idx + 1)}
            selectedGame={selectedGame}
          />
        );
      case "input":
        return (
          <InputStep 
            content={currentStep.content}
            onSubmit={handlePasswordSubmit}
            collectedWords={collectedWords}
            selectedGame={selectedGame}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto relative min-h-screen">
      <BackgroundImages selectedGame={selectedGame} />

      <GameHeader 
        currentStepIndex={currentStepIndex}
        totalSteps={steps.length}
        selectedGame={selectedGame}
        collectedWords={collectedWords}
      />

      <Card className="bg-white/85 backdrop-blur-lg shadow-2xl border-2 border-white/60 relative z-10">
        <CardContent className="p-8">
          {renderStep()}
        </CardContent>
      </Card>

      {currentStepIndex === steps.length - 1 && (
        <div className="mt-6 text-center relative z-10">
          <Button 
            onClick={handleRestart}
            variant="outline"
            className="bg-white/90 hover:bg-white border-2 border-red-500 text-red-600 hover:text-red-700 font-bold py-3 px-6 rounded-full shadow-lg"
          >
            🎮 Nova Aventura
          </Button>
        </div>
      )}
    </div>
  );
};

export default GameEngine;
