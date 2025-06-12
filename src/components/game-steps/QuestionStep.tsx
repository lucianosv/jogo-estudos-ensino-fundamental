
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
  const [showContinueButton, setShowContinueButton] = useState(false);
  const { toast } = useToast();

  // Reset state when content changes (new question)
  useEffect(() => {
    setSelectedAnswer("");
    setShowResult(false);
    setIsCorrect(false);
    setShowContinueButton(false);
  }, [content]);

  const getThemeColors = () => {
    if (!selectedGame) {
      return {
        gradient: "from-purple-500 to-pink-500",
        border: "border-purple-400",
        button: "bg-purple-600 text-white hover:bg-purple-700",
        buttonHover: "hover:bg-purple-50 hover:border-purple-400 hover:text-purple-700"
      };
    }

    if (selectedGame.theme.includes("Tanjiro")) {
      return {
        gradient: "from-blue-500 to-teal-500",
        border: "border-blue-400",
        button: "bg-blue-600 text-white hover:bg-blue-700",
        buttonHover: "hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700"
      };
    } else if (selectedGame.theme.includes("Nezuko")) {
      return {
        gradient: "from-pink-500 to-rose-500",
        border: "border-pink-400",
        button: "bg-pink-600 text-white hover:bg-pink-700",
        buttonHover: "hover:bg-pink-50 hover:border-pink-400 hover:text-pink-700"
      };
    } else if (selectedGame.theme.includes("Zenitsu")) {
      return {
        gradient: "from-yellow-500 to-amber-500",
        border: "border-yellow-400",
        button: "bg-yellow-600 text-white hover:bg-yellow-700",
        buttonHover: "hover:bg-yellow-50 hover:border-yellow-400 hover:text-yellow-700"
      };
    } else if (selectedGame.theme.includes("Inosuke")) {
      return {
        gradient: "from-green-500 to-emerald-500",
        border: "border-green-400",
        button: "bg-green-600 text-white hover:bg-green-700",
        buttonHover: "hover:bg-green-50 hover:border-green-400 hover:text-green-700"
      };
    }

    return {
      gradient: "from-purple-500 to-pink-500",
      border: "border-purple-400",
      button: "bg-purple-600 text-white hover:bg-purple-700",
      buttonHover: "hover:bg-purple-50 hover:border-purple-400 hover:text-purple-700"
    };
  };

  const colors = getThemeColors();

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
      
      // Show continue button after a short delay for correct answers
      setTimeout(() => {
        setShowContinueButton(true);
      }, 1500);
    } else {
      toast({
        title: "❌ Resposta Incorreta",
        description: incorrectResponse,
        variant: "destructive"
      });
      
      // Show continue button immediately for incorrect answers
      setTimeout(() => {
        setShowContinueButton(true);
      }, 1500);
    }
  };

  const handleContinue = () => {
    if (isCorrect) {
      // Extract the word from the correct response
      const wordMatch = correctResponse.match(/\*\*(.*?)\*\*/);
      const word = wordMatch ? wordMatch[1] : "";
      onCorrect(word);
    } else {
      onIncorrect();
    }
  };

  const handleTryAgain = () => {
    setSelectedAnswer("");
    setShowResult(false);
    setIsCorrect(false);
    setShowContinueButton(false);
  };

  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-6">
        <Brain className="w-8 h-8 text-gray-700 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">
          ⚔️ Desafio Matemático
        </h2>
        <Brain className="w-8 h-8 text-gray-700 ml-2" />
      </div>

      <div className={`bg-white/95 backdrop-blur-sm p-6 rounded-lg border-l-4 ${colors.border} mb-8 shadow-lg`}>
        <p className="text-xl text-gray-700 font-medium">{content}</p>
      </div>

      {!showResult && (
        <>
          <div className="space-y-4 mb-8">
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
        <div className="text-center">
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

          {showContinueButton && (
            <div className="space-y-4">
              <Button 
                onClick={handleContinue}
                className={`bg-gradient-to-r ${colors.gradient} hover:opacity-90 text-white font-semibold py-3 px-8 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105`}
              >
                {isCorrect ? "✨ Continuar Aventura" : "➡️ Próxima Pergunta"}
              </Button>
              
              {!isCorrect && (
                <Button 
                  onClick={handleTryAgain}
                  variant="outline"
                  className="bg-white/90 hover:bg-white border-2 border-gray-300 text-gray-600 hover:text-gray-700 font-medium py-2 px-6 rounded-full"
                >
                  🔄 Tentar Novamente
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionStep;
