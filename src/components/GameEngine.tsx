import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import gameData from "@/data/demon-slayer-math-game.json";
import TextStep from "./game-steps/TextStep";
import ChoiceStep from "./game-steps/ChoiceStep";
import QuestionStep from "./game-steps/QuestionStep";
import InputStep from "./game-steps/InputStep";
import { Sword, Star, Sparkles } from "lucide-react";

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

  const games = gameData.games as Game[];
  const steps = gameData.steps as GameStep[];
  const currentStep = steps[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleStart = () => {
    setGameStarted(true);
    setCurrentStepIndex(0);
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setCollectedWords([]);
    setSelectedGame(null);
    setGameStarted(false);
    setCurrentQuestionIndex(0);
  };

  const handleCorrectAnswer = (word: string) => {
    setCollectedWords([...collectedWords, word]);
    
    if (currentQuestionIndex < 3) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      handleNext();
    } else {
      // Finished all questions, go to summary
      handleNext();
    }
  };

  const handleThemeChoice = (theme: string) => {
    let game: Game | null = null;
    
    // Improved game selection logic
    if (theme.includes("Tanjiro")) {
      game = games.find(g => g.theme.includes("Tanjiro")) || null;
    } else if (theme.includes("Nezuko")) {
      game = games.find(g => g.theme.includes("Nezuko")) || null;
    } else if (theme.includes("Zenitsu")) {
      game = games.find(g => g.theme.includes("Zenitsu")) || null;
    } else if (theme.includes("Inosuke")) {
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
    
    const correctPassword = selectedGame.password.join(" ");
    if (password.trim().toLowerCase() === correctPassword.toLowerCase()) {
      handleNext();
    } else {
      alert("Senha incorreta! Use as palavras que você coletou na ordem correta.");
    }
  };

  const handleFinalChoice = (choice: string) => {
    if (choice.includes("Sim")) {
      handleRestart();
    } else {
      alert("🌸 Obrigado por jogar! Até a próxima aventura! 🌸");
    }
  };

  // Get current question data
  const getCurrentQuestion = () => {
    if (!selectedGame || currentQuestionIndex >= selectedGame.questions.length) {
      return null;
    }
    return selectedGame.questions[currentQuestionIndex];
  };

  // Get dynamic background
  const getBackgroundStyle = () => {
    if (selectedGame) {
      return {
        background: selectedGame.background,
      };
    }
    return {};
  };

  if (!gameStarted) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-white/95 backdrop-blur-sm shadow-2xl border-4 border-red-600">
        <CardHeader className="text-center bg-gradient-to-r from-red-600 via-orange-600 to-pink-600 text-white rounded-t-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sword className="w-8 h-8 animate-pulse" />
            <CardTitle className="text-3xl font-bold tracking-wide">{gameData.title}</CardTitle>
            <Sword className="w-8 h-8 animate-pulse" />
          </div>
          <p className="text-lg opacity-90 font-medium">{gameData.description}</p>
        </CardHeader>
        <CardContent className="p-8 text-center bg-gradient-to-br from-orange-50 to-red-50">
          <div className="mb-6">
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4].map((star) => (
                <Star key={star} className="w-6 h-6 text-yellow-500 fill-current animate-pulse" />
              ))}
            </div>
            <div className="bg-white/80 p-6 rounded-lg border-2 border-orange-200 mb-6">
              <p className="text-gray-700 text-lg mb-4 font-medium">
                🗾 Entre no mundo dos Caçadores de Demônios! 🗾
              </p>
              <p className="text-gray-600 text-base">
                Escolha seu herói favorito e resolva desafios matemáticos únicos com cada personagem!
              </p>
            </div>
          </div>
          <Button 
            onClick={handleStart}
            className="bg-gradient-to-r from-red-600 via-orange-600 to-pink-600 hover:from-red-700 hover:via-orange-700 hover:to-pink-700 text-white font-bold py-4 px-10 text-xl rounded-full transform transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <Sparkles className="w-6 h-6 mr-2" />
            Começar Aventura!
          </Button>
        </CardContent>
      </Card>
    );
  }

  const renderStep = () => {
    switch (currentStep.type) {
      case "text":
        let content = currentStep.content;
        
        // Replace story placeholder with selected game story
        if (content.includes("[STORY_PLACEHOLDER]") && selectedGame) {
          content = content.replace(
            "[STORY_PLACEHOLDER]", 
            `**${selectedGame.story.title}**\n\n${selectedGame.story.content}`
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
        if (!question) return null;
        
        return (
          <QuestionStep 
            content={question.content}
            choices={question.choices}
            answer={question.answer}
            correctResponse={`🎉 Excelente! A palavra secreta é **${question.word}**.`}
            incorrectResponse="❌ Resposta incorreta! Tente novamente."
            onCorrect={handleCorrectAnswer}
            onIncorrect={() => {}}
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
    <div className="w-full max-w-3xl mx-auto" style={getBackgroundStyle()}>
      {/* Progress Bar */}
      <div className="mb-6 bg-white/30 rounded-full p-1 backdrop-blur-sm">
        <div 
          className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 h-4 rounded-full transition-all duration-500 shadow-lg"
          style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Selected Game Display */}
      {selectedGame && (
        <Card className="mb-6 border-2 border-white/50 shadow-xl" style={{ background: `${selectedGame.background}15` }}>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-white" />
              <span className="font-bold text-white text-lg drop-shadow-md">
                Aventura Atual: {selectedGame.theme}
              </span>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Collected Words Display */}
      {collectedWords.length > 0 && (
        <Card className="mb-6 bg-gradient-to-r from-yellow-100 via-orange-100 to-pink-100 border-2 border-yellow-400 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <Star className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">Palavras Secretas:</span>
              {collectedWords.map((word, index) => (
                <span key={index} className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full font-bold text-sm border border-yellow-400">
                  {word}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Game Content */}
      <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-white/50">
        <CardContent className="p-8">
          {renderStep()}
        </CardContent>
      </Card>

      {/* Restart Button */}
      {currentStepIndex === steps.length - 1 && (
        <div className="mt-6 text-center">
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
