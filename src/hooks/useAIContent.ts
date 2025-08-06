import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GameParameters } from '@/components/GameSetup';
import { generateIntelligentFallback, validateGeneratedContent } from '@/utils/intelligentFallbacks';
import { getExpandedGranularFallback, ensureUniqueKeywords } from '@/utils/expandedGranularFallbacks';

interface AIContentHook {
  generateStory: (gameParams: GameParameters) => Promise<any>;
  generateQuestion: (gameParams: GameParameters, questionIndex?: number, difficulty?: string) => Promise<any>;
  generateCharacterInfo: (gameParams: GameParameters) => Promise<any>;
  isLoading: boolean;
}

// Validação melhorada de entrada
const validateInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input');
  }
  return input.trim().substring(0, 100);
};

// Mapear dificuldade baseada na série escolar
const getDifficultyForGrade = (schoolGrade: string): string => {
  const grade = parseInt(schoolGrade.charAt(0));
  if (grade >= 1 && grade <= 3) return 'easy';
  if (grade >= 4 && grade <= 6) return 'medium';
  if (grade >= 7 && grade <= 9) return 'hard';
  return 'medium';
};

// Chave de cache ultra-específica incluindo índice da questão
const generateUltraSpecificCacheKey = (contentType: string, gameParams: GameParameters, questionIndex?: number): string => {
  const timestamp = Math.floor(Date.now() / (1000 * 60 * 5)); // 5 minutos
  const randomSeed = Math.floor(Math.random() * 100);
  const subjectKey = gameParams.subject.replace(/\s+/g, '_');
  const themeKey = gameParams.theme.replace(/\s+/g, '_');
  const indexSuffix = questionIndex !== undefined ? `_q${questionIndex}` : '';
  return `${contentType}_${subjectKey}_${themeKey}_${gameParams.schoolGrade}_v3_${timestamp}_${randomSeed}${indexSuffix}`;
};

export const useAIContent = (): AIContentHook => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const callAIFunction = useCallback(async (contentType: string, gameParams: GameParameters, questionIndex?: number, customDifficulty?: string) => {
    if (isLoading) {
      console.log('[AI-CONTENT] 🔄 Já está carregando, ignorando nova chamada');
      return null;
    }

    setIsLoading(true);
    
    try {
      // Validar entradas
      const sanitizedSubject = validateInput(gameParams.subject);
      const sanitizedTheme = validateInput(gameParams.theme);
      const sanitizedGrade = validateInput(gameParams.schoolGrade);
      const difficulty = customDifficulty || getDifficultyForGrade(gameParams.schoolGrade);
      
      console.log(`[AI-CONTENT] 🎯 GERANDO QUESTÃO ${questionIndex || 0}: ${sanitizedSubject} -> ${sanitizedTheme} -> ${sanitizedGrade}`);

      // ✅ PRIORIDADE 1: FALLBACK EXPANDIDO GRANULAR COM ÍNDICE
      if (contentType === 'question' && questionIndex !== undefined) {
        console.log(`[AI-CONTENT] 🥇 PRIORIDADE 1: Tentando fallback expandido granular para questão ${questionIndex}`);
        const expandedFallback = getExpandedGranularFallback(gameParams, 'question', questionIndex);
        
        if (expandedFallback && !Array.isArray(expandedFallback)) {
          console.log(`[AI-CONTENT] ✅ SUCESSO PRIORIDADE 1: Questão ${questionIndex} específica do fallback expandido`);
          return expandedFallback;
        }
      }

      // 🥈 PRIORIDADE 2: FALLBACK INTELIGENTE COM SEED
      console.log(`[AI-CONTENT] 🥈 PRIORIDADE 2: Tentando fallback inteligente com seed ${questionIndex}`);
      const intelligentFallback = generateIntelligentFallback(gameParams, contentType as 'story' | 'question' | 'character_info');
      
      if (intelligentFallback && validateGeneratedContent(intelligentFallback, gameParams)) {
        console.log(`[AI-CONTENT] ✅ SUCESSO PRIORIDADE 2: Fallback inteligente validado para questão ${questionIndex}`);
        return intelligentFallback;
      }

      // 🥉 PRIORIDADE 3: API GEMINI STREAMING COM SEED
      console.log(`[AI-CONTENT] 🥉 PRIORIDADE 3: Tentando API Gemini STREAMING para questão ${questionIndex}`);
      
      try {
        const ultraCacheKey = generateUltraSpecificCacheKey(contentType, gameParams, questionIndex);
        console.log(`[AI-CONTENT] 🔑 Chave ultra-específica: ${ultraCacheKey}`);
        
        const { data, error } = await supabase.functions.invoke('generate-game-content', {
          body: {
            contentType,
            subject: sanitizedSubject,
            theme: sanitizedTheme,
            schoolGrade: sanitizedGrade,
            themeDetails: gameParams.themeDetails,
            difficulty,
            questionIndex: questionIndex || 0,
            forceRegenerate: true,
            cacheKey: ultraCacheKey
          }
        });

        if (!error && data && validateGeneratedContent(data, gameParams)) {
          const dataStr = JSON.stringify(data).toLowerCase();
          if (!dataStr.includes('demônio') && !dataStr.includes('estava caminhando')) {
            console.log(`[AI-CONTENT] ✅ SUCESSO PRIORIDADE 3: API Gemini STREAMING validada para questão ${questionIndex}`);
            return data;
          } else {
            console.log(`[AI-CONTENT] 🚨 API Gemini retornou conteúdo corrompido para questão ${questionIndex} - rejeitado`);
          }
        } else {
          console.log(`[AI-CONTENT] ❌ API Gemini STREAMING falhou para questão ${questionIndex}:`, error);
        }
      } catch (apiError) {
        console.log(`[AI-CONTENT] ❌ Erro na API Gemini STREAMING para questão ${questionIndex}:`, apiError);
      }

      // 🚨 EMERGÊNCIA: Usar fallback específico por índice
      console.log(`[AI-CONTENT] 🚨 EMERGÊNCIA: Forçando fallback específico para questão ${questionIndex}`);
      
      // Criar questões específicas baseadas no índice para evitar duplicatas
      if (contentType === 'question') {
        if (gameParams.subject === 'Ciências' && gameParams.theme.toLowerCase().includes('corpo')) {
          const bodyQuestions = [
            {
              content: `Qual é a função principal do coração no corpo humano?`,
              choices: ["Filtrar o sangue", "Bombear sangue", "Produzir sangue", "Armazenar sangue"],
              answer: "Bombear sangue",
              word: "circulação"
            },
            {
              content: `Quantos pulmões temos no nosso sistema respiratório?`,
              choices: ["1 pulmão", "2 pulmões", "3 pulmões", "4 pulmões"],
              answer: "2 pulmões",
              word: "respiração"
            },
            {
              content: `Qual órgão é responsável pelo controle de todo o corpo?`,
              choices: ["Coração", "Fígado", "Cérebro", "Estômago"],
              answer: "Cérebro",
              word: "neurônio"
            },
            {
              content: `Aproximadamente quantos ossos tem o corpo humano adulto?`,
              choices: ["156 ossos", "186 ossos", "206 ossos", "256 ossos"],
              answer: "206 ossos",
              word: "esqueleto"
            }
          ];
          
          const questionIdx = (questionIndex || 0) % bodyQuestions.length;
          return bodyQuestions[questionIdx];
        } else {
          return {
            content: `${gameParams.subject} - ${gameParams.theme}: Questão ${(questionIndex || 0) + 1} sobre o tema`,
            choices: ["Opção A", "Opção B", "Opção C", "Opção D"],
            answer: "Opção A",
            word: `conhecimento${(questionIndex || 0) + 1}`
          };
        }
      } else if (contentType === 'story') {
        return {
          title: `${gameParams.subject}: ${gameParams.theme}`,
          content: `História educativa específica sobre ${gameParams.theme} em ${gameParams.subject}.`
        };
      }
      
      return null;

    } catch (error) {
      console.error(`[AI-CONTENT] ❌ ERRO GERAL FINAL para questão ${questionIndex}:`, error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const generateStory = useCallback(async (gameParams: GameParameters) => {
    console.log(`[STORY] 📚 Gerando história para: ${gameParams.subject} - ${gameParams.theme} - ${gameParams.schoolGrade}`);
    return await callAIFunction('story', gameParams);
  }, [callAIFunction]);

  const generateQuestion = useCallback(async (gameParams: GameParameters, questionIndex?: number, customDifficulty?: string) => {
    console.log(`[QUESTION] ❓ Gerando questão ${questionIndex || 0} para: ${gameParams.subject} - ${gameParams.theme} - ${gameParams.schoolGrade}`);
    return await callAIFunction('question', gameParams, questionIndex, customDifficulty);
  }, [callAIFunction]);

  const generateCharacterInfo = useCallback(async (gameParams: GameParameters) => {
    console.log(`[CHARACTER] 👤 Gerando info para: ${gameParams.subject} - ${gameParams.theme} - ${gameParams.schoolGrade}`);
    return await callAIFunction('character_info', gameParams);
  }, [callAIFunction]);

  return {
    generateStory,
    generateQuestion,
    generateCharacterInfo,
    isLoading
  };
};
