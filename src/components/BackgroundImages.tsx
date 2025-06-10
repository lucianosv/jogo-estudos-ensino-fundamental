
import { getBackgroundImages, getThemeColors } from "@/utils/themeUtils";

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

interface BackgroundImagesProps {
  selectedGame?: Game | null;
}

const BackgroundImages = ({ selectedGame }: BackgroundImagesProps) => {
  if (!selectedGame) return null;

  const backgroundImages = getBackgroundImages(selectedGame);
  const colors = getThemeColors(selectedGame);

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Imagem lateral esquerda */}
      <div 
        className="absolute top-0 left-0 w-72 h-full opacity-70 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImages.left})` }}
      />
      
      {/* Imagem lateral direita */}
      <div 
        className="absolute top-0 right-0 w-72 h-full opacity-70 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImages.right})` }}
      />
      
      {/* Imagem inferior */}
      <div 
        className="absolute bottom-0 left-72 right-72 h-48 opacity-60 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImages.bottom})` }}
      />
      
      {/* Imagem superior */}
      <div 
        className="absolute top-0 left-72 right-72 h-32 opacity-50 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImages.bottom})` }}
      />
      
      {/* Gradient overlay para melhorar legibilidade */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-20`}></div>
    </div>
  );
};

export default BackgroundImages;
