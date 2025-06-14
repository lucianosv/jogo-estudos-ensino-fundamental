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
  onRestart?: () => void; // Adicionando o novo prop opcional
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
    console.log('QuestionStep: New question loaded, resetting state');
    console.log('Question content:', content);
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

    console.log('=== QUESTION STEP SUBMIT ===');
    console.log('Selected answer:', selectedAnswer);
    console.log('Correct answer:', answer);
    
    const correct = selectedAnswer === answer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      console.log('Answer is correct!');
      toast({
        title: "🎉 Resposta Correta!",
        description: correctResponse.replace(/\*\*/g, ""),
      });
    } else {
      console.log('Answer is incorrect!');
      toast({
        title: "❌ Resposta Incorreta",
        description: incorrectResponse,
        variant: "destructive"
      });
    }
    
    // Show continue button after a short delay
    setTimeout(() => {
      setShowContinueButton(true);
    }, 1500);
  };

  const handleContinue = () => {
    console.log('=== QUESTION STEP CONTINUE ===');
    console.log('Is correct:', isCorrect);
    
    if (isCorrect) {
      console.log('Calling onCorrect callback');
      onCorrect();
    } else {
      console.log('Calling onIncorrect callback');
      onIncorrect();
    }
  };

  const handleTryAgain = () => {
    console.log('QuestionStep: Try again clicked - resetting question state');
    setSelectedAnswer("");
    setShowResult(false);
    setIsCorrect(false);
    setShowContinueButton(false);
  };

  return (
    <div className="text-center relative">
      {/* Botão de reiniciar jogo sempre visível nas perguntas */}
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
