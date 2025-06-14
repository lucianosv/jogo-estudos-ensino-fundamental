
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getThemeColors } from "./question/ThemeUtils";
import QuestionDisplay from "./question/QuestionDisplay";
import ChoiceButtons from "./question/ChoiceButtons";
import ResultDisplay from "./question/ResultDisplay";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuestionStepProps {
  content: string;
  choices: string[];
  answer: string;
  correctResponse: string;
  incorrectResponse: string;
  onCorrect: () => void;
  onIncorrect: () => void;
  selectedGame?: any;
  onRestart?: () => void;
}

const QuestionStep = ({ 
  content, 
  choices, 
  answer, 
  correctResponse, 
  incorrectResponse, 
  onCorrect, 
  onIncorrect,
  selectedGame,
  onRestart
}: QuestionStepProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const { toast } = useToast();

  // Reset state when content changes (new question)
  useEffect(() => {
    setSelectedAnswer("");
    setShowResult(false);
    setIsCorrect(false);
    setShowContinueButton(false);
  }, [content]);

  const colors = getThemeColors(selectedGame);

  const handleSubmit = () => {
    if (!selectedAnswer) {
      toast({
        title: "⚠️ Selecione uma resposta",
        description: "Por favor, escolha uma das opções antes de continuar.",
        variant: "destructive"
      });
      return;
    }

    // Não mostrar pop-up de feedback aqui:
    const correct = selectedAnswer === answer;
    setIsCorrect(correct);
    setShowResult(true);

    // Removidas chamadas toast de feedback
    setTimeout(() => {
      setShowContinueButton(true);
    }, 1500);
  };

  const handleContinue = () => {
    if (isCorrect) {
      onCorrect();
    } else {
      onIncorrect();
    }
  };

  const handleTryAgain = () => {
    setSelectedAnswer("");
    setShowResult(false);
    setIsCorrect(false);
    setShowContinueButton(false);
  };

  return (
    <div className="text-center relative">
      {onRestart && (
        <div className="absolute top-0 right-0 z-10">
          <Button
            onClick={onRestart}
            variant="outline"
            className="bg-white/90 border-2 border-red-500 text-red-600 hover:text-red-700 font-bold px-4 py-2 rounded-full shadow transition-all flex items-center gap-2"
            title="Reiniciar Jogo"
          >
            <RefreshCcw className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Reiniciar Jogo</span>
          </Button>
        </div>
      )}
      
      <QuestionDisplay content={content} borderColor={colors.border} />

      {!showResult && (
        <ChoiceButtons
          choices={choices}
          selectedAnswer={selectedAnswer}
          onAnswerSelect={setSelectedAnswer}
          onSubmit={handleSubmit}
          colors={colors}
        />
      )}

      {showResult && (
        <ResultDisplay
          isCorrect={isCorrect}
          correctResponse={correctResponse}
          incorrectResponse={incorrectResponse}
          showContinueButton={showContinueButton}
          onContinue={handleContinue}
          onTryAgain={handleTryAgain}
          colors={colors}
        />
      )}
    </div>
  );
};

export default QuestionStep;
