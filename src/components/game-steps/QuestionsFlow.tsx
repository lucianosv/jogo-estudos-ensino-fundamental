
import { useState } from "react";
import QuestionStep from "./QuestionStep";

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

  if (!questions || questions.length === 0) {
    return <div className="text-center py-12">Nenhuma pergunta disponível.</div>;
  }

  // Página de feedback após resposta
  if (showResult) {
    return (
      <div className="flex flex-col items-center py-12 gap-8">
        <div className="rounded-lg border-2 p-8 shadow bg-white/95">
          <h2 className="text-2xl font-bold mb-4">
            {wasCorrect ? "🎉 Acertou!" : "❌ Errou!"}
          </h2>
          <p className="text-lg mb-4">
            {wasCorrect
              ? <>Parabéns! A palavra secreta é <span className="font-extrabold">{questions[currentIndex].word}</span>.</>
              : <>Ops! Resposta incorreta. Tente de novo ou avance.</>
            }
          </p>
        </div>
        <button
          onClick={nextQuestion}
          className={`bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 text-white rounded-full px-8 py-3 font-bold text-lg shadow-lg hover:scale-105 transition-all`}
        >
          {currentIndex < questions.length - 1
            ? "Próxima Pergunta"
            : "Avançar"}
        </button>
      </div>
    );
  }

  // Pergunta atual
  const thisQuestion = questions[currentIndex];

  return (
    <QuestionStep
      content={thisQuestion.content}
      choices={thisQuestion.choices}
      answer={thisQuestion.answer}
      correctResponse={`🎉 Excelente! A palavra secreta é **${thisQuestion.word}**.`}
      incorrectResponse="❌ Resposta incorreta! Tente novamente."
      onCorrect={handleCorrect}
      onIncorrect={handleIncorrect}
      selectedGame={selectedGame}
      onRestart={onRestart}
    />
  );
};

export default QuestionsFlow;

