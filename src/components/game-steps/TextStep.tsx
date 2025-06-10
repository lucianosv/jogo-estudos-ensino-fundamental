
import { Button } from "@/components/ui/button";
import { Scroll, Sparkles } from "lucide-react";

interface TextStepProps {
  content: string;
  onNext: () => void;
  collectedWords: string[];
  selectedGame?: any;
}

const TextStep = ({ content, onNext, collectedWords, selectedGame }: TextStepProps) => {
  const formatContent = (text: string) => {
    return text.split('\n').map((line, index) => (
      <p key={index} className="mb-3 last:mb-0">
        {line.split('**').map((part, partIndex) => 
          partIndex % 2 === 1 ? (
            <strong key={partIndex} className="text-red-600 font-bold text-lg">{part}</strong>
          ) : (
            part
          )
        )}
      </p>
    ));
  };

  const getThemeColors = () => {
    if (!selectedGame) {
      return {
        border: "border-amber-400",
        button: "from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      };
    }

    if (selectedGame.theme.includes("Tanjiro")) {
      return {
        border: "border-blue-400",
        button: "from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
      };
    } else if (selectedGame.theme.includes("Nezuko")) {
      return {
        border: "border-pink-400",
        button: "from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
      };
    } else if (selectedGame.theme.includes("Zenitsu")) {
      return {
        border: "border-yellow-400",
        button: "from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700"
      };
    } else if (selectedGame.theme.includes("Inosuke")) {
      return {
        border: "border-green-400",
        button: "from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
      };
    }

    return {
      border: "border-amber-400",
      button: "from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
    };
  };

  const colors = getThemeColors();

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
        className={`bg-gradient-to-r ${colors.button} text-white font-semibold py-3 px-8 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105`}
      >
        <Sparkles className="w-5 h-5 mr-2" />
        Continuar Aventura
      </Button>
    </div>
  );
};

export default TextStep;
