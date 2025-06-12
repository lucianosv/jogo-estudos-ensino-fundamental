
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getThemeColors } from "./question/ThemeUtils";
import QuestionDisplay from "./question/QuestionDisplay";
import ChoiceButtons from "./question/ChoiceButtons";
import ResultDisplay from "./question/ResultDisplay";

interface QuestionStepProps {
  content: string;
  choices: string[];
  answer: string;
  correctResponse: string;
  incorrectResponse: string;
  onCorrect: (word: string) => void;
  onIncorrect: () => void;
  selectedGame?: any;
}

const QuestionStep = ({ 
  content, 
  choices, 
  answer, 
  correctResponse, 
  incorrectResponse, 
  onCorrect, 
  onIncorrect,
  selectedGame 
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

    const correct = selectedAnswer === answer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      toast({
        title: "🎉 Resposta Correta!",
        description: correctResponse.replace(/\*\*/g, ""),
      });
      
      // Show continue button after a short delay for correct answers
      setTimeout(() => {
        setShowContinueButton(true);
      }, 1500);
    } else {
      toast({
        title: "❌ Resposta Incorreta",
        description: incorrectResponse,
        variant: "destructive"
      });
      
      // Show continue button immediately for incorrect answers
      setTimeout(() => {
        setShowContinueButton(true);
      }, 1500);
    }
  };

  const handleContinue = () => {
    if (isCorrect) {
      // Extract the word from the correct response
      const wordMatch = correctResponse.match(/\*\*(.*?)\*\*/);
      const word = wordMatch ? wordMatch[1] : "";
      onCorrect(word);
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
    <div className="text-center">
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
