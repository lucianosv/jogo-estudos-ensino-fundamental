import { useState } from "react";
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

  const { toast } = useToast();

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
  };

  const handleSetupComplete = (params: GameParameters) => {
    setGameParams(params);
    // This logic can be expanded to fetch dynamic themes. For now, it matches
    // existing visual themes if the name corresponds to a character.
    const game = games.find(g => params.theme.includes(g.theme.split(" ")[0])) || games[0];
    setSelectedGame(game);
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

  // handleThemeChoice is no longer needed here.

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
          const storyToUse = selectedGame.story;
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
      {/* Security indicator removido conforme solicitado */}

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
