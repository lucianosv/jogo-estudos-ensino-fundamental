import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import gameData from "@/data/demon-slayer-math-game.json";
import TextStep from "./game-steps/TextStep";
import ChoiceStep from "./game-steps/ChoiceStep";
import QuestionStep from "./game-steps/QuestionStep";
import InputStep from "./game-steps/InputStep";
import BackgroundImages from "./BackgroundImages";
import GameHeader from "./GameHeader";
import StartScreen from "./StartScreen";
import { useToast } from "@/hooks/use-toast";
import { validateGameTheme, sanitizeText, logSecurityEvent } from "@/utils/securityUtils";

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

  const { toast } = useToast();

  const games = gameData.games as Game[];
  const steps = gameData.steps as GameStep[];
  const currentStep = steps[currentStepIndex];

  // Feedback de resposta
  const [showQuestionResult, setShowQuestionResult] = useState(false);
  const [lastQuestionCorrect, setLastQuestionCorrect] = useState<boolean | null>(null);

  // Removendo IA: sempre perguntas estáticas do game selecionado
  const getCurrentQuestion = () => {
    if (selectedGame && currentQuestionIndex < selectedGame.questions.length) {
      return selectedGame.questions[currentQuestionIndex];
    }
    return null;
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleStart = () => {
    setGameStarted(true);
    setCurrentStepIndex(0);
  };

  // Recomeçar limpa tudo
  const handleRestart = () => {
    setCurrentStepIndex(0);
    setCollectedWords([]);
    setSelectedGame(null);
    setGameStarted(false);
    setCurrentQuestionIndex(0);
    setShowQuestionResult(false);
    setLastQuestionCorrect(null);
  };

  const handleCorrectAnswer = () => {
    setLastQuestionCorrect(true);
    setShowQuestionResult(true);
    // Não avança pergunta aqui
  };

  const handleIncorrectAnswer = () => {
    setLastQuestionCorrect(false);
    setShowQuestionResult(true);
    // Não avança pergunta aqui
  };

  // Após feedback, avança corretamente
  const handleAdvanceAfterResult = () => {
    if (!selectedGame) return;

    if (lastQuestionCorrect) {
      const currentQuestion = getCurrentQuestion();
      if (currentQuestion && currentQuestion.word && !collectedWords.includes(currentQuestion.word)) {
        setCollectedWords([...collectedWords, currentQuestion.word]);
      }
    }

    if (currentQuestionIndex < selectedGame.questions.length - 1) {
      // Avança para a próxima pergunta
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowQuestionResult(false);
      setLastQuestionCorrect(null);
    } else {
      // Fim das perguntas desse bloco, avança para o próximo passo
      setShowQuestionResult(false);
      setLastQuestionCorrect(null);
      setCurrentQuestionIndex(0);
      setTimeout(() => {
        handleNext();
      }, 0);
    }
  };

  // Escolha de tema
  const handleThemeChoice = (theme: string) => {
    const sanitizedTheme = sanitizeText(theme);
    if (!validateGameTheme(sanitizedTheme)) {
      logSecurityEvent('Invalid theme choice', { theme, sanitizedTheme });
      toast({
        title: "❌ Tema inválido",
        description: "Por favor, escolha um tema válido.",
        variant: "destructive"
      });
      return;
    }
    let game: Game | null = null;
    if (sanitizedTheme.includes("Tanjiro")) {
      game = games.find(g => g.theme.includes("Tanjiro")) || null;
    } else if (sanitizedTheme.includes("Nezuko")) {
      game = games.find(g => g.theme.includes("Nezuko")) || null;
    } else if (sanitizedTheme.includes("Zenitsu")) {
      game = games.find(g => g.theme.includes("Zenitsu")) || null;
    } else if (sanitizedTheme.includes("Inosuke")) {
      game = games.find(g => g.theme.includes("Inosuke")) || null;
    }
    if (game) {
      setSelectedGame(game);
      setCurrentQuestionIndex(0);
      handleNext();
    }
  };

  const handlePasswordSubmit = (password: string) => {
    if (!selectedGame) return;
    const sanitizedPassword = sanitizeText(password);
    const correctPassword = collectedWords.join(" ");
    if (sanitizedPassword.trim().toLowerCase() === correctPassword.toLowerCase()) {
      handleNext();
    } else {
      logSecurityEvent('Incorrect password attempt', { expected: correctPassword.length });
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

  if (!gameStarted) {
    return (
      <StartScreen 
        title={gameData.title}
        description={gameData.description}
        onStart={handleStart}
      />
    );
  }

  // Página de confirmação pós resposta (feedback)
  const renderQuestionResultStep = () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return null;

    const word = currentQuestion.word;
    const isCorrect = lastQuestionCorrect;

    return (
      <div className="flex flex-col items-center py-12 gap-8">
        <div className="rounded-lg border-2 p-8 shadow bg-white/95">
          <h2 className="text-2xl font-bold mb-4">
            {isCorrect ? "🎉 Acertou!" : "❌ Errou!"}
          </h2>
          <p className="text-lg mb-4">
            {isCorrect
              ? <>Parabéns! A palavra secreta é <span className="font-extrabold">{word}</span>.</>
              : <>Ops! Resposta incorreta. Tente de novo ou avance.</>
            }
          </p>
        </div>
        <button
          onClick={handleAdvanceAfterResult}
          className={`bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 text-white rounded-full px-8 py-3 font-bold text-lg shadow-lg hover:scale-105 transition-all`}
        >
          {currentQuestionIndex < (selectedGame?.questions.length || 0) - 1
            ? "Próxima Pergunta"
            : "Avançar"}
        </button>
      </div>
    );
  };

  // Renderização dos passos
  const renderStep = () => {
    // Se for passo de pergunta e feedback ativado, mostra tela de confirmação
    if (currentStep.type === "question" && showQuestionResult) {
      return renderQuestionResultStep();
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
            onNext={handleNext}
            collectedWords={collectedWords}
            selectedGame={selectedGame}
          />
        );
      case "choice":
        return (
          <ChoiceStep 
            content={currentStep.content}
            choices={currentStep.choices || []}
            onChoice={currentStepIndex === 1 ? handleThemeChoice : 
                     currentStepIndex === steps.length - 1 ? handleFinalChoice : 
                     handleNext}
            selectedGame={selectedGame}
          />
        );
      case "question":
        const question = getCurrentQuestion();
        if (!question) {
          handleNext();
          return null;
        }
        return (
          <QuestionStep 
            content={question.content}
            choices={question.choices}
            answer={question.answer}
            correctResponse={`🎉 Excelente! A palavra secreta é **${question.word}**.`}
            incorrectResponse="❌ Resposta incorreta! Tente novamente."
            onCorrect={handleCorrectAnswer}
            onIncorrect={handleIncorrectAnswer}
            selectedGame={selectedGame}
            onRestart={handleRestart}
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
      {/* Security indicator */}
      <div className="absolute top-2 right-2 z-20">
        <div className="bg-green-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
          🛡️ Seguro
        </div>
      </div>

      <BackgroundImages selectedGame={selectedGame} />

      <GameHeader 
        currentStepIndex={currentStepIndex}
        totalSteps={steps.length}
        selectedGame={selectedGame}
        collectedWords={collectedWords}
      />

      {/* Main Game Content */}
      <Card className="bg-white/85 backdrop-blur-lg shadow-2xl border-2 border-white/60 relative z-10">
        <CardContent className="p-8">
          {renderStep()}
        </CardContent>
      </Card>

      {/* Restart Button */}
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
