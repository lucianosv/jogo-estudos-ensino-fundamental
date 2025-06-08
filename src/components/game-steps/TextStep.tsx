
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
      
      {/* Main gradient background - mais transparente para mostrar as imagens */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-60`}></div>
      
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-center mb-6">
          <Scroll className={`w-8 h-8 text-white drop-shadow-lg mr-2`} />
          <h2 className={`text-2xl font-bold text-white drop-shadow-lg`}>
            📜 História Épica
          </h2>
          <Scroll className={`w-8 h-8 text-white drop-shadow-lg ml-2`} />
        </div>
        
        <div className={`text-lg leading-relaxed mb-8 text-left bg-white/95 backdrop-blur-sm p-6 rounded-lg border-l-4 ${colors.border} shadow-lg mx-12`}>
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
