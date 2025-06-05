
import { Button } from "@/components/ui/button";
import { Scroll } from "lucide-react";

interface TextStepProps {
  content: string;
  onNext: () => void;
  collectedWords: string[];
}

const TextStep = ({ content, onNext, collectedWords }: TextStepProps) => {
  const formatContent = (text: string) => {
    return text.split('\n').map((line, index) => (
      <p key={index} className="mb-3 last:mb-0">
        {line.split('**').map((part, partIndex) => 
          partIndex % 2 === 1 ? (
            <strong key={partIndex} className="text-red-600 font-bold">{part}</strong>
          ) : (
            part
          )
        )}
      </p>
    ));
  };

  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-6">
        <Scroll className="w-8 h-8 text-amber-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">História</h2>
      </div>
      
      <div className="text-lg text-gray-700 leading-relaxed mb-8 text-left bg-amber-50 p-6 rounded-lg border-l-4 border-amber-400">
        {formatContent(content)}
      </div>

      <Button 
        onClick={onNext}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8"
      >
        Continuar
      </Button>
    </div>
  );
};

export default TextStep;
