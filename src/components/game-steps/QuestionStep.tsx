
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Brain, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuestionStepProps {
  content: string;
  choices: string[];
  answer: string;
  correctResponse: string;
  incorrectResponse: string;
  onCorrect: (word: string) => void;
  onIncorrect: () => void;
}

const QuestionStep = ({ 
  content, 
  choices, 
  answer, 
  correctResponse, 
  incorrectResponse, 
  onCorrect, 
  onIncorrect 
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

  const handleSubmit = () => {
    if (!selectedAnswer) {
      toast({
        title: "Selecione uma resposta",
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
        title: "Resposta Correta! 🎉",
        description: correctResponse.replace(/\*\*/g, ""),
      });
      
      setTimeout(() => {
        onCorrect(word);
      }, 2000);
    } else {
      toast({
        title: "Resposta Incorreta 😔",
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
    <div className="text-center">
      <div className="flex items-center justify-center mb-6">
        <Brain className="w-8 h-8 text-purple-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">Desafio Matemático</h2>
      </div>

      <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-400 mb-8">
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
                className={`w-full py-4 text-lg font-medium transition-all duration-200 ${
                  selectedAnswer === choice 
                    ? "bg-purple-600 text-white hover:bg-purple-700" 
                    : "hover:bg-purple-50 hover:border-purple-400 hover:text-purple-700"
                }`}
              >
                {choice}
              </Button>
            ))}
          </div>

          <Button 
            onClick={handleSubmit}
            disabled={!selectedAnswer}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-8"
          >
            Confirmar Resposta
          </Button>
        </>
      )}

      {showResult && (
        <div className="text-center">
          <div className={`p-6 rounded-lg mb-6 ${
            isCorrect 
              ? "bg-green-50 border border-green-200" 
              : "bg-red-50 border border-red-200"
          }`}>
            <div className="flex items-center justify-center mb-4">
              {isCorrect ? (
                <CheckCircle className="w-12 h-12 text-green-600" />
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
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8"
            >
              Tentar Novamente
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionStep;
