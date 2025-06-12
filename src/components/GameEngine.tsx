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

  const handleCorrectAnswer = () => {
    console.log('handleCorrectAnswer called');
    console.log('Current question index:', currentQuestionIndex);
    console.log('Current collected words:', collectedWords);
    
    // Get the current question to extract the word
    const currentQuestion = getCurrentQuestion();
    if (currentQuestion && currentQuestion.word) {
      // Add the word to collected words (prevent duplicates)
      if (!collectedWords.includes(currentQuestion.word)) {
        const newCollectedWords = [...collectedWords, currentQuestion.word];
        setCollectedWords(newCollectedWords);
        console.log('New collected words:', newCollectedWords);
      }
    }
    
    // Check if we have more questions to ask
    const totalQuestions = dynamicQuestions.length > 0 ? dynamicQuestions.length : (selectedGame?.questions.length || 0);
    console.log('Total questions available:', totalQuestions);
    console.log('Current question index before increment:', currentQuestionIndex);
    
    if (currentQuestionIndex < totalQuestions - 1) {
      // Move to next question
      const nextQuestionIndex = currentQuestionIndex + 1;
      console.log('Moving to next question:', nextQuestionIndex);
      setCurrentQuestionIndex(nextQuestionIndex);
    } else {
      // All questions answered, move to next step and reset question index
      console.log('All questions answered, moving to next step');
      setCurrentQuestionIndex(0);
      handleNext();
    }
  };

  const handleIncorrectAnswer = () => {
    console.log('handleIncorrectAnswer called');
    
    const totalQuestions = dynamicQuestions.length > 0 ? dynamicQuestions.length : (selectedGame?.questions.length || 0);
    
    if (currentQuestionIndex < totalQuestions - 1) {
      const nextQuestionIndex = currentQuestionIndex + 1;
      console.log('Incorrect answer, moving to next question:', nextQuestionIndex);
      setCurrentQuestionIndex(nextQuestionIndex);
    } else {
      console.log('Incorrect answer on last question, moving to next step');
      setCurrentQuestionIndex(0);
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
        if (!question) {
          console.log('No question available, moving to next step');
          handleNext();
          return null;
        }
        
        console.log('Rendering question:', question);
        console.log('Current question index:', currentQuestionIndex);
        
        return (
          <QuestionStep 
            content={question.content}
            choices={question.choices}
            answer={question.answer}
            correctResponse={`🎉 Excelente! A palavra secreta é **${question.word}**.`}
            incorrectResponse="❌ Resposta incorreta! Tente novamente."
            onCorrect={handleCorrectAnswer}
            onIncorrect={handleIncorrectAnswer}
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
