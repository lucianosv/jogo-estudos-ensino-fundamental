
import { useState, useEffect } from "react";
import QuestionStep from "./QuestionStep";
import ResultDisplay from "./question/ResultDisplay";
import { getThemeColors } from "./question/ThemeUtils";
import { GameParameters } from "../GameSetup";
import { useAIContent } from "@/hooks/useAIContent";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { generateIntelligentFallback } from "@/utils/intelligentFallbacks";

interface Question {
  content: string;
  choices: string[];
  answer: string;
  word: string;
}

interface QuestionsFlowProps {
  questions: Question[];
  onCollectWord: (word: string) => void;
  onFinish: () => void;
  selectedGame: any;
  onRestart: () => void;
  gameParams: GameParameters;
}

const QuestionsFlow = ({
  questions,
  onCollectWord,
  onFinish,
  selectedGame,
  onRestart,
  gameParams,
}: QuestionsFlowProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [generationAttempts, setGenerationAttempts] = useState(0);
  const { generateQuestion, isLoading } = useAIContent();

  // Gerar questões com retry e fallback robusto
  useEffect(() => {
    const generateDynamicQuestions = async () => {
      if (questions && questions.length > 0) {
        setGeneratedQuestions(questions);
        return;
      }

      if (generationAttempts >= 3) {
        console.log('Máximo de tentativas atingido, usando apenas fallbacks');
        const fallbackQuestions: Question[] = [];
        for (let i = 0; i < 4; i++) {
          const fallback = generateIntelligentFallback(gameParams, 'question');
          if (fallback) fallbackQuestions.push(fallback);
        }
        setGeneratedQuestions(fallbackQuestions);
        return;
      }

      setLoadingQuestions(true);
      setGenerationAttempts(prev => prev + 1);
      
      try {
        console.log(`Tentativa ${generationAttempts + 1} de gerar questões para:`, gameParams.subject, gameParams.theme);
        
        const dynamicQuestions: Question[] = [];
        const fallbackQuestions: Question[] = [];

        // Gerar fallbacks primeiro como backup
        for (let i = 0; i < 4; i++) {
          const fallback = generateIntelligentFallback(gameParams, 'question');
          if (fallback) fallbackQuestions.push(fallback);
        }

        // Tentar gerar via IA (máximo 2 questões por tentativa para não sobrecarregar)
        const maxAIQuestions = Math.min(2, 4 - dynamicQuestions.length);
        for (let i = 0; i < maxAIQuestions; i++) {
          try {
            console.log(`Gerando questão ${i + 1} via IA...`);
            const questionData = await generateQuestion(gameParams);
            if (questionData && questionData.content && questionData.choices && questionData.answer) {
              dynamicQuestions.push(questionData);
              console.log(`Questão ${i + 1} gerada com sucesso via IA`);
            } else {
              console.log(`Questão ${i + 1} falhou, usando fallback`);
              if (fallbackQuestions[i]) {
                dynamicQuestions.push(fallbackQuestions[i]);
              }
            }
          } catch (error) {
            console.error(`Erro ao gerar questão ${i + 1}:`, error);
            if (fallbackQuestions[i]) {
              dynamicQuestions.push(fallbackQuestions[i]);
            }
          }
        }

        // Completar com fallbacks se necessário
        while (dynamicQuestions.length < 4 && fallbackQuestions.length > dynamicQuestions.length) {
          dynamicQuestions.push(fallbackQuestions[dynamicQuestions.length]);
        }

        console.log(`Geradas ${dynamicQuestions.length} questões no total`);
        setGeneratedQuestions(dynamicQuestions);

      } catch (error) {
        console.error('Erro geral na geração de questões:', error);
        // Usar todos os fallbacks como último recurso
        setGeneratedQuestions(fallbackQuestions);
      } finally {
        setLoadingQuestions(false);
      }
    };

    generateDynamicQuestions();
  }, [gameParams, questions, generateQuestion, generationAttempts]);

  const handleCorrect = () => {
    setWasCorrect(true);
    setShowResult(true);
    if (generatedQuestions[currentIndex]) {
      onCollectWord(generatedQuestions[currentIndex].word);
    }
  };

  const handleIncorrect = () => {
    setWasCorrect(false);
    setShowResult(true);
  };

  const nextQuestion = () => {
    setShowResult(false);
    setWasCorrect(null);
    if (currentIndex < generatedQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onFinish();
    }
  };

  const tryAgain = () => {
    setShowResult(false);
    setWasCorrect(null);
  };

  const regenerateQuestions = async () => {
    setGeneratedQuestions([]);
    setCurrentIndex(0);
    setShowResult(false);
    setWasCorrect(null);
    setGenerationAttempts(0);
  };

  // Loading state
  if (loadingQuestions || isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p className="text-lg">Gerando questões sobre {gameParams.subject} - {gameParams.theme}...</p>
        <p className="text-sm text-gray-600 mt-2">Série: {gameParams.schoolGrade}</p>
        {generationAttempts > 0 && (
          <p className="text-xs text-gray-500 mt-1">Tentativa {generationAttempts}/3</p>
        )}
      </div>
    );
  }

  if (generatedQuestions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg mb-4">Não foi possível gerar questões para {gameParams.theme}.</p>
        <Button onClick={regenerateQuestions} className="mb-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  const colors = getThemeColors(selectedGame);

  // Página de feedback após resposta
  if (showResult) {
    const correctResponse = `🎉 Excelente! A palavra secreta é **${generatedQuestions[currentIndex].word}**.`;
    const incorrectResponse = "❌ Resposta incorreta! Tente novamente.";

    return (
      <ResultDisplay
        isCorrect={wasCorrect!}
        correctResponse={correctResponse}
        incorrectResponse={incorrectResponse}
        showContinueButton={true}
        onContinue={nextQuestion}
        onTryAgain={tryAgain}
        colors={colors}
      />
    );
  }

  // Pergunta atual
  const thisQuestion = generatedQuestions[currentIndex];

  return (
    <div>
      <div className="mb-4 text-center">
        <p className="text-sm text-gray-600">
          {gameParams.subject} - {gameParams.theme} | Série: {gameParams.schoolGrade}
        </p>
        <p className="text-xs text-gray-500">
          Questão {currentIndex + 1} de {generatedQuestions.length}
        </p>
      </div>
      
      <QuestionStep
        content={thisQuestion.content}
        choices={thisQuestion.choices}
        answer={thisQuestion.answer}
        onCorrect={handleCorrect}
        onIncorrect={handleIncorrect}
        selectedGame={selectedGame}
        onRestart={onRestart}
      />
    </div>
  );
};

export default QuestionsFlow;
