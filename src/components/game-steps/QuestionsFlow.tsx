import { useState, useEffect, useRef } from "react";
import QuestionStep from "./QuestionStep";
import ResultDisplay from "./question/ResultDisplay";
import { getThemeColors } from "./question/ThemeUtils";
import { GameParameters } from "../GameSetup";
import { useQuestionGeneration } from "@/hooks/useQuestionGeneration";
import { Question } from "@/services/QuestionGenerationService";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { getDisplayWord } from "@/utils/wordCleaner";

// Question interface now imported from service

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
  const [isInitializing, setIsInitializing] = useState(true);
  const { generateQuestionSet, generateSingleQuestion, isLoading, clearCache } = useQuestionGeneration();
  const initializationRef = useRef(false);

  // Inicialização única com novo serviço
  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    const initializeQuestions = async () => {
      setIsInitializing(true);
      try {
        console.log('[QUESTIONS-FLOW] 🎮 Inicializando com novo serviço de questões');
        
        // Limpar cache anterior
        clearCache();
        
        // Gerar conjunto completo de 4 questões únicas
        const uniqueQuestions = await generateQuestionSet(gameParams);
        
        setGeneratedQuestions(uniqueQuestions);
        console.log('[QUESTIONS-FLOW] ✅ Inicialização completa com 4 questões únicas');
        
      } catch (error) {
        console.error('[QUESTIONS-FLOW] ❌ Erro na inicialização:', error);
        
        // Fallback de emergência com opções temáticas
        const getSubjectChoices = (subject: string) => {
          const subjectChoices = {
            'História': ['Antiguidade', 'Idade Média', 'Era Moderna', 'Contemporâneo'],
            'Ciências': ['Biologia', 'Física', 'Química', 'Astronomia'],
            'Geografia': ['Continentes', 'Oceanos', 'Países', 'Capitais'],
            'Português': ['Literatura', 'Gramática', 'Redação', 'Ortografia'],
            'Matemática': ['Aritmética', 'Geometria', 'Álgebra', 'Estatística']
          };
          return subjectChoices[subject as keyof typeof subjectChoices] || subjectChoices['Ciências'];
        };
        
        const choices = getSubjectChoices(gameParams.subject);
        const emergencyQuestions: Question[] = Array.from({ length: 4 }, (_, idx) => ({
          content: `${gameParams.subject} - ${gameParams.theme}: Questão ${idx + 1}`,
          choices: choices,
          answer: choices[0],
          word: `emergency_${idx + 1}`,
          source: 'emergency' as const,
          uniqueId: `emergency_${Date.now()}_${idx}`
        }));
        
        setGeneratedQuestions(emergencyQuestions);
        console.log('[QUESTIONS-FLOW] 🚨 Usando questões de emergência');
      } finally {
        setIsInitializing(false);
      }
    };

    void initializeQuestions();
  }, [gameParams, generateQuestionSet, clearCache]);

  // Regenerar questão específica se necessário (raramente usado)
  const regenerateSpecificQuestion = async (questionIndex: number) => {
    if (questionIndex >= 4 || isLoading) return;
    
    console.log(`[QUESTIONS-FLOW] 🔄 Regenerando questão ${questionIndex + 1}`);
    
    try {
      const newQuestion = await generateSingleQuestion(gameParams, questionIndex);
      
      setGeneratedQuestions(prev => {
        const updated = [...prev];
        updated[questionIndex] = newQuestion;
        return updated;
      });
      
      console.log(`[QUESTIONS-FLOW] ✅ Questão ${questionIndex + 1} regenerada`);
    } catch (error) {
      console.error(`[QUESTIONS-FLOW] ❌ Erro ao regenerar questão ${questionIndex + 1}:`, error);
    }
  };

  const handleCorrect = () => {
    setWasCorrect(true);
    setShowResult(true);
    if (generatedQuestions[currentIndex]) {
      const currentQuestion = generatedQuestions[currentIndex];
      const cleanWord = getDisplayWord(currentQuestion.word);
      
      console.log(`[QUESTIONS-FLOW] ✅ Coletando palavra limpa: "${cleanWord}" (original: "${currentQuestion.word}", fonte: ${currentQuestion.source})`);
      onCollectWord(cleanWord);
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
      setCurrentIndex(nextIndex);
    } else {
      onFinish();
    }
  };

  const tryAgain = () => {
    setShowResult(false);
    setWasCorrect(null);
  };

  const regenerateAllQuestions = async () => {
    console.log('[QUESTIONS-FLOW] 🔄 REGENERANDO TODAS AS QUESTÕES');
    setCurrentIndex(0);
    setShowResult(false);
    setWasCorrect(null);
    setIsInitializing(true);
    
    try {
      clearCache();
      const newQuestions = await generateQuestionSet(gameParams);
      setGeneratedQuestions(newQuestions);
      console.log('[QUESTIONS-FLOW] ✅ Todas as questões regeneradas');
    } catch (error) {
      console.error('[QUESTIONS-FLOW] ❌ Erro ao regenerar questões:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  // Loading state para inicialização
  if (isInitializing || generatedQuestions.length === 0) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p className="text-lg">🎯 Gerando questões únicas...</p>
        <p className="text-sm text-gray-600 mt-2">📚 {gameParams.subject} - {gameParams.theme}</p>
        <p className="text-xs text-gray-500 mt-1">✨ Sistema otimizado anti-duplicação</p>
      </div>
    );
  }

  const colors = getThemeColors(selectedGame);

  // Página de feedback após resposta
  if (showResult) {
    const current = generatedQuestions[currentIndex];
    const correctResponse = current ? `🎉 Excelente! A palavra secreta é **${getDisplayWord(current.word)}**.` : "🎉 Excelente!";
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

  // Questão atual
  const currentQuestion = generatedQuestions[currentIndex];
  
  // Se não existe a questão, erro crítico
  if (!currentQuestion) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-red-600">❌ Erro: Questão não encontrada</p>
        <Button onClick={regenerateAllQuestions} variant="outline" className="mt-4">
          🔄 Regenerar Questões
        </Button>
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
          ❓ Questão {currentIndex + 1} de 4 | 🔥 Fonte: {currentQuestion.source}
        </p>
      </div>
      
      <QuestionStep
        content={currentQuestion.content}
        choices={currentQuestion.choices}
        answer={currentQuestion.answer}
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
