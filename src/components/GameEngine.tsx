import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import gameData from "@/data/demon-slayer-math-game.json";
import TextStep from "./game-steps/TextStep";
import ChoiceStep from "./game-steps/ChoiceStep";
import QuestionStep from "./game-steps/QuestionStep";
import InputStep from "./game-steps/InputStep";
import BackgroundImages from "./BackgroundImages";
import GameHeader from "./GameHeader";
import StartScreen from "./StartScreen";
import { useAIContent } from "@/hooks/useAIContent";
import { useToast } from "@/hooks/use-toast";

interface GameStep {
  type: "text" | "choice" | "question" | "input";
  content: string;
  choices?: string[];
  answer?: string;
  correct_response?: string;
  incorrect_response?: string;
}

interface Game {
  id: number;
  theme: string;
  background: string;
  password: string[];
  story: {
    title: string;
    content: string;
  };
  questions: Array<{
    content: string;
    choices: string[];
    answer: string;
    word: string;
  }>;
}

const GameEngine = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [collectedWords, setCollectedWords] = useState<string[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [dynamicQuestions, setDynamicQuestions] = useState<any[]>([]);
  const [dynamicStory, setDynamicStory] = useState<any>(null);
  
  const { generateStory, generateQuestion, isLoading } = useAIContent();
  const { toast } = useToast();

  const games = gameData.games as Game[];
  const steps = gameData.steps as GameStep[];
  const currentStep = steps[currentStepIndex];

  // Gerar conteúdo dinâmico quando um tema é selecionado
  useEffect(() => {
    if (selectedGame && !dynamicStory) {
      generateGameContent();
    }
  }, [selectedGame]);

  const generateGameContent = async () => {
    if (!selectedGame) return;

    try {
      toast({
        title: "🎯 Criando aventura personalizada...",
        description: `Gerando conteúdo único para ${selectedGame.theme}`,
      });

      // Gerar história dinâmica
      const story = await generateStory(selectedGame.theme);
      if (story) {
        setDynamicStory(story);
      }

      // Gerar 3 questões dinâmicas
      const questions = [];
      for (let i = 0; i < 3; i++) {
        const question = await generateQuestion(selectedGame.theme);
        if (question) {
          questions.push(question);
        }
      }
      
      if (questions.length > 0) {
        setDynamicQuestions(questions);
        
        toast({
          title: "✨ Aventura criada!",
          description: `${questions.length} desafios únicos gerados com IA`,
        });
      }

    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      toast({
        title: "⚠️ Usando conteúdo padrão",
        description: "Houve um problema na geração, mas o jogo continua!",
        variant: "destructive"
      });
    }
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleStart = () => {
    setGameStarted(true);
    setCurrentStepIndex(0);
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setCollectedWords([]);
    setSelectedGame(null);
    setGameStarted(false);
    setCurrentQuestionIndex(0);
    setDynamicQuestions([]);
    setDynamicStory(null);
  };

  const handleCorrectAnswer = (word: string) => {
    setCollectedWords([...collectedWords, word]);
    
    if (currentQuestionIndex < 2) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      handleNext();
    } else {
      handleNext();
    }
  };

  const handleThemeChoice = (theme: string) => {
    let game: Game | null = null;
    
    if (theme.includes("Tanjiro")) {
      game = games.find(g => g.theme.includes("Tanjiro")) || null;
    } else if (theme.includes("Nezuko")) {
      game = games.find(g => g.theme.includes("Nezuko")) || null;
    } else if (theme.includes("Zenitsu")) {
      game = games.find(g => g.theme.includes("Zenitsu")) || null;
    } else if (theme.includes("Inosuke")) {
      game = games.find(g => g.theme.includes("Inosuke")) || null;
    }
    
    if (game) {
      setSelectedGame(game);
      setCurrentQuestionIndex(0);
      handleNext();
    }
  };

  const handlePasswordSubmit = (password: string) => {
    if (!selectedGame) return;
    
    const correctPassword = collectedWords.join(" ");
    if (password.trim().toLowerCase() === correctPassword.toLowerCase()) {
      handleNext();
    } else {
      alert("Senha incorreta! Use as palavras que você coletou na ordem correta.");
    }
  };

  const handleFinalChoice = (choice: string) => {
    if (choice.includes("Sim")) {
      handleRestart();
    } else {
      alert("🌸 Obrigado por jogar! Até a próxima aventura! 🌸");
    }
  };

  const getCurrentQuestion = () => {
    // Usar questões dinâmicas se disponíveis, senão usar as estáticas
    if (dynamicQuestions.length > 0 && currentQuestionIndex < dynamicQuestions.length) {
      return dynamicQuestions[currentQuestionIndex];
    }
    
    if (!selectedGame || currentQuestionIndex >= selectedGame.questions.length) {
      return null;
    }
    return selectedGame.questions[currentQuestionIndex];
  };

  if (!gameStarted) {
    return (
      <StartScreen 
        title={gameData.title}
        description={gameData.description}
        onStart={handleStart}
      />
    );
  }

  const renderStep = () => {
    switch (currentStep.type) {
      case "text":
        let content = currentStep.content;
        
        if (content.includes("[STORY_PLACEHOLDER]") && selectedGame) {
          // Usar história dinâmica se disponível
          const storyToUse = dynamicStory || selectedGame.story;
          content = content.replace(
            "[STORY_PLACEHOLDER]", 
            `**${storyToUse.title}**\n\n${storyToUse.content}`
          );
        }
        
        return (
          <TextStep 
            content={content} 
            onNext={handleNext}
            collectedWords={collectedWords}
            selectedGame={selectedGame}
          />
        );
      case "choice":
        return (
          <ChoiceStep 
            content={currentStep.content}
            choices={currentStep.choices || []}
            onChoice={currentStepIndex === 1 ? handleThemeChoice : 
                     currentStepIndex === steps.length - 1 ? handleFinalChoice : 
                     handleNext}
            selectedGame={selectedGame}
          />
        );
      case "question":
        const question = getCurrentQuestion();
        if (!question) return null;
        
        return (
          <QuestionStep 
            content={question.content}
            choices={question.choices}
            answer={question.answer}
            correctResponse={`🎉 Excelente! A palavra secreta é **${question.word}**.`}
            incorrectResponse="❌ Resposta incorreta! Tente novamente."
            onCorrect={handleCorrectAnswer}
            onIncorrect={() => {}}
            selectedGame={selectedGame}
          />
        );
      case "input":
        return (
          <InputStep 
            content={currentStep.content}
            onSubmit={handlePasswordSubmit}
            collectedWords={collectedWords}
            selectedGame={selectedGame}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto relative min-h-screen">
      <BackgroundImages selectedGame={selectedGame} />

      <GameHeader 
        currentStepIndex={currentStepIndex}
        totalSteps={steps.length}
        selectedGame={selectedGame}
        collectedWords={collectedWords}
      />

      {/* Loading indicator for AI generation */}
      {isLoading && (
        <Card className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 border-2 border-white/50 shadow-lg">
          <CardContent className="p-4 text-center text-white">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span className="font-medium">🤖 IA criando conteúdo personalizado...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Game Content */}
      <Card className="bg-white/85 backdrop-blur-lg shadow-2xl border-2 border-white/60 relative z-10">
        <CardContent className="p-8">
          {renderStep()}
        </CardContent>
      </Card>

      {/* Restart Button */}
      {currentStepIndex === steps.length - 1 && (
        <div className="mt-6 text-center relative z-10">
          <Button 
            onClick={handleRestart}
            variant="outline"
            className="bg-white/90 hover:bg-white border-2 border-red-500 text-red-600 hover:text-red-700 font-bold py-3 px-6 rounded-full shadow-lg"
          >
            🎮 Nova Aventura
          </Button>
        </div>
      )}
    </div>
  );
};

export default GameEngine;
