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
        gradient: "from-amber-500 to-orange-500",
        bg: "from-amber-50 to-orange-50",
        border: "border-amber-400",
        button: "from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      };
    }

    if (selectedGame.theme.includes("Tanjiro")) {
      return {
        gradient: "from-blue-500 to-teal-500",
        bg: "from-blue-50 to-teal-50",
        border: "border-blue-400",
        button: "from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
      };
    } else if (selectedGame.theme.includes("Nezuko")) {
      return {
        gradient: "from-pink-500 to-rose-500",
        bg: "from-pink-50 to-rose-50",
        border: "border-pink-400",
        button: "from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
      };
    } else if (selectedGame.theme.includes("Zenitsu")) {
      return {
        gradient: "from-yellow-500 to-amber-500",
        bg: "from-yellow-50 to-amber-50",
        border: "border-yellow-400",
        button: "from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700"
      };
    } else if (selectedGame.theme.includes("Inosuke")) {
      return {
        gradient: "from-green-500 to-emerald-500",
        bg: "from-green-50 to-emerald-50",
        border: "border-green-400",
        button: "from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
      };
    }

    return {
      gradient: "from-amber-500 to-orange-500",
      bg: "from-amber-50 to-orange-50",
      border: "border-amber-400",
      button: "from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
    };
  };

  const getBackgroundImages = () => {
    return {
      left: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
      right: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"
    };
  };

  const colors = getThemeColors();
  const backgroundImages = getBackgroundImages();

  return (
    <div className="text-center relative overflow-hidden rounded-lg min-h-[600px]">
      {/* Background Images */}
      <div 
        className="absolute top-0 left-0 w-32 h-full opacity-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImages.left})` }}
      />
      <div 
        className="absolute top-0 right-0 w-32 h-full opacity-20 bg-cover bg-center transform scale-x-[-1]"
        style={{ backgroundImage: `url(${backgroundImages.right})` }}
      />
      <div 
        className="absolute bottom-0 left-32 right-32 h-24 opacity-15 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImages.left})` }}
      />
      
      {/* Main gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-80`}></div>
      
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-center mb-6">
          <Scroll className={`w-8 h-8 text-white drop-shadow-lg mr-2`} />
          <h2 className={`text-2xl font-bold text-white drop-shadow-lg`}>
            📜 História Épica
          </h2>
          <Scroll className={`w-8 h-8 text-white drop-shadow-lg ml-2`} />
        </div>
        
        <div className={`text-lg leading-relaxed mb-8 text-left bg-white/90 backdrop-blur-sm p-6 rounded-lg border-l-4 ${colors.border} shadow-lg`}>
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
    </div>
  );
};

export default TextStep;
