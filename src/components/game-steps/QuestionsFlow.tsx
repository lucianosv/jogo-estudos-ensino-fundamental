
import { useState, useEffect } from "react";
import QuestionStep from "./QuestionStep";
import ResultDisplay from "./question/ResultDisplay";
import { getThemeColors } from "./question/ThemeUtils";
import { GameParameters } from "../GameSetup";
import { useAIContent } from "@/hooks/useAIContent";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

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
  const { generateQuestion, isLoading } = useAIContent();

  // Gerar questões dinamicamente baseadas nos parâmetros do jogo
  useEffect(() => {
    const generateDynamicQuestions = async () => {
      if (questions && questions.length > 0) {
        // Se já há questions estáticas, usar elas
        setGeneratedQuestions(questions);
        return;
      }

      setLoadingQuestions(true);
      try {
        const dynamicQuestions: Question[] = [];
        
        // Determinar dificuldade baseada na série escolar
        let difficulty = 'medium';
        if (gameParams.schoolGrade === 'Fundamental I') difficulty = 'easy';
        else if (gameParams.schoolGrade === 'Ensino Médio' || gameParams.schoolGrade === 'Superior') difficulty = 'hard';

        // Construir prompt contextualizado
        const contextualizedTheme = gameParams.themeDetails 
          ? `${gameParams.theme} - ${gameParams.themeDetails}`
          : `${gameParams.subject} com tema ${gameParams.theme}`;

        // Gerar 4 questões
        for (let i = 0; i < 4; i++) {
          try {
            const questionData = await generateQuestion(contextualizedTheme, difficulty);
            if (questionData && questionData.content) {
              dynamicQuestions.push(questionData);
            }
          } catch (error) {
            console.error(`Erro ao gerar questão ${i + 1}:`, error);
          }
        }

        // Se não conseguiu gerar nenhuma questão, usar fallback
        if (dynamicQuestions.length === 0) {
          dynamicQuestions.push({
            content: `Questão sobre ${gameParams.subject} - ${gameParams.theme}: Se você tem 2 + 2, qual é o resultado?`,
            choices: ["3", "4", "5", "6"],
            answer: "4",
            word: "matemática"
          });
        }

        setGeneratedQuestions(dynamicQuestions);
      } catch (error) {
        console.error('Erro ao gerar questões:', error);
        // Fallback para questão padrão
        setGeneratedQuestions([{
          content: `Questão sobre ${gameParams.subject} - ${gameParams.theme}: Se você tem 2 + 2, qual é o resultado?`,
          choices: ["3", "4", "5", "6"],
          answer: "4",
          word: "matemática"
        }]);
      } finally {
        setLoadingQuestions(false);
      }
    };

    generateDynamicQuestions();
  }, [gameParams, questions, generateQuestion]);

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
  };

  // Loading state
  if (loadingQuestions || isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p className="text-lg">Gerando questões sobre {gameParams.subject} - {gameParams.theme}...</p>
        <p className="text-sm text-gray-600 mt-2">Série: {gameParams.schoolGrade}</p>
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
