
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuestionDisplay from "./question/QuestionDisplay";
import ChoiceButtons from "./question/ChoiceButtons";
import { GameParameters } from "@/components/GameSetup";

interface QuestionStepContainerProps {
  showRestart: boolean;
  onRestart?: () => void;
  questionContent: string;
  borderColor: string;
  choices: string[];
  selectedAnswer: string;
  onAnswerSelect: (answer: string) => void;
  onSubmit: () => void;
  colors: {
    button: string;
    buttonHover: string;
    gradient: string;
    border: string;
  };
  gameParams?: GameParameters;
}

const QuestionStepContainer = ({
  showRestart,
  onRestart,
  questionContent,
  borderColor,
  choices,
  selectedAnswer,
  onAnswerSelect,
  onSubmit,
  colors,
  gameParams,
}: QuestionStepContainerProps) => {
  return (
    <div className="text-center relative">
      {showRestart && onRestart && (
        <div className="absolute top-0 right-0 z-10">
          <Button
            onClick={onRestart}
            variant="outline"
            className="bg-white/90 border-2 border-red-500 text-red-600 hover:text-red-700 font-bold px-4 py-2 rounded-full shadow transition-all flex items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Reiniciar Jogo</span>
          </Button>
        </div>
      )}
      <QuestionDisplay 
        content={questionContent} 
        borderColor={borderColor} 
        gameParams={gameParams}
      />
      <ChoiceButtons
        choices={choices}
        selectedAnswer={selectedAnswer}
        onAnswerSelect={onAnswerSelect}
        onSubmit={onSubmit}
        colors={colors}
      />
    </div>
  );
};

export default QuestionStepContainer;
