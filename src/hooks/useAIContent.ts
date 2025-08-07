import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GameParameters } from '@/components/GameSetup';
import { generateIntelligentFallback, validateGeneratedContent } from '@/utils/intelligentFallbacks';
import { getExpandedGranularFallback, ensureUniqueKeywords } from '@/utils/expandedGranularFallbacks';
import { validateUniqueQuestions, finalValidation } from '@/utils/uniqueContentValidator';
import { getRomaQuestionByIndex } from '@/utils/expandedRomaFallbacks';

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

// Chave de cache ultra-específica incluindo índice da questão e força regeneração
const generateUltraSpecificCacheKey = (contentType: string, gameParams: GameParameters, questionIndex?: number): string => {
  const timestamp = Date.now(); // Usar timestamp exato para garantir unicidade
  const randomSeed = Math.floor(Math.random() * 10000); // Aumentar range do random
  const subjectKey = gameParams.subject.replace(/\s+/g, '_');
  const themeKey = gameParams.theme.replace(/\s+/g, '_');
  const indexSuffix = questionIndex !== undefined ? `_q${questionIndex}` : '';
  const uniqueSession = Math.floor(Math.random() * 100000); // Adicionar sessão única
  return `${contentType}_${subjectKey}_${themeKey}_${gameParams.schoolGrade}_v4_${timestamp}_${randomSeed}_${uniqueSession}${indexSuffix}`;
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
      const intelligentFallback = generateIntelligentFallback(gameParams, contentType as 'story' | 'question' | 'character_info', questionIndex);
      
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
        const subjects = {
          'Ciências': {
            'corpo humano': [
              {
                content: `Qual é a função principal do coração no sistema circulatório?`,
                choices: ["Filtrar toxinas", "Bombear sangue", "Produzir hormônios", "Digerir alimentos"],
                answer: "Bombear sangue",
                word: "circulação"
              },
              {
                content: `Quantos pulmões possui o sistema respiratório humano?`,
                choices: ["Um pulmão", "Dois pulmões", "Três pulmões", "Quatro pulmões"],
                answer: "Dois pulmões",
                word: "respiração"
              },
              {
                content: `Qual órgão controla todas as funções do corpo humano?`,
                choices: ["Coração", "Fígado", "Cérebro", "Rins"],
                answer: "Cérebro",
                word: "neurônio"
              },
              {
                content: `Quantos ossos aproximadamente possui um adulto?`,
                choices: ["150", "180", "206", "250"],
                answer: "206",
                word: "esqueleto"
              }
            ],
            'sistema solar': [
              {
                content: `Qual é o planeta mais próximo do Sol?`,
                choices: ["Vênus", "Terra", "Mercúrio", "Marte"],
                answer: "Mercúrio",
                word: "órbita"
              },
              {
                content: `Quantos planetas existem no Sistema Solar?`,
                choices: ["7", "8", "9", "10"],
                answer: "8",
                word: "astronomia"
              },
              {
                content: `Qual é o maior planeta do Sistema Solar?`,
                choices: ["Terra", "Saturno", "Júpiter", "Netuno"],
                answer: "Júpiter",
                word: "gravidade"
              },
              {
                content: `O que causa o dia e a noite na Terra?`,
                choices: ["Translação", "Rotação", "Lua", "Sol"],
                answer: "Rotação",
                word: "movimento"
              }
            ]
          },
          'Matemática': {
            'operações': [
              {
                content: `Quanto é 15 + 27?`,
                choices: ["40", "41", "42", "43"],
                answer: "42",
                word: "soma"
              },
              {
                content: `Quanto é 8 × 7?`,
                choices: ["54", "55", "56", "57"],
                answer: "56",
                word: "multiplicação"
              },
              {
                content: `Quanto é 100 - 37?`,
                choices: ["61", "62", "63", "64"],
                answer: "63",
                word: "subtração"
              },
              {
                content: `Quanto é 48 ÷ 6?`,
                choices: ["6", "7", "8", "9"],
                answer: "8",
                word: "divisão"
              }
            ]
          }
        };
        
        // Buscar questões específicas por tema com randomização
        const subjectQuestions = subjects[gameParams.subject as keyof typeof subjects];
        if (subjectQuestions) {
          const themeKey = Object.keys(subjectQuestions).find(key => 
            gameParams.theme.toLowerCase().includes(key.toLowerCase())
          );
          
          if (themeKey) {
            const themeQuestions = subjectQuestions[themeKey as keyof typeof subjectQuestions] as any[];
            if (themeQuestions && Array.isArray(themeQuestions) && themeQuestions.length > 0) {
              // Usar índice específico para garantir questões diferentes
              const questionIdx = (questionIndex || 0) % themeQuestions.length;
              const selectedQuestion = { ...themeQuestions[questionIdx] };
              
              // Adicionar timestamp à palavra para garantir unicidade
              selectedQuestion.word = `${selectedQuestion.word}_${Date.now()}`;
              
              console.log(`[AI-CONTENT] ✅ Fallback específico para questão ${questionIndex}: ${selectedQuestion.content.substring(0, 50)}...`);
              return selectedQuestion;
            }
          }
        }
        
        // Fallback genérico com índice único
        return {
          content: `${gameParams.subject} - ${gameParams.theme}: Questão ${(questionIndex || 0) + 1}`,
          choices: [`Resposta A-${questionIndex}`, `Resposta B-${questionIndex}`, `Resposta C-${questionIndex}`, `Resposta D-${questionIndex}`],
          answer: `Resposta A-${questionIndex}`,
          word: `palavra${(questionIndex || 0) + 1}`
        };
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
