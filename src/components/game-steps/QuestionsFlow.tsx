
import { useState } from "react";
import QuestionStep from "./QuestionStep";
import ResultDisplay from "./question/ResultDisplay";
import { getThemeColors } from "./question/ThemeUtils";

interface Question {
  content: string;
  choices: string[];
  answer: string;
  word: string;
}

interface QuestionsFlowProps {
  questions: Question[];
  onCollectWord: (word: string) => void;
  onFinish: () => void;
  selectedGame: any;
  onRestart: () => void;
}

const QuestionsFlow = ({
  questions,
  onCollectWord,
  onFinish,
  selectedGame,
  onRestart,
}: QuestionsFlowProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);

  const handleCorrect = () => {
    setWasCorrect(true);
    setShowResult(true);
    onCollectWord(questions[currentIndex].word);
  };

  const handleIncorrect = () => {
    setWasCorrect(false);
    setShowResult(true);
  };

  const nextQuestion = () => {
    setShowResult(false);
    setWasCorrect(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onFinish();
    }
  };

  const tryAgain = () => {
    setShowResult(false);
    setWasCorrect(null);
  };

  if (!questions || questions.length === 0) {
    return <div className="text-center py-12">Nenhuma pergunta disponível.</div>;
  }

  const colors = getThemeColors(selectedGame);

  // Página de feedback após resposta
  if (showResult) {
    const correctResponse = `🎉 Excelente! A palavra secreta é **${questions[currentIndex].word}**.`;
    const incorrectResponse = "❌ Resposta incorreta! Tente novamente.";

    return (
      <ResultDisplay
        isCorrect={wasCorrect!}
        correctResponse={correctResponse}
        incorrectResponse={incorrectResponse}
        showContinueButton={true}
        onContinue={nextQuestion}
        onTryAgain={tryAgain}
        colors={colors}
      />
    );
  }

  // Pergunta atual
  const thisQuestion = questions[currentIndex];

  return (
    <QuestionStep
      content={thisQuestion.content}
      choices={thisQuestion.choices}
      answer={thisQuestion.answer}
      onCorrect={handleCorrect}
      onIncorrect={handleIncorrect}
      selectedGame={selectedGame}
      onRestart={onRestart}
    />
  );
};

export default QuestionsFlow;
