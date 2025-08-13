import { useState, useEffect, useRef } from "react";
import QuestionStep from "./QuestionStep";
import ResultDisplay from "./question/ResultDisplay";
import { getThemeColors } from "./question/ThemeUtils";
import { GameParameters } from "../GameSetup";
import { useAIContent } from "@/hooks/useAIContent";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { validateUniqueQuestions, finalValidation } from "@/utils/uniqueContentValidator";
import { generateIntelligentFallback } from "@/utils/intelligentFallbacks";
import { getExpandedGranularFallback } from "@/utils/expandedGranularFallbacks";

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
  const prefetchingRef = useRef(false);

  // Prefetch all 4 questions up front (respecting firstQuestion if provided)
  useEffect(() => {
    if (prefetchingRef.current) return;
    prefetchingRef.current = true;

    const run = async () => {
      try {
        const results: (Question | null)[] = [null, null, null, null];

        // If we already have a firstQuestion, set it
        if (firstQuestion) {
          results[0] = firstQuestion;
        }

        // Generate remaining questions in parallel
        await Promise.all(
          [0, 1, 2, 3].map(async (idx) => {
            if (idx === 0 && results[0]) return;
            const q = await generateQuestion(gameParams, idx);
            results[idx] = q;
          })
        );

        // Validate and fill gaps with intelligent fallback per index
        const filled: Question[] = results.map((q, idx) => {
          if (q && q.content && q.choices && q.answer && q.word) return q as Question;
          const fb = generateIntelligentFallback(gameParams, 'question', idx) as any;
          if (fb && fb.content && fb.choices && fb.answer && fb.word) return fb as Question;
          return {
            content: `${gameParams.subject} - ${gameParams.theme}: Questão ${idx + 1}`,
            choices: ["Opção A", "Opção B", "Opção C", "Opção D"],
            answer: "Opção A",
            word: `palavra${idx + 1}`
          } as Question;
        });

        // Robust de-duplication: re-roll duplicates by content/word per index
        const unique: Question[] = [];
        for (let idx = 0; idx < filled.length; idx++) {
          let candidate = filled[idx];
          let attempts = 0;
          const usedContents = new Set(unique.map(q => q.content.toLowerCase().trim()));
          const usedWords = new Set(unique.map(q => q.word.toLowerCase().trim()));
          
          const isDup = (q: Question) => usedContents.has(q.content.toLowerCase().trim()) || usedWords.has(q.word.toLowerCase().trim());

          while (attempts < 3 && isDup(candidate)) {
            attempts++;
            // Try granular fallback for this exact index
            const granular = getExpandedGranularFallback(gameParams, 'question', idx) as any;
            if (granular && granular.content && granular.choices && granular.answer && granular.word && !isDup(granular)) {
              candidate = granular as Question;
              break;
            }
            // Try one more API call via generateQuestion
            const reroll = await generateQuestion(gameParams, idx);
            if (reroll && reroll.content && reroll.choices && reroll.answer && reroll.word && !isDup(reroll)) {
              candidate = reroll as Question;
              break;
            }
            // Try intelligent fallback
            const intel = generateIntelligentFallback(gameParams, 'question', idx) as any;
            if (intel && intel.content && intel.choices && intel.answer && intel.word && !isDup(intel)) {
              candidate = intel as Question;
              break;
            }
            // Last resort: minimally tweak the secret word to ensure uniqueness (keep content)
            candidate = { ...candidate, word: `${candidate.word}-${idx + 1}` };
          }
          unique.push(candidate);
        }

        setGeneratedQuestions(unique);
        console.log('[QUESTIONS-FLOW] ✅ Prefetch completo das 4 questões');
      } catch (e) {
        console.error('[QUESTIONS-FLOW] Erro no prefetch:', e);
      }
    };

    void run();
  }, [firstQuestion, gameParams]);

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

      // Usar fallback sujeito/tema específico caso não consiga gerar única
      console.log(`[QUESTIONS-FLOW] 🚨 Usando fallback sujeito/tema para questão ${nextIndex + 1}`);
      const subjectFallback = generateIntelligentFallback(gameParams, 'question', nextIndex) as any;

      const existingContents = generatedQuestions.map(q => q.content?.toLowerCase().trim());
      const existingWords = generatedQuestions.map(q => q.word?.toLowerCase().trim());

      let fallback: Question = subjectFallback && subjectFallback.content && subjectFallback.choices && subjectFallback.answer && subjectFallback.word
        ? subjectFallback as Question
        : {
            content: `${gameParams.subject} - ${gameParams.theme}: Questão ${nextIndex + 1}`,
            choices: ["Opção A", "Opção B", "Opção C", "Opção D"],
            answer: "Opção A",
            word: `palavra${nextIndex + 1}`
          };

      // Evitar duplicidades
      if (existingContents.includes(fallback.content.toLowerCase().trim()) || existingWords.includes(fallback.word.toLowerCase().trim())) {
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

  // Loading state para prefetch
  if (generatedQuestions.length === 0) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p className="text-lg">⚡ Preparando suas 4 questões...</p>
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
