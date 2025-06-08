import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Brain, CheckCircle, XCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuestionStepProps {
  content: string;
  choices: string[];
  answer: string;
  correctResponse: string;
  incorrectResponse: string;
  onCorrect: (word: string) => void;
  onIncorrect: () => void;
  selectedGame?: any;
}

const QuestionStep = ({ 
  content, 
  choices, 
  answer, 
  correctResponse, 
  incorrectResponse, 
  onCorrect, 
  onIncorrect,
  selectedGame 
}: QuestionStepProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const { toast } = useToast();

  // Reset state when content changes (new question)
  useEffect(() => {
    setSelectedAnswer("");
    setShowResult(false);
    setIsCorrect(false);
  }, [content]);

  const getThemeColors = () => {
    if (!selectedGame) {
      return {
        gradient: "from-purple-500 to-pink-500",
        bg: "from-purple-50 to-pink-50",
        border: "border-purple-400",
        button: "bg-purple-600 text-white hover:bg-purple-700",
        buttonHover: "hover:bg-purple-50 hover:border-purple-400 hover:text-purple-700"
      };
    }

    if (selectedGame.theme.includes("Tanjiro")) {
      return {
        gradient: "from-blue-500 to-teal-500",
        bg: "from-blue-50 to-teal-50",
        border: "border-blue-400",
        button: "bg-blue-600 text-white hover:bg-blue-700",
        buttonHover: "hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700"
      };
    } else if (selectedGame.theme.includes("Nezuko")) {
      return {
        gradient: "from-pink-500 to-rose-500",
        bg: "from-pink-50 to-rose-50",
        border: "border-pink-400",
        button: "bg-pink-600 text-white hover:bg-pink-700",
        buttonHover: "hover:bg-pink-50 hover:border-pink-400 hover:text-pink-700"
      };
    } else if (selectedGame.theme.includes("Zenitsu")) {
      return {
        gradient: "from-yellow-500 to-amber-500",
        bg: "from-yellow-50 to-amber-50",
        border: "border-yellow-400",
        button: "bg-yellow-600 text-white hover:bg-yellow-700",
        buttonHover: "hover:bg-yellow-50 hover:border-yellow-400 hover:text-yellow-700"
      };
    } else if (selectedGame.theme.includes("Inosuke")) {
      return {
        gradient: "from-green-500 to-emerald-500",
        bg: "from-green-50 to-emerald-50",
        border: "border-green-400",
        button: "bg-green-600 text-white hover:bg-green-700",
        buttonHover: "hover:bg-green-50 hover:border-green-400 hover:text-green-700"
      };
    }

    return {
      gradient: "from-purple-500 to-pink-500",
      bg: "from-purple-50 to-pink-50",
      border: "border-purple-400",
      button: "bg-purple-600 text-white hover:bg-purple-700",
      buttonHover: "hover:bg-purple-50 hover:border-purple-400 hover:text-purple-700"
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

  const handleSubmit = () => {
    if (!selectedAnswer) {
      toast({
        title: "⚠️ Selecione uma resposta",
        description: "Por favor, escolha uma das opções antes de continuar.",
        variant: "destructive"
      });
      return;
    }

    const correct = selectedAnswer === answer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      // Extract the word from the correct response (between ** **)
      const wordMatch = correctResponse.match(/\*\*(.*?)\*\*/);
      const word = wordMatch ? wordMatch[1] : "";
      
      toast({
        title: "🎉 Resposta Correta!",
        description: correctResponse.replace(/\*\*/g, ""),
      });
      
      setTimeout(() => {
        onCorrect(word);
      }, 2000);
    } else {
      toast({
        title: "❌ Resposta Incorreta",
        description: incorrectResponse,
        variant: "destructive"
      });
      onIncorrect();
    }
  };

  const handleTryAgain = () => {
    setSelectedAnswer("");
    setShowResult(false);
    setIsCorrect(false);
  };

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
          <Brain className={`w-8 h-8 text-white drop-shadow-lg mr-2`} />
          <h2 className={`text-2xl font-bold text-white drop-shadow-lg`}>
            ⚔️ Desafio Matemático
          </h2>
          <Brain className={`w-8 h-8 text-white drop-shadow-lg ml-2`} />
        </div>

        <div className={`bg-white/95 backdrop-blur-sm p-6 rounded-lg border-l-4 ${colors.border} mb-8 shadow-lg mx-12`}>
          <p className="text-xl text-gray-700 font-medium">{content}</p>
        </div>

        {!showResult && (
          <>
            <div className="space-y-4 mb-8 mx-12">
              {choices.map((choice, index) => (
                <Button
                  key={index}
                  onClick={() => setSelectedAnswer(choice)}
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
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className={`bg-gradient-to-r ${colors.gradient} hover:opacity-90 text-white font-semibold py-3 px-8 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105`}
            >
              ⚔️ Confirmar Resposta
            </Button>
          </>
        )}

        {showResult && (
          <div className="text-center mx-12">
            <div className={`p-6 rounded-lg mb-6 border-2 shadow-lg bg-white/95 backdrop-blur-sm ${
              isCorrect 
                ? "border-green-300" 
                : "border-red-300"
            }`}>
              <div className="flex items-center justify-center mb-4">
                {isCorrect ? (
                  <CheckCircle className="w-12 h-12 text-green-600 animate-pulse" />
                ) : (
                  <XCircle className="w-12 h-12 text-red-600" />
                )}
              </div>
              <p className={`text-lg font-medium ${
                isCorrect ? "text-green-800" : "text-red-800"
              }`}>
                {isCorrect ? correctResponse.replace(/\*\*/g, "") : incorrectResponse}
              </p>
            </div>

            {!isCorrect && (
              <Button 
                onClick={handleTryAgain}
                className={`bg-gradient-to-r ${colors.gradient} hover:opacity-90 text-white font-semibold py-3 px-8 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105`}
              >
                🔄 Tentar Novamente
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionStep;
