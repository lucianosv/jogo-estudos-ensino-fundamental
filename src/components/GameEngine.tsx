
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TextStep from "./game-steps/TextStep";
import ChoiceStep from "./game-steps/ChoiceStep";
import InputStep from "./game-steps/InputStep";
import BackgroundImages from "./BackgroundImages";
import GameHeader from "./GameHeader";
import StartScreen from "./StartScreen";
import { useToast } from "@/hooks/use-toast";
import { sanitizeText, logSecurityEvent } from "@/utils/securityUtils";
import QuestionsFlow from "./game-steps/QuestionsFlow";
import GameSetup from "./GameSetup";
import { Loader2 } from "lucide-react";
import { getDynamicTheme } from "@/utils/dynamicThemeUtils";
import { useGameLogic } from "@/hooks/useGameLogic";

const GameEngine = () => {
  const { toast } = useToast();
  const {
    currentStepIndex,
    collectedWords,
    selectedGame,
    gameStarted,
    gameParams,
    dynamicStory,
    dynamicSteps,
    isGeneratingStory,
    isLoading,
    setCurrentStepIndex,
    setGameStarted,
    handleRestart,
    handleSetupComplete,
    handleCollectWord,
    currentStep,
    isQuestionStep
  } = useGameLogic();

  const handleFinishQuestions = () => {
    setCurrentStepIndex((idx) => idx + 1);
  };

  const handlePasswordSubmit = (password: string) => {
    if (!selectedGame) return;
    const sanitizedPassword = sanitizeText(password);
    
    // Aceitar as palavras coletadas em qualquer ordem
    const wordsInPassword = sanitizedPassword.toLowerCase().split(/\s+/);
    const collectedWordsLower = collectedWords.map(w => w.toLowerCase());
    
    const hasAllWords = collectedWordsLower.every(word => 
      wordsInPassword.some(inputWord => inputWord.includes(word))
    );
    
    if (hasAllWords && collectedWords.length > 0) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      logSecurityEvent('Incorrect password attempt', {
        expected: collectedWords.join(" "),
        received: sanitizedPassword
      });
      toast({
        title: "❌ Senha incorreta!",
        description: "Use as palavras que você coletou durante as questões.",
        variant: "destructive"
      });
    }
  };

  const handleFinalChoice = (choice: string) => {
    if (choice.includes("Sim")) {
      handleRestart();
    } else {
      toast({
        title: "🌸 Obrigado por jogar!",
        description: "Até a próxima aventura! 🌸",
      });
    }
  };

  if (!gameParams) {
    return <GameSetup onSetupComplete={handleSetupComplete} />;
  }

  if (!gameStarted) {
    return (
      <StartScreen 
        title={`Aventura de ${gameParams.subject}: ${gameParams.theme}`}
        description={`Prepare-se para desafios de ${gameParams.subject.toLowerCase()}!`}
        onStart={() => { setGameStarted(true); setCurrentStepIndex(0); }}
        gameParams={gameParams}
      />
    );
  }

  if (!currentStep) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p>Preparando sua aventura...</p>
      </div>
    );
  }

  const renderStep = () => {
    if (isQuestionStep && selectedGame) {
      return (
        <QuestionsFlow
          questions={selectedGame.questions}
          onCollectWord={handleCollectWord}
          onFinish={handleFinishQuestions}
          selectedGame={selectedGame}
          onRestart={handleRestart}
          gameParams={gameParams}
        />
      );
    }
    
    switch (currentStep.type) {
      case "text":
        let content = currentStep.content;        
        if (content.includes("[STORY_PLACEHOLDER]") && selectedGame) {
          const storyToUse = dynamicStory || selectedGame.story;
          
          if (isGeneratingStory || isLoading) {
            return (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-lg">Gerando sua história personalizada...</p>
                <p className="text-sm text-gray-600 mt-2">{gameParams.subject} - {gameParams.theme}</p>
              </div>
            );
          }
          
          content = content.replace(
            "[STORY_PLACEHOLDER]", 
            `**${storyToUse.title}**\n\n${storyToUse.content}`
          );
        }
        return (
          <TextStep 
            content={content}
            onNext={() => setCurrentStepIndex(idx => idx + 1)}
            collectedWords={collectedWords}
            selectedGame={selectedGame}
            gameParams={gameParams}
          />
        );
      case "choice":
        return (
          <ChoiceStep 
            content={currentStep.content}
            choices={currentStep.choices || []}
            onChoice={currentStepIndex === dynamicSteps.length - 1 ? handleFinalChoice :
              () => setCurrentStepIndex(idx => idx + 1)}
            selectedGame={selectedGame}
            gameParams={gameParams}
          />
        );
      case "input":
        return (
          <InputStep 
            content={currentStep.content}
            onSubmit={handlePasswordSubmit}
            collectedWords={collectedWords}
            selectedGame={selectedGame}
            gameParams={gameParams}
          />
        );
      default:
        return null;
    }
  };

  const dynamicTheme = getDynamicTheme(gameParams);

  return (
    <div className="w-full max-w-3xl mx-auto relative min-h-screen">
      <BackgroundImages selectedGame={selectedGame} gameParams={gameParams} />

      <GameHeader 
        currentStepIndex={currentStepIndex}
        totalSteps={dynamicSteps.length}
        selectedGame={selectedGame}
        collectedWords={collectedWords}
        gameParams={gameParams}
      />

      <Card className="bg-white/85 backdrop-blur-lg shadow-2xl border-2 border-white/60 relative z-10">
        <CardContent className="p-8">
          {renderStep()}
        </CardContent>
      </Card>

      {currentStepIndex === dynamicSteps.length - 1 && (
        <div className="mt-6 text-center relative z-10">
          <Button 
            onClick={handleRestart}
            variant="outline"
            className={`bg-white/90 hover:bg-white border-2 font-bold py-3 px-6 rounded-full shadow-lg ${
              dynamicTheme 
                ? `border-${dynamicTheme.colors.primary} text-${dynamicTheme.colors.primary} hover:text-${dynamicTheme.colors.primary}-700`
                : 'border-red-500 text-red-600 hover:text-red-700'
            }`}
          >
            🎮 Nova Aventura
          </Button>
        </div>
      )}
    </div>
  );
};

export default GameEngine;
