
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sword, Star, Sparkles, BookOpenCheck } from "lucide-react";

interface StartScreenProps {
  title: string;
  description: string;
  onStart: () => void;
}

const StartScreen = ({ title, description, onStart }: StartScreenProps) => {
  return (
    <Card className="w-full max-w-2xl mx-auto bg-white/95 backdrop-blur-sm shadow-2xl border-4 border-red-600 animate-scale-in">
      <CardHeader className="text-center bg-gradient-to-r from-red-600 via-orange-600 to-pink-600 text-white rounded-t-lg">
        <div className="flex items-center justify-center gap-3 mb-2">
          <BookOpenCheck className="w-8 h-8" />
          <CardTitle className="text-3xl font-bold tracking-wide">{title}</CardTitle>
          <Sword className="w-8 h-8" />
        </div>
        <p className="text-lg opacity-90 font-medium">{description}</p>
      </CardHeader>
      <CardContent className="p-8 text-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="mb-6">
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-6 h-6 text-yellow-500 fill-current animate-pulse" style={{animationDelay: `${star * 100}ms`}} />
            ))}
          </div>
          <div className="bg-white/80 p-6 rounded-lg border-2 border-orange-200 mb-6">
            <p className="text-gray-700 text-lg mb-4 font-medium">
              🌟 Prepare-se para uma jornada de conhecimento! 🌟
            </p>
            <p className="text-gray-600 text-base">
              Você está prestes a enfrentar desafios e provar sua sabedoria. Boa sorte!
            </p>
          </div>
        </div>
        <Button 
          onClick={onStart}
          className="bg-gradient-to-r from-red-600 via-orange-600 to-pink-600 hover:from-red-700 hover:via-orange-700 hover:to-pink-700 text-white font-bold py-4 px-10 text-xl rounded-full transform transition-all duration-200 hover:scale-105 shadow-lg"
        >
          <Sparkles className="w-6 h-6 mr-2" />
          Começar Aventura!
        </Button>
      </CardContent>
    </Card>
  );
};

export default StartScreen;
