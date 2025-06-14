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
import { validateGameTheme, sanitizeText, logSecurityEvent, checkRateLimit } from "@/utils/securityUtils";

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
  const [questionsGenerated, setQuestionsGenerated] = useState(false);
  
  const { generateStory, generateQuestion, isLoading } = useAIContent();
  const { toast } = useToast();

  const games = gameData.games as Game[];
  const steps = gameData.steps as GameStep[];
  const currentStep = steps[currentStepIndex];

  // Security: Add rate limiting for AI content generation
  const generateGameContentSecure = async () => {
    if (!selectedGame) return;

    // Rate limiting check
    if (!checkRateLimit('ai-generation', 5, 300000)) { // 5 requests per 5 minutes
      toast({
        title: "⚠️ Muitas solicitações",
        description: "Aguarde alguns minutos antes de gerar novo conteúdo.",
        variant: "destructive"
      });
      return;
    }

    // Validate theme
    if (!validateGameTheme(selectedGame.theme)) {
      logSecurityEvent('Invalid theme attempted', { theme: selectedGame.theme });
      toast({
        title: "❌ Tema inválido",
        description: "Tema não permitido para segurança.",
        variant: "destructive"
      });
      return;
    }

    console.log('Starting secure AI content generation for:', selectedGame.theme);
    
    try {
      toast({
        title: "🛡️ Gerando conteúdo seguro...",
        description: `Criando aventura validada para ${selectedGame.theme}`,
      });

      // Generate dynamic story with security validation
      console.log('Generating story securely...');
      const story = await generateStory(selectedGame.theme);
      if (story) {
        // Sanitize story content
        const sanitizedStory = {
          ...story,
          title: sanitizeText(story.title || ''),
          content: sanitizeText(story.content || '')
        };
        setDynamicStory(sanitizedStory);
        console.log('Secure story generated');
      }

      // Generate 3 fresh questions with validation
      console.log('Generating questions securely...');
      const questions = [];
      for (let i = 0; i < 3; i++) {
        const question = await generateQuestion(selectedGame.theme, 'medium');
        if (question) {
          // Sanitize question content
          const sanitizedQuestion = {
            ...question,
            content: sanitizeText(question.content || ''),
            choices: (question.choices || []).map((choice: string) => sanitizeText(choice)),
            answer: sanitizeText(question.answer || ''),
            word: sanitizeText(question.word || '')
          };
          questions.push(sanitizedQuestion);
          console.log(`Secure question ${i + 1} generated`);
        }
      }
      
      if (questions.length > 0) {
        setDynamicQuestions(questions);
        setQuestionsGenerated(true);
        
        toast({
          title: "✅ Conteúdo seguro criado!",
          description: `${questions.length} desafios validados gerados`,
        });
        
        console.log('All secure questions generated');
      }

    } catch (error) {
      console.error('Error in secure content generation:', error);
      logSecurityEvent('Content generation failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      
      toast({
        title: "⚠️ Usando conteúdo padrão",
        description: "Erro na geração segura, mas o jogo continua!",
        variant: "destructive"
      });
    }
  };

  // Reset game state completely when restarting
  const resetGameState = () => {
    setCurrentStepIndex(0);
    setCollectedWords([]);
    setSelectedGame(null);
    setGameStarted(false);
    setCurrentQuestionIndex(0);
    setDynamicQuestions([]);
    setDynamicStory(null);
    setQuestionsGenerated(false);
  };

  // Generate fresh content when a theme is selected
  useEffect(() => {
    if (selectedGame && !questionsGenerated) {
      generateGameContentSecure();
    }
  }, [selectedGame, questionsGenerated]);

  const getCurrentQuestion = () => {
    console.log('Getting current question. Index:', currentQuestionIndex);
    console.log('Dynamic questions available:', dynamicQuestions.length);
    console.log('Static questions available:', selectedGame?.questions.length || 0);
    
    // Always prefer dynamic questions if available
    if (dynamicQuestions.length > 0 && currentQuestionIndex < dynamicQuestions.length) {
      const question = dynamicQuestions[currentQuestionIndex];
      console.log('Returning dynamic question:', question);
      return question;
    }
    
    // Fallback to static questions
    if (selectedGame && currentQuestionIndex < selectedGame.questions.length) {
      const question = selectedGame.questions[currentQuestionIndex];
      console.log('Returning static question:', question);
      return question;
    }
    
    console.log('No question available for index:', currentQuestionIndex);
    return null;
  };

  const handleNext = () => {
    console.log('handleNext called. Current step:', currentStepIndex);
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleStart = () => {
    console.log('Starting game');
    setGameStarted(true);
    setCurrentStepIndex(0);
  };

  const handleRestart = () => {
    console.log('Restarting game - full reset');
    resetGameState();
  };

  const handleCorrectAnswer = () => {
    console.log('=== CORRECT ANSWER HANDLER ===');
    console.log('Current question index:', currentQuestionIndex);
    console.log('Current collected words:', collectedWords);
    
    // Get the current question to extract the word
    const currentQuestion = getCurrentQuestion();
    console.log('Current question:', currentQuestion);
    
    if (currentQuestion && currentQuestion.word) {
      // Add the word to collected words (prevent duplicates)
      if (!collectedWords.includes(currentQuestion.word)) {
        const newCollectedWords = [...collectedWords, currentQuestion.word];
        setCollectedWords(newCollectedWords);
        console.log('Added new word. New collected words:', newCollectedWords);
      } else {
        console.log('Word already collected, skipping');
      }
    }
    
    // Check if we have more questions to ask
    const totalQuestions = dynamicQuestions.length > 0 ? dynamicQuestions.length : (selectedGame?.questions.length || 0);
    console.log('Total questions available:', totalQuestions);
    
    if (currentQuestionIndex < totalQuestions - 1) {
      // Move to next question
      const nextQuestionIndex = currentQuestionIndex + 1;
      console.log('Moving to next question:', nextQuestionIndex);
      setCurrentQuestionIndex(nextQuestionIndex);
    } else {
      // All questions answered, move to next step
      console.log('All questions completed, moving to next step');
      setCurrentQuestionIndex(0); // Reset for potential future use
      handleNext();
    }
  };

  const handleIncorrectAnswer = () => {
    console.log('=== INCORRECT ANSWER HANDLER ===');
    console.log('Current question index:', currentQuestionIndex);
    
    const totalQuestions = dynamicQuestions.length > 0 ? dynamicQuestions.length : (selectedGame?.questions.length || 0);
    console.log('Total questions available:', totalQuestions);
    
    if (currentQuestionIndex < totalQuestions - 1) {
      // Move to next question
      const nextQuestionIndex = currentQuestionIndex + 1;
      console.log('Incorrect answer, moving to next question:', nextQuestionIndex);
      setCurrentQuestionIndex(nextQuestionIndex);
    } else {
      // All questions answered, move to next step
      console.log('All questions completed, moving to next step');
      setCurrentQuestionIndex(0); // Reset for potential future use
      handleNext();
    }
  };

  const handleThemeChoice = (theme: string) => {
    console.log('Theme chosen:', theme);
    
    // Security: Validate and sanitize theme choice
    const sanitizedTheme = sanitizeText(theme);
    if (!validateGameTheme(sanitizedTheme)) {
      logSecurityEvent('Invalid theme choice', { theme, sanitizedTheme });
      toast({
        title: "❌ Tema inválido",
        description: "Por favor, escolha um tema válido.",
        variant: "destructive"
      });
      return;
    }
    
    let game: Game | null = null;
    
    if (sanitizedTheme.includes("Tanjiro")) {
      game = games.find(g => g.theme.includes("Tanjiro")) || null;
    } else if (sanitizedTheme.includes("Nezuko")) {
      game = games.find(g => g.theme.includes("Nezuko")) || null;
    } else if (sanitizedTheme.includes("Zenitsu")) {
      game = games.find(g => g.theme.includes("Zenitsu")) || null;
    } else if (sanitizedTheme.includes("Inosuke")) {
      game = games.find(g => g.theme.includes("Inosuke")) || null;
    }
    
    if (game) {
      console.log('Selected game:', game);
      setSelectedGame(game);
      setCurrentQuestionIndex(0);
      setQuestionsGenerated(false);
      handleNext();
    }
  };

  const handlePasswordSubmit = (password: string) => {
    if (!selectedGame) return;
    
    // Security: Sanitize password input
    const sanitizedPassword = sanitizeText(password);
    const correctPassword = collectedWords.join(" ");
    
    console.log('Secure password check. Input sanitized, comparing with expected');
    
    if (sanitizedPassword.trim().toLowerCase() === correctPassword.toLowerCase()) {
      console.log('Password correct!');
      handleNext();
    } else {
      console.log('Password incorrect');
      logSecurityEvent('Incorrect password attempt', { expected: correctPassword.length });
      toast({
        title: "❌ Senha incorreta!",
        description: "Use as palavras que você coletou na ordem correta.",
        variant: "destructive"
      });
    }
  };

  const handleFinalChoice = (choice: string) => {
    if (choice.includes("Sim")) {
      console.log('User chose to play again');
      handleRestart();
    } else {
      toast({
        title: "🌸 Obrigado por jogar!",
        description: "Até a próxima aventura! 🌸",
      });
    }
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
          // Use dynamic story if available
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
        
        // Novo prop onRestart passado para QuestionStep
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
            onRestart={handleRestart}
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
      {/* Security indicator */}
      <div className="absolute top-2 right-2 z-20">
        <div className="bg-green-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
          🛡️ Seguro
        </div>
      </div>

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
