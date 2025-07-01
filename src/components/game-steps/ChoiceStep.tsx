
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles } from "lucide-react";
import { GameParameters } from "@/components/GameSetup";
import { getDynamicTheme } from "@/utils/dynamicThemeUtils";

interface ChoiceStepProps {
  content: string;
  choices: string[];
  onChoice: (choice: string) => void;
  selectedGame?: any;
  gameParams?: GameParameters;
}

const ChoiceStep = ({ content, choices, onChoice, selectedGame, gameParams }: ChoiceStepProps) => {
  const dynamicTheme = gameParams ? getDynamicTheme(gameParams) : null;
  const colors = dynamicTheme ? {
    hover: `hover:bg-${dynamicTheme.colors.primary}-50 hover:border-${dynamicTheme.colors.primary}-400 hover:text-${dynamicTheme.colors.primary}-700`,
    gradient: `bg-gradient-to-r ${dynamicTheme.colors.gradient}`
  } : {
    hover: "hover:bg-green-50 hover:border-green-400 hover:text-green-700",
    gradient: "bg-gradient-to-r from-blue-500 to-purple-500"
  };

  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-6">
        <BookOpen className="w-8 h-8 text-gray-700 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">
          Escolha seu Destino
        </h2>
        <BookOpen className="w-8 h-8 text-gray-700 ml-2" />
      </div>

      <p className="text-xl text-gray-700 mb-8 font-medium bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-gray-200">
        {content}
      </p>

      {gameParams && (
        <div className={`mb-6 p-4 rounded-lg border-2 border-white/50 shadow-lg text-white ${colors.gradient}`}>
          <p className="font-bold text-lg">
            {dynamicTheme?.icons.subject} {gameParams.subject} - {gameParams.theme} {dynamicTheme?.icons.success}
          </p>
          <p className="text-sm opacity-90 mt-1">
            {gameParams.schoolGrade} | {dynamicTheme?.terminology.quest || 'Aventura Personalizada'}
          </p>
        </div>
      )}

      <div className="space-y-4">
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
  );
};

export default ChoiceStep;
