
// Smart container for QuestionStep
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getThemeColors } from "./question/ThemeUtils";
import QuestionStepContainer from "./QuestionStepContainer";

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
  onRestart,
}: QuestionStepProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const { toast } = useToast();

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
        variant: "destructive",
      });
      return;
    }
    const correct = selectedAnswer === answer;
    setIsCorrect(correct);
    setShowResult(true);

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
    <QuestionStepContainer
      showRestart={!!onRestart}
      onRestart={onRestart}
      questionContent={content}
      borderColor={colors.border}
      showResult={showResult}
      showContinueButton={showContinueButton}
      choices={choices}
      selectedAnswer={selectedAnswer}
      onAnswerSelect={setSelectedAnswer}
      onSubmit={handleSubmit}
      colors={colors}
      isCorrect={isCorrect}
      correctResponse={correctResponse}
      incorrectResponse={incorrectResponse}
      onContinue={handleContinue}
      onTryAgain={handleTryAgain}
    />
  );
};

export default QuestionStep;
