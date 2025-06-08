
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles } from "lucide-react";

interface ChoiceStepProps {
  content: string;
  choices: string[];
  onChoice: (choice: string) => void;
  selectedGame?: any;
}

const ChoiceStep = ({ content, choices, onChoice, selectedGame }: ChoiceStepProps) => {
  const getThemeColors = () => {
    if (selectedGame) {
      if (selectedGame.theme.includes("Tanjiro")) {
        return {
          gradient: "from-blue-500 to-teal-500",
          hover: "hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700"
        };
      } else if (selectedGame.theme.includes("Nezuko")) {
        return {
          gradient: "from-pink-500 to-rose-500",
          hover: "hover:bg-pink-50 hover:border-pink-400 hover:text-pink-700"
        };
      } else if (selectedGame.theme.includes("Zenitsu")) {
        return {
          gradient: "from-yellow-500 to-amber-500",
          hover: "hover:bg-yellow-50 hover:border-yellow-400 hover:text-yellow-700"
        };
      } else if (selectedGame.theme.includes("Inosuke")) {
        return {
          gradient: "from-green-500 to-emerald-500",
          hover: "hover:bg-green-50 hover:border-green-400 hover:text-green-700"
        };
      }
    }

    return {
      gradient: "from-green-500 to-emerald-500",
      hover: "hover:bg-green-50 hover:border-green-400 hover:text-green-700"
    };
  };

  const getBackgroundImages = () => {
    if (!selectedGame) return {};
    
    if (selectedGame.theme.includes("Tanjiro")) {
      return {
        left: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400", // Samurai/warrior
        right: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"
      };
    } else if (selectedGame.theme.includes("Nezuko")) {
      return {
        left: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        right: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"
      };
    } else if (selectedGame.theme.includes("Zenitsu")) {
      return {
        left: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        right: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"
      };
    } else if (selectedGame.theme.includes("Inosuke")) {
      return {
        left: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        right: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"
      };
    }
    
    return {};
  };

  const colors = getThemeColors();
  const backgroundImages = getBackgroundImages();

  return (
    <div className="text-center relative overflow-hidden rounded-lg min-h-[600px]">
      {/* Background Images */}
      {backgroundImages.left && (
        <>
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
        </>
      )}
      
      {/* Main gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-80`}></div>
      
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-center mb-6">
          <BookOpen className={`w-8 h-8 text-white drop-shadow-lg mr-2`} />
          <h2 className={`text-2xl font-bold text-white drop-shadow-lg`}>
            Escolha seu Destino
          </h2>
          <BookOpen className={`w-8 h-8 text-white drop-shadow-lg ml-2`} />
        </div>

        <p className="text-xl text-white drop-shadow-lg mb-8 font-medium bg-black/30 backdrop-blur-sm p-4 rounded-lg">
          {content}
        </p>

        {selectedGame && (
          <div className={`mb-6 p-4 bg-gradient-to-r ${colors.gradient} rounded-lg border-2 border-white/50 shadow-lg`}>
            <p className="text-white font-bold text-lg drop-shadow-md">
              ⚔️ Herói Selecionado: {selectedGame.theme} ⚔️
            </p>
          </div>
        )}

        <div className="space-y-4">
          {choices.map((choice, index) => (
            <Button
              key={index}
              onClick={() => onChoice(choice)}
              variant="outline"
              className={`w-full py-4 px-6 text-lg font-medium border-2 bg-white/90 backdrop-blur-sm ${colors.hover} transition-all duration-200 transform hover:scale-105 shadow-md rounded-full`}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {choice}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChoiceStep;
