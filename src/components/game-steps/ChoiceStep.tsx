
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

interface ChoiceStepProps {
  content: string;
  choices: string[];
  onChoice: (choice: string) => void;
  selectedTheme?: string;
}

const ChoiceStep = ({ content, choices, onChoice, selectedTheme }: ChoiceStepProps) => {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-6">
        <BookOpen className="w-8 h-8 text-green-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">Escolha</h2>
      </div>

      <p className="text-xl text-gray-700 mb-8">{content}</p>

      {selectedTheme && (
        <div className="mb-6 p-4 bg-green-100 rounded-lg border border-green-300">
          <p className="text-green-800 font-semibold">Tema selecionado: {selectedTheme}</p>
        </div>
      )}

      <div className="space-y-4">
        {choices.map((choice, index) => (
          <Button
            key={index}
            onClick={() => onChoice(choice)}
            variant="outline"
            className="w-full py-4 text-lg font-medium hover:bg-green-50 hover:border-green-400 hover:text-green-700 transition-all duration-200"
          >
            {choice}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ChoiceStep;
