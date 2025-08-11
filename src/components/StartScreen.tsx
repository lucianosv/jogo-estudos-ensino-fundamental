
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sword, Star, Sparkles, Loader2, CheckCircle } from "lucide-react";
import { GameParameters } from "./GameSetup";
import { getDynamicTheme, getSubjectIcon } from "@/utils/dynamicThemeUtils";
import { useAIContent } from "@/hooks/useAIContent";
import { useToast } from "@/hooks/use-toast";
import { validateQuestionUniqueness, logQuestionDetails } from "@/utils/antiDuplicationValidator";

interface StartScreenProps {
  title: string;
  description: string;
  onStart: (preloadedContent: PreloadedContent) => void;
  gameParams?: GameParameters;
}

interface PreloadedContent {
  firstQuestion: any;
  story: any;
}

interface LoadingState {
  firstQuestion: 'idle' | 'loading' | 'success' | 'error';
  story: 'idle' | 'loading' | 'success' | 'error';
}

const StartScreen = ({ title, description, onStart, gameParams }: StartScreenProps) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    firstQuestion: 'idle',
    story: 'idle'
  });
  const [preloadedContent, setPreloadedContent] = useState<PreloadedContent | null>(null);
  const [startPreloading, setStartPreloading] = useState(false);
  
  const { generateStory, generateQuestion, isLoading } = useAIContent();
  const { toast } = useToast();

  const dynamicTheme = gameParams ? getDynamicTheme(gameParams) : null;
  const subjectIcon = gameParams ? getSubjectIcon(gameParams.subject) : '📖';

  const isContentReady = loadingState.firstQuestion === 'success';
  const hasErrors = loadingState.firstQuestion === 'error' || loadingState.story === 'error';

  const getLoadingProgress = () => {
    let completed = 0;
    if (loadingState.firstQuestion === 'success') completed++;
    return { completed, total: 1 };
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const preloadContent = async () => {
    if (!gameParams || startPreloading) return;
    
    setStartPreloading(true);
    console.log('🚀 Carregamento rápido - apenas primeira questão...');

    try {
      // Gerar apenas a primeira questão
      setLoadingState(prev => ({ ...prev, firstQuestion: 'loading' }));
      
      console.log('⚡ Gerando primeira questão...');
      const firstQuestion = await generateQuestion(gameParams, 0);
      
      if (firstQuestion) {
        console.log('✅ Primeira questão gerada:', firstQuestion.content?.substring(0, 50) || 'N/A');
        setPreloadedContent({
          firstQuestion,
          story: null // História será gerada depois
        });
        setLoadingState(prev => ({ ...prev, firstQuestion: 'success' }));
      } else {
        console.error('❌ Primeira questão falhou');
        setLoadingState(prev => ({ ...prev, firstQuestion: 'error' }));
      }

    } catch (error) {
      console.error('Erro ao gerar primeira questão:', error);
      setLoadingState(prev => ({ ...prev, firstQuestion: 'error' }));
      toast({
        title: "Erro no Carregamento",
        description: "Usando questão alternativa para começar.",
        variant: "destructive"
      });
    }
  };

  const handleStartClick = () => {
    if (!preloadedContent) {
      preloadContent();
    } else if (isContentReady) {
      onStart(preloadedContent);
    }
  };

  const LoadingIndicator = () => {
    const progress = getLoadingProgress();
    
    return (
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">Preparando sua aventura educativa...</p>
          <p className="text-sm text-gray-600">
            {progress.completed}/{progress.total} componentes prontos
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {loadingState.firstQuestion === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
            {loadingState.firstQuestion === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
            {loadingState.firstQuestion === 'error' && <div className="w-4 h-4 rounded-full bg-red-500" />}
            <span className="text-sm">
              ⚡ Preparando primeira questão sobre {gameParams?.theme}...
            </span>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              dynamicTheme ? `bg-${dynamicTheme.colors.primary}` : 'bg-blue-500'
            }`}
            style={{ width: `${(progress.completed / progress.total) * 100}%` }}
          />
        </div>
      </div>
    );
  };

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
          ? `bg-gradient-to-br from-${dynamicTheme.colors.primary} to-${dynamicTheme.colors.secondary}`
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
          
          {startPreloading ? (
            <div className={`bg-white/80 p-6 rounded-lg border-2 mb-6 ${
              dynamicTheme ? `border-${dynamicTheme.colors.primary}-200` : 'border-orange-200'
            }`}>
              <LoadingIndicator />
            </div>
          ) : (
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
          )}
        </div>
        
        <Button 
          onClick={handleStartClick}
          disabled={startPreloading && !isContentReady}
          className={`text-white font-bold py-4 px-10 text-xl rounded-full transform transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
            dynamicTheme 
              ? `bg-gradient-to-r ${dynamicTheme.colors.gradient} hover:opacity-90`
              : 'bg-gradient-to-r from-red-600 via-orange-600 to-pink-600 hover:from-red-700 hover:via-orange-700 hover:to-pink-700'
          }`}
        >
          {startPreloading && !isContentReady ? (
            <>
              <Loader2 className="w-6 h-6 mr-2 animate-spin" />
              Preparando Aventura...
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6 mr-2" />
              Começar Aventura!
            </>
          )}
        </Button>
        
        {hasErrors && (
          <p className="text-sm text-orange-600 mt-2">
            Alguns conteúdos não puderam ser carregados, mas a aventura ainda funcionará!
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StartScreen;
