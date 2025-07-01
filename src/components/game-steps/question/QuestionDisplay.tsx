
import { Brain } from "lucide-react";
import { GameParameters } from "@/components/GameSetup";
import { getDynamicTheme } from "@/utils/dynamicThemeUtils";

interface QuestionDisplayProps {
  content: string;
  borderColor: string;
  gameParams?: GameParameters;
}

const QuestionDisplay = ({ content, borderColor, gameParams }: QuestionDisplayProps) => {
  const dynamicTheme = gameParams ? getDynamicTheme(gameParams) : null;
  
  const challengeTitle = dynamicTheme?.terminology.challenge || 'Desafio Matemático';
  const challengeIcon = dynamicTheme?.icons.challenge || '⚡';
  
  return (
    <>
      <div className="flex items-center justify-center mb-6">
        <Brain className="w-8 h-8 text-gray-700 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">
          {challengeIcon} {challengeTitle}
        </h2>
        <Brain className="w-8 h-8 text-gray-700 ml-2" />
      </div>

      <div className={`bg-white/95 backdrop-blur-sm p-6 rounded-lg border-l-4 ${borderColor} mb-8 shadow-lg`}>
        <p className="text-xl text-gray-700 font-medium">{content}</p>
      </div>
    </>
  );
};

export default QuestionDisplay;
