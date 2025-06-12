
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface ChoiceButtonsProps {
  choices: string[];
  selectedAnswer: string;
  onAnswerSelect: (answer: string) => void;
  onSubmit: () => void;
  colors: {
    button: string;
    buttonHover: string;
    gradient: string;
  };
}

const ChoiceButtons = ({ 
  choices, 
  selectedAnswer, 
  onAnswerSelect, 
  onSubmit, 
  colors 
}: ChoiceButtonsProps) => {
  return (
    <>
      <div className="space-y-4 mb-8">
        {choices.map((choice, index) => (
          <Button
            key={index}
            onClick={() => onAnswerSelect(choice)}
            variant={selectedAnswer === choice ? "default" : "outline"}
            className={`w-full py-4 text-lg font-medium transition-all duration-200 rounded-full border-2 transform hover:scale-105 bg-white/95 backdrop-blur-sm ${
              selectedAnswer === choice 
                ? colors.button
                : colors.buttonHover
            }`}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {choice}
          </Button>
        ))}
      </div>

      <Button 
        onClick={onSubmit}
        disabled={!selectedAnswer}
        className={`bg-gradient-to-r ${colors.gradient} hover:opacity-90 text-white font-semibold py-3 px-8 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105`}
      >
        ⚔️ Confirmar Resposta
      </Button>
    </>
  );
};

export default ChoiceButtons;
