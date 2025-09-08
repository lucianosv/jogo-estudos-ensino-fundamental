// COMPONENTE DE NOTIFICAÇÃO AMIGÁVEL PARA FALLBACKS
// Informa o usuário quando conteúdo alternativo está sendo usado

import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, BookOpen, Star, Heart } from 'lucide-react';

interface FallbackNotificationProps {
  type: 'question' | 'story';
  source: 'database' | 'intelligent' | 'thematic' | 'emergency';
  show: boolean;
  onClose?: () => void;
}

const FallbackNotification: React.FC<FallbackNotificationProps> = ({
  type,
  source,
  show,
  onClose
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!visible) return null;

  const getNotificationContent = () => {
    const icons = {
      database: <BookOpen className="h-4 w-4" />,
      intelligent: <Sparkles className="h-4 w-4" />,
      thematic: <Star className="h-4 w-4" />,
      emergency: <Heart className="h-4 w-4" />
    };

    const messages = {
      question: {
        database: "🎉 Carregando questão especial da nossa biblioteca!",
        intelligent: "✨ Preparando uma questão inteligente para você!",
        thematic: "🌟 Questão temática exclusiva chegando!",
        emergency: "💖 Conteúdo educativo de reserva carregado!"
      },
      story: {
        database: "📚 História especial da biblioteca educativa!",
        intelligent: "🎭 Narrativa inteligente sendo preparada!",
        thematic: "🌈 História temática personalizada!",
        emergency: "🏆 Aventura educativa de emergência!"
      }
    };

    const descriptions = {
      database: "Conteúdo curado especialmente para sua série e matéria",
      intelligent: "Gerado com inteligência adaptativa ao seu nível",
      thematic: "Personalizado para o tema escolhido",
      emergency: "Conteúdo educativo sempre disponível"
    };

    return {
      icon: icons[source],
      message: messages[type][source],
      description: descriptions[source]
    };
  };

  const content = getNotificationContent();

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg max-w-sm">
        <div className="flex items-center gap-2">
          <div className="text-blue-600">
            {content.icon}
          </div>
          <div className="flex-1">
            <AlertDescription className="font-medium text-blue-800 text-sm">
              {content.message}
            </AlertDescription>
            <AlertDescription className="text-blue-600 text-xs mt-1">
              {content.description}
            </AlertDescription>
          </div>
        </div>
      </Alert>
    </div>
  );
};

export default FallbackNotification;