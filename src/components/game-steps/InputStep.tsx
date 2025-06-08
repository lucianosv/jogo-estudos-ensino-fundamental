import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key, Sparkles } from "lucide-react";

interface InputStepProps {
  content: string;
  onSubmit: (value: string) => void;
  collectedWords: string[];
  selectedGame?: any;
}

const InputStep = ({ content, onSubmit, collectedWords, selectedGame }: InputStepProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = () => {
    onSubmit(inputValue);
  };

  const getThemeColors = () => {
    if (!selectedGame) {
      return {
        gradient: "from-yellow-500 to-orange-500",
        bg: "from-yellow-50 to-orange-50",
        border: "border-yellow-400",
        button: "from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
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
      gradient: "from-yellow-500 to-orange-500",
      bg: "from-yellow-50 to-orange-50",
      border: "border-yellow-400",
      button: "from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
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
          <Key className={`w-8 h-8 text-white drop-shadow-lg mr-2`} />
          <h2 className={`text-2xl font-bold text-white drop-shadow-lg`}>
            🔐 Senha Secreta
          </h2>
          <Key className={`w-8 h-8 text-white drop-shadow-lg ml-2`} />
        </div>

        <p className="text-xl text-white drop-shadow-lg mb-6 font-medium bg-black/30 backdrop-blur-sm p-4 rounded-lg">
          {content}
        </p>

        <div className={`bg-white/90 backdrop-blur-sm p-6 rounded-lg border-2 ${colors.border} mb-8 shadow-lg`}>
          <h3 className="font-bold text-gray-800 mb-4 text-lg">
            ✨ Use as palavras secretas que você coletou! ✨
          </h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {collectedWords.map((word, index) => (
              <span 
                key={index}
                className={`bg-gradient-to-r ${colors.gradient} text-white px-4 py-2 rounded-full text-sm font-bold shadow-md transform transition-all duration-200 hover:scale-105`}
              >
                {word}
              </span>
            ))}
          </div>
          <p className="text-gray-600 mt-4 text-sm">
            💡 Dica: Digite as palavras separadas por espaço, na ordem que coletou!
          </p>
        </div>

        <div className="flex gap-4 max-w-md mx-auto">
          <Input
            type="text"
            placeholder="Digite a senha completa..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            className="text-lg py-4 px-4 rounded-full border-2 shadow-md bg-white/90 backdrop-blur-sm"
          />
          <Button 
            onClick={handleSubmit}
            className={`bg-gradient-to-r ${colors.button} text-white font-semibold px-8 py-4 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105`}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Desbloquear
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InputStep;
