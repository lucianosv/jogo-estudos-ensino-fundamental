// HOOK OTIMIZADO PARA GERAÇÃO DE QUESTÕES - SUBSTITUI useAIContent
import { useState, useCallback } from 'react';
import { GameParameters } from '@/components/GameSetup';
import QuestionGenerationService, { Question } from '@/services/QuestionGenerationService';
import { useToast } from '@/hooks/use-toast';

interface UseQuestionGenerationReturn {
  generateQuestionSet: (gameParams: GameParameters) => Promise<Question[]>;
  generateSingleQuestion: (gameParams: GameParameters, index: number) => Promise<Question>;
  isLoading: boolean;
  clearCache: () => void;
}

export const useQuestionGeneration = (): UseQuestionGenerationReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const questionService = QuestionGenerationService.getInstance();

  const generateQuestionSet = useCallback(async (gameParams: GameParameters): Promise<Question[]> => {
    setIsLoading(true);
    try {
      console.log(`[HOOK] 🎮 Gerando conjunto de questões para ${gameParams.subject} - ${gameParams.theme}`);
      
      const questions = await questionService.generateQuestionSet(gameParams);
      
      if (questions.length !== 4) {
        throw new Error(`Esperadas 4 questões, recebidas ${questions.length}`);
      }
      
      console.log(`[HOOK] ✅ Conjunto gerado com sucesso:`, questions.map(q => ({
        content: q.content.substring(0, 50),
        word: q.word,
        source: q.source
      })));
      
      return questions;
      
    } catch (error) {
      console.error(`[HOOK] ❌ Erro ao gerar conjunto:`, error);
      toast({
        title: "Erro na geração",
        description: "Houve um problema ao gerar as questões. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [questionService, toast]);

  const generateSingleQuestion = useCallback(async (
    gameParams: GameParameters, 
    index: number
  ): Promise<Question> => {
    setIsLoading(true);
    try {
      console.log(`[HOOK] 🎯 Gerando questão individual ${index + 1}`);
      
      const question = await questionService.generateUniqueQuestion(gameParams, index);
      
      console.log(`[HOOK] ✅ Questão individual gerada:`, {
        content: question.content.substring(0, 50),
        word: question.word,
        source: question.source
      });
      
      return question;
      
    } catch (error) {
      console.error(`[HOOK] ❌ Erro ao gerar questão individual:`, error);
      toast({
        title: "Erro na geração",
        description: "Houve um problema ao gerar a questão. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [questionService, toast]);

  const clearCache = useCallback(() => {
    questionService.clearCache();
    console.log(`[HOOK] 🧹 Cache limpo`);
  }, [questionService]);

  return {
    generateQuestionSet,
    generateSingleQuestion,
    isLoading,
    clearCache
  };
};