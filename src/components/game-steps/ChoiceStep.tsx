
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles } from "lucide-react";

interface ChoiceStepProps {
  content: string;
  choices: string[];
  onChoice: (choice: string) => void;
  selectedGame?: any;
}

const ChoiceStep = ({ content, choices, onChoice, selectedGame }: ChoiceStepProps) => {
  const getThemeColors = () => {
    if (selectedGame) {
      if (selectedGame.theme.includes("Tanjiro")) {
        return {
          gradient: "from-blue-500 to-teal-500",
          hover: "hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700"
        };
      } else if (selectedGame.theme.includes("Nezuko")) {
        return {
          gradient: "from-pink-500 to-rose-500",
          hover: "hover:bg-pink-50 hover:border-pink-400 hover:text-pink-700"
        };
      } else if (selectedGame.theme.includes("Zenitsu")) {
        return {
          gradient: "from-yellow-500 to-amber-500",
          hover: "hover:bg-yellow-50 hover:border-yellow-400 hover:text-yellow-700"
        };
      } else if (selectedGame.theme.includes("Inosuke")) {
        return {
          gradient: "from-green-500 to-emerald-500",
          hover: "hover:bg-green-50 hover:border-green-400 hover:text-green-700"
        };
      }
    }

    return {
      gradient: "from-green-500 to-emerald-500",
      hover: "hover:bg-green-50 hover:border-green-400 hover:text-green-700"
    };
  };

  const colors = getThemeColors();

  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-6">
        <BookOpen className={`w-8 h-8 text-transparent bg-gradient-to-r ${colors.gradient} bg-clip-text mr-2`} />
        <h2 className={`text-2xl font-bold text-transparent bg-gradient-to-r ${colors.gradient} bg-clip-text`}>
          Escolha seu Destino
        </h2>
        <BookOpen className={`w-8 h-8 text-transparent bg-gradient-to-r ${colors.gradient} bg-clip-text ml-2`} />
      </div>

      <p className="text-xl text-gray-700 mb-8 font-medium">{content}</p>

      {selectedGame && (
        <div className={`mb-6 p-4 bg-gradient-to-r ${colors.gradient} rounded-lg border-2 border-white/50 shadow-lg`}>
          <p className="text-white font-bold text-lg drop-shadow-md">
            ⚔️ Herói Selecionado: {selectedGame.theme} ⚔️
          </p>
        </div>
      )}

      <div className="space-y-4">
        {choices.map((choice, index) => (
          <Button
            key={index}
            onClick={() => onChoice(choice)}
            variant="outline"
            className={`w-full py-4 px-6 text-lg font-medium border-2 ${colors.hover} transition-all duration-200 transform hover:scale-105 shadow-md rounded-full`}
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
