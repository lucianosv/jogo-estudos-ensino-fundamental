
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getThemeColors } from "./question/ThemeUtils";
import QuestionStepContainer from "./QuestionStepContainer";

interface QuestionStepProps {
  content: string;
  choices: string[];
  answer: string;
  onCorrect: () => void;
  onIncorrect: () => void;
  selectedGame?: any;
  onRestart?: () => void;
}

const QuestionStep = ({
  content,
  choices,
  answer,
  onCorrect,
  onIncorrect,
  selectedGame,
  onRestart,
}: QuestionStepProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    setSelectedAnswer("");
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
    if (correct) {
      onCorrect();
    } else {
      onIncorrect();
    }
  };

  return (
    <QuestionStepContainer
      showRestart={!!onRestart}
      onRestart={onRestart}
      questionContent={content}
      borderColor={colors.border}
      choices={choices}
      selectedAnswer={selectedAnswer}
      onAnswerSelect={setSelectedAnswer}
      onSubmit={handleSubmit}
      colors={colors}
    />
  );
};

export default QuestionStep;
