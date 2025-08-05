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

  // Gerar questões únicas com índices específicos
  useEffect(() => {
    const generateUniqueQuestions = async () => {
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
      
      console.log(`[QUESTIONS-FLOW] 🎯 GERANDO 4 QUESTÕES ÚNICAS PARA: ${gameParams.subject} - ${gameParams.theme} - ${gameParams.schoolGrade}`);
      
      try {
        const uniqueQuestions: Question[] = [];
        const usedWords = new Set<string>();
        
        // Gerar exatamente 4 questões com índices únicos
        for (let questionIndex = 0; questionIndex < 4; questionIndex++) {
          console.log(`[QUESTIONS-FLOW] Gerando questão ${questionIndex + 1}/4 com índice específico...`);
          
          let attempts = 0;
          const maxAttempts = 3;
          
          while (attempts < maxAttempts) {
            try {
              const questionData = await generateQuestion(gameParams, questionIndex);
              
              if (questionData && questionData.content && questionData.choices && 
                  questionData.answer && questionData.word && 
                  !usedWords.has(questionData.word)) {
                
                uniqueQuestions.push(questionData);
                usedWords.add(questionData.word);
                console.log(`[QUESTIONS-FLOW] ✅ Questão ${questionIndex + 1} gerada - palavra: ${questionData.word}`);
                break; // Questão válida gerada, sair do loop
                
              } else if (questionData && usedWords.has(questionData.word)) {
                console.log(`[QUESTIONS-FLOW] ❌ Questão ${questionIndex + 1} rejeitada (palavra duplicada: ${questionData.word})`);
                attempts++;
                
              } else {
                console.log(`[QUESTIONS-FLOW] ❌ Questão ${questionIndex + 1} rejeitada (dados inválidos)`);
                attempts++;
              }
              
            } catch (error) {
              console.error(`[QUESTIONS-FLOW] Erro ao gerar questão ${questionIndex + 1}:`, error);
              attempts++;
            }
            
            // Se chegou ao limite de tentativas, criar fallback específico
            if (attempts >= maxAttempts) {
              const fallbackQuestions = [
                {
                  content: `Qual é a função principal do coração no corpo humano?`,
                  choices: ["Filtrar sangue", "Bombear sangue", "Produzir sangue", "Armazenar sangue"],
                  answer: "Bombear sangue",
                  word: "circulação"
                },
                {
                  content: `Quantos pulmões temos no sistema respiratório?`,
                  choices: ["1 pulmão", "2 pulmões", "3 pulmões", "4 pulmões"],
                  answer: "2 pulmões",
                  word: "respiração"
                },
                {
                  content: `Qual órgão controla todo o funcionamento do corpo?`,
                  choices: ["Coração", "Fígado", "Cérebro", "Estômago"],
                  answer: "Cérebro",
                  word: "neurônio"
                },
                {
                  content: `Quantos ossos aproximadamente tem o corpo humano adulto?`,
                  choices: ["156", "186", "206", "256"],
                  answer: "206",
                  word: "esqueleto"
                }
              ];
              
              const fallbackQuestion = fallbackQuestions[questionIndex];
              if (!usedWords.has(fallbackQuestion.word)) {
                uniqueQuestions.push(fallbackQuestion);
                usedWords.add(fallbackQuestion.word);
                console.log(`[QUESTIONS-FLOW] ⚠️ Usando fallback específico para questão ${questionIndex + 1}`);
              }
            }
          }
        }

        console.log(`[QUESTIONS-FLOW] 🎯 TOTAL DE QUESTÕES ÚNICAS GERADAS: ${uniqueQuestions.length}`);
        console.log(`[QUESTIONS-FLOW] 🔑 PALAVRAS-CHAVE ÚNICAS: ${Array.from(usedWords).join(', ')}`);
        
        // Garantir que temos exatamente 4 questões únicas
        if (uniqueQuestions.length === 4 && usedWords.size === 4) {
          setGeneratedQuestions(uniqueQuestions);
        } else {
          console.error(`[QUESTIONS-FLOW] ❌ Não foi possível gerar 4 questões únicas. Geradas: ${uniqueQuestions.length}, Palavras únicas: ${usedWords.size}`);
          // Usar fallbacks de emergência garantidos
          setGeneratedQuestions([
            {
              content: `Qual é a função principal do coração no corpo humano?`,
              choices: ["Filtrar sangue", "Bombear sangue", "Produzir sangue", "Armazenar sangue"],
              answer: "Bombear sangue",
              word: "circulação"
            },
            {
              content: `Quantos pulmões temos no sistema respiratório?`,
              choices: ["1 pulmão", "2 pulmões", "3 pulmões", "4 pulmões"],
              answer: "2 pulmões",
              word: "respiração"
            },
            {
              content: `Qual órgão controla todo o funcionamento do corpo?`,
              choices: ["Coração", "Fígado", "Cérebro", "Estômago"],
              answer: "Cérebro",
              word: "neurônio"
            },
            {
              content: `Quantos ossos aproximadamente tem o corpo humano adulto?`,
              choices: ["156", "186", "206", "256"],
              answer: "206",
              word: "esqueleto"
            }
          ]);
        }

      } catch (error) {
        console.error('[QUESTIONS-FLOW] ❌ ERRO GERAL:', error);
        
        // Fallback de emergência garantido
        setGeneratedQuestions([
          {
            content: `Qual é a função principal do coração no corpo humano?`,
            choices: ["Filtrar sangue", "Bombear sangue", "Produzir sangue", "Armazenar sangue"],
            answer: "Bombear sangue",
            word: "circulação"
          },
          {
            content: `Quantos pulmões temos no sistema respiratório?`,
            choices: ["1 pulmão", "2 pulmões", "3 pulmões", "4 pulmões"],
            answer: "2 pulmões",
            word: "respiração"
          },
          {
            content: `Qual órgão controla todo o funcionamento do corpo?`,
            choices: ["Coração", "Fígado", "Cérebro", "Estômago"],
            answer: "Cérebro",
            word: "neurônio"
          },
          {
            content: `Quantos ossos aproximadamente tem o corpo humano adulto?`,
            choices: ["156", "186", "206", "256"],
            answer: "206",
            word: "esqueleto"
          }
        ]);
      } finally {
        setLoadingQuestions(false);
      }
    };

    generateUniqueQuestions();
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
