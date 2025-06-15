
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

interface ResultDisplayProps {
  isCorrect: boolean;
  correctResponse: string;
  incorrectResponse: string;
  showContinueButton: boolean;
  onContinue: () => void;
  onTryAgain: () => void;
  colors: {
    gradient: string;
  };
}

const ResultDisplay = ({
  isCorrect,
  correctResponse,
  incorrectResponse,
  onContinue,
  onTryAgain,
  colors
}: ResultDisplayProps) => {
  return (
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

      <div className="space-y-4">
        {isCorrect ? (
          <Button 
            onClick={onContinue}
            className={`bg-gradient-to-r ${colors.gradient} hover:opacity-90 text-white font-semibold py-3 px-8 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105`}
          >
            ✨ Continuar Aventura
          </Button>
        ) : (
          <Button 
            onClick={onTryAgain}
            variant="outline"
            className="bg-white/90 hover:bg-white border-2 border-gray-300 text-gray-600 hover:text-gray-700 font-medium py-2 px-6 rounded-full"
          >
            🔄 Tentar Novamente
          </Button>
        )}
      </div>
    </div>
  );
};

export default ResultDisplay;
