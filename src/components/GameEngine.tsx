
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import gameData from "@/data/demon-slayer-math-game.json";
import TextStep from "./game-steps/TextStep";
import ChoiceStep from "./game-steps/ChoiceStep";
import QuestionStep from "./game-steps/QuestionStep";
import InputStep from "./game-steps/InputStep";
import { Sword, Star } from "lucide-react";

interface GameStep {
  type: "text" | "choice" | "question" | "input";
  content: string;
  choices?: string[];
  answer?: string;
  correct_response?: string;
  incorrect_response?: string;
}

const GameEngine = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [collectedWords, setCollectedWords] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [gameStarted, setGameStarted] = useState(false);

  const currentStep = gameData.steps[currentStepIndex] as GameStep;

  const handleNext = () => {
    if (currentStepIndex < gameData.steps.length - 1) {
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
    setSelectedTheme("");
    setGameStarted(false);
  };

  const handleCorrectAnswer = (word: string) => {
    setCollectedWords([...collectedWords, word]);
    handleNext();
  };

  const handleThemeChoice = (theme: string) => {
    setSelectedTheme(theme);
    handleNext();
  };

  const handlePasswordSubmit = (password: string) => {
    const correctPassword = "Tanjiro Nichirin Hashira Nezuko";
    if (password.trim().toLowerCase() === correctPassword.toLowerCase()) {
      handleNext();
    } else {
      alert("Senha incorreta! Tente novamente.");
    }
  };

  if (!gameStarted) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-white/95 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-t-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sword className="w-8 h-8" />
            <CardTitle className="text-3xl font-bold">{gameData.title}</CardTitle>
            <Sword className="w-8 h-8" />
          </div>
          <p className="text-lg opacity-90">{gameData.description}</p>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4].map((star) => (
                <Star key={star} className="w-6 h-6 text-yellow-500 fill-current" />
              ))}
            </div>
            <p className="text-gray-600 text-lg mb-6">
              Teste seus conhecimentos matemáticos com os personagens de Demon Slayer!
            </p>
          </div>
          <Button 
            onClick={handleStart}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-3 px-8 text-lg"
          >
            Começar Aventura!
          </Button>
        </CardContent>
      </Card>
    );
  }

  const renderStep = () => {
    switch (currentStep.type) {
      case "text":
        return (
          <TextStep 
            content={currentStep.content} 
            onNext={handleNext}
            collectedWords={collectedWords}
          />
        );
      case "choice":
        return (
          <ChoiceStep 
            content={currentStep.content}
            choices={currentStep.choices || []}
            onChoice={currentStepIndex === 1 ? handleThemeChoice : handleNext}
            selectedTheme={selectedTheme}
          />
        );
      case "question":
        return (
          <QuestionStep 
            content={currentStep.content}
            choices={currentStep.choices || []}
            answer={currentStep.answer || ""}
            correctResponse={currentStep.correct_response || ""}
            incorrectResponse={currentStep.incorrect_response || ""}
            onCorrect={handleCorrectAnswer}
            onIncorrect={() => {}}
          />
        );
      case "input":
        return (
          <InputStep 
            content={currentStep.content}
            onSubmit={handlePasswordSubmit}
            collectedWords={collectedWords}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6 bg-white/20 rounded-full p-1">
        <div 
          className="bg-gradient-to-r from-red-500 to-orange-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${((currentStepIndex + 1) / gameData.steps.length) * 100}%` }}
        />
      </div>

      {/* Collected Words Display */}
      {collectedWords.length > 0 && (
        <Card className="mb-6 bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-400">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">Palavras coletadas:</span>
              <span className="text-yellow-700">{collectedWords.join(" • ")}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Game Content */}
      <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
        <CardContent className="p-8">
          {renderStep()}
        </CardContent>
      </Card>

      {/* Restart Button */}
      {currentStepIndex === gameData.steps.length - 1 && (
        <div className="mt-6 text-center">
          <Button 
            onClick={handleRestart}
            variant="outline"
            className="bg-white/90 hover:bg-white border-2 border-red-500 text-red-600 hover:text-red-700"
          >
            Jogar Novamente
          </Button>
        </div>
      )}
    </div>
  );
};

export default GameEngine;
