
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
    if (!selectedGame) {
      return {
        left: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600",
        right: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600",
        bottom: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800"
      };
    }
    
    if (selectedGame.theme.includes("Tanjiro")) {
      return {
        left: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600", // Samurai com katana
        right: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=600", // Guerreiro em ação
        bottom: "https://images.unsplash.com/photo-1528164344705-47542687000d?w=800" // Montanhas japonesas
      };
    } else if (selectedGame.theme.includes("Nezuko")) {
      return {
        left: "https://images.unsplash.com/photo-1528164344705-47542687000d?w=600", // Flor de cerejeira
        right: "https://images.unsplash.com/photo-1520637836862-4d197d17c55a?w=600", // Kimono japonês
        bottom: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800" // Lua cheia
      };
    } else if (selectedGame.theme.includes("Zenitsu")) {
      return {
        left: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600", // Raio dourado
        right: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600", // Montanha com raios
        bottom: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800" // Tempestade elétrica
      };
    } else if (selectedGame.theme.includes("Inosuke")) {
      return {
        left: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600", // Floresta selvagem
        right: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600", // Montanha rochosa
        bottom: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800" // Paisagem montanhosa
      };
    }
    
    return {
      left: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600",
      right: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600",
      bottom: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800"
    };
  };

  const colors = getThemeColors();
  const backgroundImages = getBackgroundImages();

  return (
    <div className="text-center relative overflow-hidden rounded-lg min-h-[600px]">
      {/* Background Images - Laterais mais visíveis */}
      <div 
        className="absolute top-0 left-0 w-48 h-full opacity-40 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImages.left})` }}
      />
      <div 
        className="absolute top-0 right-0 w-48 h-full opacity-40 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImages.right})` }}
      />
      
      {/* Fundo inferior mais visível */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 opacity-30 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImages.bottom})` }}
      />
      
      {/* Fundo superior */}
      <div 
        className="absolute top-0 left-48 right-48 h-24 opacity-25 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImages.bottom})` }}
      />
      
      {/* Main gradient background - mais transparente */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-60`}></div>
      
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-center mb-6">
          <BookOpen className={`w-8 h-8 text-white drop-shadow-lg mr-2`} />
          <h2 className={`text-2xl font-bold text-white drop-shadow-lg`}>
            Escolha seu Destino
          </h2>
          <BookOpen className={`w-8 h-8 text-white drop-shadow-lg ml-2`} />
        </div>

        <p className="text-xl text-white drop-shadow-lg mb-8 font-medium bg-black/40 backdrop-blur-sm p-4 rounded-lg mx-12">
          {content}
        </p>

        {selectedGame && (
          <div className={`mb-6 p-4 bg-gradient-to-r ${colors.gradient} rounded-lg border-2 border-white/50 shadow-lg mx-12`}>
            <p className="text-white font-bold text-lg drop-shadow-md">
              ⚔️ Herói Selecionado: {selectedGame.theme} ⚔️
            </p>
          </div>
        )}

        <div className="space-y-4 mx-12">
          {choices.map((choice, index) => (
            <Button
              key={index}
              onClick={() => onChoice(choice)}
              variant="outline"
              className={`w-full py-4 px-6 text-lg font-medium border-2 bg-white/95 backdrop-blur-sm ${colors.hover} transition-all duration-200 transform hover:scale-105 shadow-md rounded-full`}
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
