import { useState, useEffect, useRef } from "react";
import QuestionStep from "./QuestionStep";
import ResultDisplay from "./question/ResultDisplay";
import { getThemeColors } from "./question/ThemeUtils";
import { GameParameters } from "../GameSetup";
import { useAIContent } from "@/hooks/useAIContent";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { validateUniqueQuestions, finalValidation } from "@/utils/uniqueContentValidator";

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
  firstQuestion?: Question;
}

const QuestionsFlow = ({
  questions,
  onCollectWord,
  onFinish,
  selectedGame,
  onRestart,
  gameParams,
  firstQuestion,
}: QuestionsFlowProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [loadingNextQuestion, setLoadingNextQuestion] = useState(false);
  const [isGeneratingNext, setIsGeneratingNext] = useState(false);
  const { generateQuestion, isLoading } = useAIContent();

  // Inicializar questões com primeira questão já gerada
  useEffect(() => {
    if (firstQuestion) {
      console.log('[QUESTIONS-FLOW] 🚀 Inicializando com primeira questão pré-carregada');
      setGeneratedQuestions([firstQuestion]);
    } else if (questions && questions.length > 0) {
      console.log('[QUESTIONS-FLOW] Usando questões passadas como prop');
      setGeneratedQuestions(questions);
    }
  }, [firstQuestion, questions]);

  // Gerar próxima questão quando necessário
  const generateNextQuestion = async (nextIndex: number) => {
    if (nextIndex >= 4 || isGeneratingNext) return;

    setIsGeneratingNext(true);
    setLoadingNextQuestion(true);
    
    console.log(`[QUESTIONS-FLOW] 🎯 Gerando questão ${nextIndex + 1} sequencialmente...`);
    
    try {
      const nextQuestion = await generateQuestion(gameParams, nextIndex);
      
      if (nextQuestion && nextQuestion.content && nextQuestion.choices && 
          nextQuestion.answer && nextQuestion.word) {
        
        // Verificar se não é duplicata
        const existingWords = generatedQuestions.map(q => q.word);
        if (!existingWords.includes(nextQuestion.word)) {
          setGeneratedQuestions(prev => [...prev, nextQuestion]);
          console.log(`[QUESTIONS-FLOW] ✅ Questão ${nextIndex + 1} gerada: ${nextQuestion.word}`);
        } else {
          console.log(`[QUESTIONS-FLOW] ❌ Questão ${nextIndex + 1} rejeitada (palavra duplicada)`);
          // Usar fallback
          const fallbackQuestions = [
            { content: "Qual é a função principal do coração?", choices: ["Filtrar", "Bombear", "Produzir", "Armazenar"], answer: "Bombear", word: "circulação" },
            { content: "Quantos pulmões temos?", choices: ["1", "2", "3", "4"], answer: "2", word: "respiração" },
            { content: "Qual órgão controla o corpo?", choices: ["Coração", "Fígado", "Cérebro", "Estômago"], answer: "Cérebro", word: "neurônio" },
            { content: "Quantos ossos tem o corpo adulto?", choices: ["156", "186", "206", "256"], answer: "206", word: "esqueleto" }
          ];
          const fallback = fallbackQuestions[nextIndex];
          if (!existingWords.includes(fallback.word)) {
            setGeneratedQuestions(prev => [...prev, fallback]);
          }
        }
      }
    } catch (error) {
      console.error(`[QUESTIONS-FLOW] Erro ao gerar questão ${nextIndex + 1}:`, error);
    } finally {
      setIsGeneratingNext(false);
      setLoadingNextQuestion(false);
    }
  };

  const handleCorrect = () => {
    setWasCorrect(true);
    setShowResult(true);
    if (generatedQuestions[currentIndex]) {
      console.log(`[QUESTIONS-FLOW] ✅ Coletando palavra: ${generatedQuestions[currentIndex].word}`);
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
    
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < 4) {
      // Se a próxima questão já existe, avançar
      if (generatedQuestions[nextIndex]) {
        setCurrentIndex(nextIndex);
      } else {
        // Gerar próxima questão em background
        generateNextQuestion(nextIndex);
        setCurrentIndex(nextIndex);
      }
    } else {
      onFinish();
    }
  };

  const tryAgain = () => {
    setShowResult(false);
    setWasCorrect(null);
  };

  const regenerateQuestions = async () => {
    console.log('[QUESTIONS-FLOW] 🔄 REGENERANDO QUESTÕES');
    setCurrentIndex(0);
    setShowResult(false);
    setWasCorrect(null);
    setGeneratedQuestions(firstQuestion ? [firstQuestion] : []);
  };

  // Loading state para primeira questão
  if (generatedQuestions.length === 0) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p className="text-lg">⚡ Carregando primeira questão...</p>
        <p className="text-sm text-gray-600 mt-2">📚 {gameParams.subject} - {gameParams.theme}</p>
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

  // Pergunta atual ou loading da próxima
  const thisQuestion = generatedQuestions[currentIndex];
  
  // Se não existe a questão atual, mostrar loading
  if (!thisQuestion && currentIndex < 4) {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
        <p className="text-sm">🎯 Gerando questão {currentIndex + 1}...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 text-center">
        <p className="text-sm text-gray-600">
          📚 {gameParams.subject} - {gameParams.theme} | 🎓 {gameParams.schoolGrade}
        </p>
        <p className="text-xs text-gray-500">
          ❓ Questão {currentIndex + 1} de {generatedQuestions.length}
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
        gameParams={gameParams}
      />
    </div>
  );
};

export default QuestionsFlow;
