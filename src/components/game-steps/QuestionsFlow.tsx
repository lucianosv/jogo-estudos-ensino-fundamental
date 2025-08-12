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
    // Initialize only once per session unless firstQuestion changes
    setGeneratedQuestions(prev => {
      if (prev.length > 0 && !firstQuestion) return prev;
      if (firstQuestion) {
        console.log('[QUESTIONS-FLOW] 🚀 Inicializando com primeira questão pré-carregada');
        return [firstQuestion];
      }
      if (questions && questions.length > 0) {
        console.log('[QUESTIONS-FLOW] Usando questões passadas como prop');
        return questions;
      }
      return prev;
    });
  }, [firstQuestion]);

  // Gerar próxima questão quando necessário
  const generateNextQuestion = async (nextIndex: number) => {
    if (nextIndex >= 4 || isGeneratingNext) return;

    setIsGeneratingNext(true);
    setLoadingNextQuestion(true);
    
    console.log(`[QUESTIONS-FLOW] 🎯 Gerando questão ${nextIndex + 1} sequencialmente...`);
    
    try {
      let attempt = 0;
      const maxAttempts = 2;
      let acceptedQuestion: Question | null = null;

      while (attempt <= maxAttempts) {
        const candidate = await generateQuestion(gameParams, nextIndex);

        if (
          candidate &&
          candidate.content &&
          candidate.choices &&
          candidate.answer &&
          candidate.word
        ) {
          const existingContents = generatedQuestions.map(q => q.content?.toLowerCase().trim());
          const existingWords = generatedQuestions.map(q => q.word?.toLowerCase().trim());
          const contentDup = existingContents.includes(candidate.content.toLowerCase().trim());
          const wordDup = existingWords.includes(candidate.word.toLowerCase().trim());

          if (!contentDup && !wordDup) {
            acceptedQuestion = candidate as Question;
            break;
          } else {
            console.log(`[QUESTIONS-FLOW] ♻️ Candidato rejeitado por duplicidade (contentDup=${contentDup}, wordDup=${wordDup}). Tentativa ${attempt + 1}/${maxAttempts + 1}`);
          }
        }
        attempt++;
      }

      if (acceptedQuestion) {
        setGeneratedQuestions(prev => [...prev, acceptedQuestion!]);
        console.log(`[QUESTIONS-FLOW] ✅ Questão ${nextIndex + 1} gerada: ${acceptedQuestion.word}`);
        return;
      }

      // Usar fallback caso não consiga gerar única
      console.log(`[QUESTIONS-FLOW] 🚨 Usando fallback para questão ${nextIndex + 1}`);
      const fallbackQuestions: Question[] = [
        { content: "Qual é a função principal do coração?", choices: ["Filtrar", "Bombear", "Produzir", "Armazenar"], answer: "Bombear", word: "circulação" },
        { content: "Quantos pulmões temos?", choices: ["1", "2", "3", "4"], answer: "2", word: "respiração" },
        { content: "Qual órgão controla o corpo?", choices: ["Coração", "Fígado", "Cérebro", "Estômago"], answer: "Cérebro", word: "neurônio" },
        { content: "Quantos ossos tem o corpo adulto?", choices: ["156", "186", "206", "256"], answer: "206", word: "esqueleto" }
      ];

      const existingContents = generatedQuestions.map(q => q.content?.toLowerCase().trim());
      const existingWords = generatedQuestions.map(q => q.word?.toLowerCase().trim());

      // Selecionar um fallback que não duplique conteúdo nem palavra
      let fallback = fallbackQuestions.find(f =>
        !existingContents.includes(f.content.toLowerCase().trim()) &&
        !existingWords.includes(f.word.toLowerCase().trim())
      ) || fallbackQuestions[nextIndex];

      // Garantir palavra única caso ainda conflite
      if (existingWords.includes(fallback.word.toLowerCase().trim())) {
        fallback = { ...fallback, word: `${fallback.word}_${Date.now()}` } as Question;
      }

      setGeneratedQuestions(prev => [...prev, fallback]);
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
    const current = generatedQuestions[currentIndex];
    const correctResponse = current ? `🎉 Excelente! A palavra secreta é **${current.word}**.` : "🎉 Excelente!";
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
  
  // Se não existe a questão atual, disparar geração e mostrar loading
  if (!thisQuestion && currentIndex < 4) {
    if (!isGeneratingNext && !loadingNextQuestion) {
      void generateNextQuestion(currentIndex);
    }
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
