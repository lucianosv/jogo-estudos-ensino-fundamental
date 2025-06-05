
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key } from "lucide-react";

interface InputStepProps {
  content: string;
  onSubmit: (value: string) => void;
  collectedWords: string[];
}

const InputStep = ({ content, onSubmit, collectedWords }: InputStepProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = () => {
    onSubmit(inputValue);
  };

  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-6">
        <Key className="w-8 h-8 text-yellow-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">Senha Secreta</h2>
      </div>

      <p className="text-xl text-gray-700 mb-6">{content}</p>

      <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 mb-8">
        <h3 className="font-semibold text-yellow-800 mb-3">Dica: Use as palavras que você coletou!</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {collectedWords.map((word, index) => (
            <span 
              key={index}
              className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium"
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-4 max-w-md mx-auto">
        <Input
          type="text"
          placeholder="Digite a senha completa..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          className="text-lg py-3"
        />
        <Button 
          onClick={handleSubmit}
          className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold px-6"
        >
          Desbloquear
        </Button>
      </div>
    </div>
  );
};

export default InputStep;
