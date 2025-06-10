
import { Card, CardContent } from "@/components/ui/card";
import { Star, Sparkles } from "lucide-react";

interface Game {
  theme: string;
  background: string;
  password: string[];
  story: {
    title: string;
    content: string;
  };
  questions: Array<{
    content: string;
    choices: string[];
    answer: string;
    word: string;
  }>;
}

interface GameHeaderProps {
  currentStepIndex: number;
  totalSteps: number;
  selectedGame?: Game | null;
  collectedWords: string[];
}

const GameHeader = ({ currentStepIndex, totalSteps, selectedGame, collectedWords }: GameHeaderProps) => {
  return (
    <div className="relative z-10">
      {/* Progress Bar */}
      <div className="mb-6 bg-white/30 rounded-full p-1 backdrop-blur-sm">
        <div 
          className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 h-4 rounded-full transition-all duration-500 shadow-lg"
          style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Selected Game Display */}
      {selectedGame && (
        <Card className="mb-6 border-2 border-white/50 shadow-xl bg-white/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-white" />
              <span className="font-bold text-white text-lg drop-shadow-md">
                Aventura Atual: {selectedGame.theme}
              </span>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Collected Words Display */}
      {collectedWords.length > 0 && (
        <Card className="mb-6 bg-gradient-to-r from-yellow-100 via-orange-100 to-pink-100 border-2 border-yellow-400 shadow-lg bg-opacity-95 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <Star className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">Palavras Secretas:</span>
              {collectedWords.map((word, index) => (
                <span key={index} className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full font-bold text-sm border border-yellow-400">
                  {word}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GameHeader;
