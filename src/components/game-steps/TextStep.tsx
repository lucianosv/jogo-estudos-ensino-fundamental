
import { Button } from "@/components/ui/button";
import { Scroll, Sparkles } from "lucide-react";
import { GameParameters } from "@/components/GameSetup";
import { getDynamicTheme } from "@/utils/dynamicThemeUtils";

interface TextStepProps {
  content: string;
  onNext: () => void;
  collectedWords: string[];
  selectedGame?: any;
  gameParams?: GameParameters;
}

const TextStep = ({ content, onNext, collectedWords, selectedGame, gameParams }: TextStepProps) => {
  const formatContent = (text: string) => {
    return text.split('\n').map((line, index) => (
      <p key={index} className="mb-3 last:mb-0">
        {line.split('**').map((part, partIndex) => 
          partIndex % 2 === 1 ? (
            <strong key={partIndex} className={`font-bold text-lg ${
              gameParams ? `text-${getDynamicTheme(gameParams).colors.primary}` : 'text-red-600'
            }`}>{part}</strong>
          ) : (
            part
          )
        )}
      </p>
    ));
  };

  const dynamicTheme = gameParams ? getDynamicTheme(gameParams) : null;
  const colors = dynamicTheme ? {
    border: `border-${dynamicTheme.colors.primary}-400`,
    button: `bg-gradient-to-r ${dynamicTheme.colors.gradient} hover:opacity-90`
  } : {
    border: "border-amber-400",
    button: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
  };

  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-6">
        <Scroll className="w-8 h-8 text-gray-700 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">
          📜 História Épica
        </h2>
        <Scroll className="w-8 h-8 text-gray-700 ml-2" />
      </div>
      
      <div className={`text-lg leading-relaxed mb-8 text-left bg-white/95 backdrop-blur-sm p-6 rounded-lg border-l-4 ${colors.border} shadow-lg`}>
        <div className="text-gray-700">
          {formatContent(content)}
        </div>
      </div>

      <Button 
        onClick={onNext}
        className={`${colors.button} text-white font-semibold py-3 px-8 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105`}
      >
        <Sparkles className="w-5 h-5 mr-2" />
        Continuar Aventura
      </Button>
    </div>
  );
};

export default TextStep;
