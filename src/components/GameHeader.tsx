
import { Card, CardContent } from "@/components/ui/card";
import { Star, Sparkles } from "lucide-react";
import { GameParameters } from "./GameSetup";
import { getDynamicTheme, getSubjectIcon } from "@/utils/dynamicThemeUtils";

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
  gameParams?: GameParameters;
}

const GameHeader = ({ currentStepIndex, totalSteps, selectedGame, collectedWords, gameParams }: GameHeaderProps) => {
  const dynamicTheme = gameParams ? getDynamicTheme(gameParams) : null;
  const subjectIcon = gameParams ? getSubjectIcon(gameParams.subject) : '📖';

  return (
    <div className="relative z-10">
      {/* Progress Bar */}
      <div className="mb-6 bg-white/30 rounded-full p-1 backdrop-blur-sm">
        <div 
          className={`h-4 rounded-full transition-all duration-500 shadow-lg ${
            dynamicTheme 
              ? `bg-gradient-to-r ${dynamicTheme.colors.gradient}` 
              : 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500'
          }`}
          style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Game Info Display */}
      {gameParams && (
        <Card className="mb-6 border-2 border-white/50 shadow-xl bg-white/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">{subjectIcon}</span>
              <span className="font-bold text-white text-lg drop-shadow-md">
                {gameParams.subject} - {gameParams.theme}
              </span>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="text-white/80 text-sm">
              <span className="bg-white/20 px-2 py-1 rounded-full">
                Série: {gameParams.schoolGrade}
              </span>
              {gameParams.themeDetails && (
                <span className="ml-2 bg-white/20 px-2 py-1 rounded-full">
                  {dynamicTheme?.terminology.quest || 'Aventura Personalizada'}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Collected Words Display */}
      {collectedWords.length > 0 && (
        <Card className={`mb-6 shadow-lg bg-opacity-95 backdrop-blur-sm ${
          dynamicTheme 
            ? `bg-gradient-to-r from-${dynamicTheme.colors.primary}-100 via-${dynamicTheme.colors.secondary}-100 to-${dynamicTheme.colors.accent}-100 border-2 border-${dynamicTheme.colors.primary}-400`
            : 'bg-gradient-to-r from-yellow-100 via-orange-100 to-pink-100 border-2 border-yellow-400'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <Star className={`w-5 h-5 ${dynamicTheme ? `text-${dynamicTheme.colors.primary}` : 'text-yellow-600'}`} />
              <span className={`font-semibold ${dynamicTheme ? `text-${dynamicTheme.colors.primary}-800` : 'text-yellow-800'}`}>
                {dynamicTheme?.terminology.reward || 'Palavras Secretas'}:
              </span>
              {collectedWords.map((word, index) => (
                <span 
                  key={index} 
                  className={`px-3 py-1 rounded-full font-bold text-sm border ${
                    dynamicTheme 
                      ? `bg-${dynamicTheme.colors.primary}-200 text-${dynamicTheme.colors.primary}-800 border-${dynamicTheme.colors.primary}-400`
                      : 'bg-yellow-200 text-yellow-800 border-yellow-400'
                  }`}
                >
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
