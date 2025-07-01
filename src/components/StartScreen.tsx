
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sword, Star, Sparkles, BookOpenCheck } from "lucide-react";
import { GameParameters } from "./GameSetup";
import { getDynamicTheme, getSubjectIcon } from "@/utils/dynamicThemeUtils";

interface StartScreenProps {
  title: string;
  description: string;
  onStart: () => void;
  gameParams?: GameParameters;
}

const StartScreen = ({ title, description, onStart, gameParams }: StartScreenProps) => {
  const dynamicTheme = gameParams ? getDynamicTheme(gameParams) : null;
  const subjectIcon = gameParams ? getSubjectIcon(gameParams.subject) : '📖';

  return (
    <Card className={`w-full max-w-2xl mx-auto bg-white/95 backdrop-blur-sm shadow-2xl border-4 animate-scale-in ${
      dynamicTheme ? `border-${dynamicTheme.colors.primary}` : 'border-red-600'
    }`}>
      <CardHeader className={`text-center text-white rounded-t-lg ${
        dynamicTheme 
          ? `bg-gradient-to-r ${dynamicTheme.colors.gradient}`
          : 'bg-gradient-to-r from-red-600 via-orange-600 to-pink-600'
      }`}>
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-3xl">{subjectIcon}</span>
          <CardTitle className="text-3xl font-bold tracking-wide">{title}</CardTitle>
          <Sword className="w-8 h-8" />
        </div>
        <p className="text-lg opacity-90 font-medium">{description}</p>
        {gameParams && (
          <div className="mt-2 text-sm opacity-80">
            <span className="bg-white/20 px-3 py-1 rounded-full mr-2">
              {gameParams.schoolGrade}
            </span>
            {gameParams.themeDetails && (
              <span className="bg-white/20 px-3 py-1 rounded-full">
                {dynamicTheme?.terminology.quest || 'Aventura Personalizada'}
              </span>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className={`p-8 text-center ${
        dynamicTheme 
          ? `bg-gradient-to-br from-${dynamicTheme.colors.primary}-50 to-${dynamicTheme.colors.secondary}-50`
          : 'bg-gradient-to-br from-orange-50 to-red-50'
      }`}>
        <div className="mb-6">
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={`w-6 h-6 fill-current animate-pulse ${
                dynamicTheme ? `text-${dynamicTheme.colors.accent}` : 'text-yellow-500'
              }`} style={{animationDelay: `${star * 100}ms`}} />
            ))}
          </div>
          <div className={`bg-white/80 p-6 rounded-lg border-2 mb-6 ${
            dynamicTheme ? `border-${dynamicTheme.colors.primary}-200` : 'border-orange-200'
          }`}>
            <p className="text-gray-700 text-lg mb-4 font-medium">
              {dynamicTheme?.icons.subject} Prepare-se para uma jornada de conhecimento! {dynamicTheme?.icons.success}
            </p>
            <p className="text-gray-600 text-base">
              Você está prestes a enfrentar {dynamicTheme?.terminology.challenge.toLowerCase() || 'desafios'} e provar sua sabedoria. Boa sorte!
            </p>
          </div>
        </div>
        <Button 
          onClick={onStart}
          className={`text-white font-bold py-4 px-10 text-xl rounded-full transform transition-all duration-200 hover:scale-105 shadow-lg ${
            dynamicTheme 
              ? `bg-gradient-to-r ${dynamicTheme.colors.gradient} hover:opacity-90`
              : 'bg-gradient-to-r from-red-600 via-orange-600 to-pink-600 hover:from-red-700 hover:via-orange-700 hover:to-pink-700'
          }`}
        >
          <Sparkles className="w-6 h-6 mr-2" />
          Começar Aventura!
        </Button>
      </CardContent>
    </Card>
  );
};

export default StartScreen;
