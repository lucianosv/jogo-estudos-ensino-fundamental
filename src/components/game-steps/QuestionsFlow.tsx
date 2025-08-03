
import { useState, useEffect, useRef } from "react";
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
  const generationAttempts = useRef(0);
  const hasGenerated = useRef(false);
  const { generateQuestion, isLoading } = useAIContent();

  // Limpar cache e garantir regeneração
  const clearCache = () => {
    hasGenerated.current = false;
    generationAttempts.current = 0;
    setGeneratedQuestions([]);
  };

  // Gerar questões seguindo a nova ordem de prioridade
  useEffect(() => {
    const generateDynamicQuestions = async () => {
      // Se já foram passadas questões, usar elas
      if (questions && questions.length > 0) {
        console.log('[QUESTIONS-FLOW] Usando questões passadas como prop');
        setGeneratedQuestions(questions);
        return;
      }

      // Se já gerou, não gerar novamente
      if (hasGenerated.current) {
        return;
      }

      hasGenerated.current = true;
      setLoadingQuestions(true);
      
      console.log(`[QUESTIONS-FLOW] 🎯 GERANDO QUESTÕES PARA: ${gameParams.subject} - ${gameParams.theme} - ${gameParams.schoolGrade}`);
      
      try {
        const dynamicQuestions: Question[] = [];
        const usedWords = new Set<string>();
        
        // Tentar gerar 4 questões únicas via nossa nova lógica
        for (let i = 0; i < 4; i++) {
          console.log(`[QUESTIONS-FLOW] Tentando gerar questão ${i + 1}/4...`);
          
          try {
            const questionData = await generateQuestion(gameParams);
            
            if (questionData && questionData.content && questionData.choices && 
                questionData.answer && questionData.word && 
                !usedWords.has(questionData.word)) {
              
              dynamicQuestions.push(questionData);
              usedWords.add(questionData.word);
              console.log(`[QUESTIONS-FLOW] ✅ Questão ${i + 1} gerada - palavra: ${questionData.word}`);
            } else {
              console.log(`[QUESTIONS-FLOW] ❌ Questão ${i + 1} rejeitada (palavra duplicada ou dados inválidos)`);
              
              // Se rejeitada, criar fallback de emergência único
              const fallbackQuestion = {
                content: `${gameParams.subject} - ${gameParams.theme} (${gameParams.schoolGrade}): Questão ${i + 1}`,
                choices: ["Opção A", "Opção B", "Opção C", "Opção D"],
                answer: "Opção A",
                word: `palavra${i + 1}`
              };
              
              if (!usedWords.has(fallbackQuestion.word)) {
                dynamicQuestions.push(fallbackQuestion);
                usedWords.add(fallbackQuestion.word);
                console.log(`[QUESTIONS-FLOW] ⚠️ Usando fallback de emergência para questão ${i + 1}`);
              }
            }
          } catch (error) {
            console.error(`[QUESTIONS-FLOW] Erro ao gerar questão ${i + 1}:`, error);
            
            // Fallback de emergência
            const emergencyQuestion = {
              content: `${gameParams.subject} - ${gameParams.theme} (${gameParams.schoolGrade}): Questão de emergência ${i + 1}`,
              choices: ["Opção A", "Opção B", "Opção C", "Opção D"],
              answer: "Opção A",
              word: `emergencia${i + 1}`
            };
            
            if (!usedWords.has(emergencyQuestion.word)) {
              dynamicQuestions.push(emergencyQuestion);
              usedWords.add(emergencyQuestion.word);
            }
          }
        }

        console.log(`[QUESTIONS-FLOW] 🎯 TOTAL DE QUESTÕES GERADAS: ${dynamicQuestions.length}`);
        console.log(`[QUESTIONS-FLOW] 🔑 PALAVRAS-CHAVE: ${Array.from(usedWords).join(', ')}`);
        
        setGeneratedQuestions(dynamicQuestions);

      } catch (error) {
        console.error('[QUESTIONS-FLOW] ❌ ERRO GERAL:', error);
        
        // Criar 4 questões de emergência
        const emergencyQuestions = [];
        for (let i = 0; i < 4; i++) {
          emergencyQuestions.push({
            content: `${gameParams.subject} - ${gameParams.theme} (${gameParams.schoolGrade}): Questão de emergência ${i + 1}`,
            choices: ["Opção A", "Opção B", "Opção C", "Opção D"],
            answer: "Opção A",
            word: `emergencia${i + 1}`
          });
        }
        setGeneratedQuestions(emergencyQuestions);
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
    clearCache();
    setCurrentIndex(0);
    setShowResult(false);
    setWasCorrect(null);
  };

  // Loading state
  if (loadingQuestions || isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p className="text-lg">🎯 Gerando questões de {gameParams.subject}</p>
        <p className="text-sm text-gray-600 mt-2">📚 Tema: {gameParams.theme}</p>
        <p className="text-xs text-gray-500 mt-1">🎓 Série: {gameParams.schoolGrade}</p>
      </div>
    );
  }

  if (generatedQuestions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg mb-4">❌ Não foi possível gerar questões para {gameParams.theme}.</p>
        <Button onClick={regenerateQuestions} className="mb-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          🔄 Tentar Novamente
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
