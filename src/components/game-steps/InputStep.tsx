
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key, Sparkles } from "lucide-react";
import { GameParameters } from "@/components/GameSetup";
import { getDynamicTheme } from "@/utils/dynamicThemeUtils";

interface InputStepProps {
  content: string;
  onSubmit: (value: string) => void;
  collectedWords: string[];
  selectedGame?: any;
  gameParams?: GameParameters;
}

const InputStep = ({ content, onSubmit, collectedWords, selectedGame, gameParams }: InputStepProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = () => {
    onSubmit(inputValue);
  };

  const dynamicTheme = gameParams ? getDynamicTheme(gameParams) : null;
  const colors = dynamicTheme ? {
    gradient: dynamicTheme.colors.gradient,
    border: `border-${dynamicTheme.colors.primary}-400`,
    button: `bg-gradient-to-r ${dynamicTheme.colors.gradient} hover:opacity-90`
  } : {
    gradient: "from-yellow-500 to-orange-500",
    border: "border-yellow-400",
    button: "bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
  };

  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-6">
        <Key className="w-8 h-8 text-gray-700 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">
          🔐 Senha Secreta
        </h2>
        <Key className="w-8 h-8 text-gray-700 ml-2" />
      </div>

      <p className="text-xl text-gray-700 mb-6 font-medium bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-gray-200">
        {content}
      </p>

      <div className={`bg-white/95 backdrop-blur-sm p-6 rounded-lg border-2 ${colors.border} mb-8 shadow-lg`}>
        <h3 className="font-bold text-gray-800 mb-4 text-lg">
          ✨ Use {dynamicTheme?.terminology.reward.toLowerCase() || 'as palavras secretas'} que você coletou! ✨
        </h3>
        <div className="flex flex-wrap gap-3 justify-center">
          {collectedWords.map((word, index) => (
            <span 
              key={index}
              className={`text-white px-4 py-2 rounded-full text-sm font-bold shadow-md transform transition-all duration-200 hover:scale-105 bg-gradient-to-r ${colors.gradient}`}
            >
              {word}
            </span>
          ))}
        </div>
        <p className="text-gray-600 mt-4 text-sm">
          💡 Dica: Digite as palavras separadas por espaço, na ordem que coletou!
        </p>
      </div>

      <div className="flex gap-4 max-w-md mx-auto">
        <Input
          type="text"
          placeholder="Digite a senha completa..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          className="text-lg py-4 px-4 rounded-full border-2 shadow-md bg-white/95 backdrop-blur-sm"
        />
        <Button 
          onClick={handleSubmit}
          className={`${colors.button} text-white font-semibold px-8 py-4 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105`}
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Desbloquear
        </Button>
      </div>
    </div>
  );
};

export default InputStep;
