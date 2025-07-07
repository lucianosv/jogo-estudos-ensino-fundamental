import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = "https://zgiriounlmdqrqjudgzw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaXJpb3VubG1kcXJxanVkZ3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NTMxOTYsImV4cCI6MjA2NTEyOTE5Nn0.pGHjmI3fXJ52dCaBZAjG874B3CY11BHHiH1bhHbNDLM";

const supabase = createClient(supabaseUrl, supabaseKey);

interface GenerateContentRequest {
  contentType: 'story' | 'question' | 'character_info';
  subject: string;
  theme: string;
  schoolGrade: string;
  themeDetails?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  forceRegenerate?: boolean;
}

// Validação de conteúdo para garantir relevância temática
const validateContent = (content: any, subject: string, theme: string): boolean => {
  if (!content) return false;
  
  const contentStr = JSON.stringify(content).toLowerCase();
  const subjectLower = subject.toLowerCase();
  const themeLower = theme.toLowerCase();
  
  // Palavras proibidas que indicam conteúdo inadequado
  const forbiddenWords = ['demon', 'demônio', 'devil', 'diabo', 'anime', 'manga', 'slayer', 'matador'];
  const hasForbiddenContent = forbiddenWords.some(word => contentStr.includes(word));
  
  if (hasForbiddenContent) {
    console.log(`Conteúdo rejeitado por conter palavras inadequadas: ${contentStr.substring(0, 100)}...`);
    return false;
  }
  
  // Verificar se o conteúdo está relacionado ao tema
  if (themeLower.includes('solar') || themeLower.includes('planeta')) {
    const spaceWords = ['planeta', 'sol', 'sistema', 'espaço', 'universo', 'estrela', 'órbita'];
    const hasSpaceContent = spaceWords.some(word => contentStr.includes(word));
    if (!hasSpaceContent) {
      console.log(`Conteúdo rejeitado por não ser sobre Sistema Solar: ${contentStr.substring(0, 100)}...`);
      return false;
    }
  }
  
  return true;
};

// Função melhorada para chamada da API Gemini
const generateWithGemini = async (prompt: string): Promise<string> => {
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  
  if (!geminiApiKey) {
    console.error('GEMINI_API_KEY não configurada');
    throw new Error('GEMINI_API_KEY not configured');
  }
  
  console.log('Iniciando chamada para API Gemini 1.5 Flash...');
  
  const maxRetries = 2; // Reduzido para ser mais rápido
  const timeoutMs = 15000; // Reduzido para 15 segundos
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Tentativa ${attempt}/${maxRetries} para API Gemini`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.3, // Reduzido para mais consistência
              topK: 20,
              topP: 0.8,
              maxOutputTokens: 800, // Reduzido para respostas mais focadas
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH", 
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erro da API Gemini (tentativa ${attempt}):`, response.status, errorText);
        
        if (attempt === maxRetries) {
          throw new Error(`Gemini API error after ${maxRetries} attempts: ${response.status} - ${errorText}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }

      const data = await response.json();
      console.log('Resposta da API Gemini recebida com sucesso');
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error('Estrutura de resposta inválida:', data);
        throw new Error('Invalid response structure from Gemini API');
      }
      
      return data.candidates[0].content.parts[0].text;
      
    } catch (error) {
      console.error(`Erro na tentativa ${attempt}:`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  throw new Error('Max retries exceeded');
};

const generateStory = async (subject: string, theme: string, schoolGrade: string, themeDetails?: string) => {
  const gradeNumber = parseInt(schoolGrade.charAt(0));
  let languageLevel = "";
  let contentComplexity = "";
  
  if (gradeNumber >= 1 && gradeNumber <= 3) {
    languageLevel = "linguagem muito simples, frases curtas";
    contentComplexity = "conceitos básicos e situações do cotidiano";
  } else if (gradeNumber >= 4 && gradeNumber <= 6) {
    languageLevel = "linguagem clara e direta";
    contentComplexity = "conceitos intermediários com exemplos práticos";
  } else {
    languageLevel = "linguagem adequada para adolescentes";
    contentComplexity = "conceitos mais elaborados";
  }

  const prompt = `
IMPORTANTE: Você DEVE criar uma história APENAS sobre ${subject} e especificamente sobre ${theme}.

Crie uma história educativa curta sobre:
- Matéria: ${subject}
- Tema ESPECÍFICO: ${theme}
- Série: ${schoolGrade}

REGRAS OBRIGATÓRIAS:
1. A história DEVE ser sobre ${theme} dentro da matéria ${subject}
2. Use ${languageLevel}
3. Foque EXCLUSIVAMENTE em ${contentComplexity} de ${subject}
4. Tenha entre 100-150 palavras
5. Termine com um desafio relacionado ao tema ${theme}
6. NÃO mencione animes, demônios, personagens fictícios ou temas inadequados
7. Seja educativo e apropriado para crianças brasileiras

${theme.toLowerCase().includes('solar') ? 'ESPECIAL: Como o tema é Sistema Solar, fale APENAS sobre planetas, estrelas, sol, espaço, astronomia.' : ''}

Retorne APENAS o texto da história, sem formatação extra.
  `;
  
  try {
    const content = await generateWithGemini(prompt);
    const storyData = {
      title: `${subject}: ${theme}`,
      content: content.trim()
    };
    
    // Validar conteúdo gerado
    if (!validateContent(storyData, subject, theme)) {
      throw new Error('Conteúdo gerado não passou na validação temática');
    }
    
    return storyData;
  } catch (error) {
    console.error('Erro ao gerar história, usando fallback:', error);
    return {
      title: `${subject}: ${theme}`,
      content: `Bem-vindo à sua aventura de ${subject} sobre ${theme}! Esta é uma jornada educativa especialmente criada para o ${schoolGrade}. Você descobrirá conceitos importantes sobre ${theme} e enfrentará desafios que testarão seus conhecimentos. Prepare-se para uma experiência de aprendizado única!`
    };
  }
};

const generateQuestion = async (subject: string, theme: string, schoolGrade: string, difficulty: string, themeDetails?: string) => {
  const gradeNumber = parseInt(schoolGrade.charAt(0));
  let difficultyDescription = "";
  
  if (gradeNumber >= 1 && gradeNumber <= 3) {
    difficultyDescription = "conceitos muito básicos, linguagem simples";
  } else if (gradeNumber >= 4 && gradeNumber <= 6) {
    difficultyDescription = "conceitos intermediários, problemas práticos";
  } else {
    difficultyDescription = "conceitos mais avançados, pensamento crítico";
  }
  
  const prompt = `
IMPORTANTE: Você DEVE criar uma questão APENAS sobre ${subject} e especificamente sobre ${theme}.

Crie uma questão de múltipla escolha sobre:
- Matéria: ${subject}
- Tema ESPECÍFICO: ${theme}
- Série: ${schoolGrade}

REGRAS OBRIGATÓRIAS:
1. A questão DEVE ser sobre ${theme} dentro da matéria ${subject}
2. Use ${difficultyDescription} apropriados para ${schoolGrade}
3. Tenha EXATAMENTE 4 alternativas
4. Seja educativa e adequada para crianças brasileiras
5. NÃO mencione animes, demônios, personagens fictícios ou temas inadequados
6. A palavra secreta deve estar relacionada ao tema ${theme}

${theme.toLowerCase().includes('solar') ? 'ESPECIAL: Como o tema é Sistema Solar, a questão DEVE ser sobre planetas, estrelas, sol, espaço, astronomia.' : ''}

Retorne APENAS um JSON válido no formato:
{
  "content": "pergunta aqui",
  "choices": ["opção A", "opção B", "opção C", "opção D"],
  "answer": "resposta correta exata",
  "word": "palavra-secreta-relacionada-ao-tema"
}
  `;
  
  try {
    const content = await generateWithGemini(prompt);
    
    // Parsing mais tolerante
    let cleanContent = content.trim();
    cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    cleanContent = cleanContent.replace(/^[^{]*({.*})[^}]*$/s, '$1');
    
    console.log('Conteúdo limpo para parsing:', cleanContent);
    
    const parsed = JSON.parse(cleanContent);
    
    // Validação rigorosa
    if (!parsed.content || !parsed.choices || !parsed.answer || !parsed.word) {
      throw new Error('JSON inválido - campos obrigatórios ausentes');
    }
    
    if (!Array.isArray(parsed.choices) || parsed.choices.length !== 4) {
      throw new Error('JSON inválido - choices deve ter exatamente 4 elementos');
    }
    
    // Validar conteúdo temático
    if (!validateContent(parsed, subject, theme)) {
      throw new Error('Conteúdo gerado não passou na validação temática');
    }
    
    return parsed;
    
  } catch (error) {
    console.error('Erro ao gerar questão, usando fallback temático:', error);
    
    // Fallback específico por tema
    const fallbackWord = theme.toLowerCase().includes('solar') ? 'planeta' : 
                        subject === 'História' ? 'descoberta' :
                        subject === 'Ciências' ? 'experiência' :
                        subject === 'Português' ? 'palavra' :
                        subject === 'Geografia' ? 'exploração' : 'conhecimento';
    
    if (theme.toLowerCase().includes('solar')) {
      return {
        content: `Sistema Solar (${schoolGrade}): Qual é o planeta mais próximo do Sol?`,
        choices: ["Vênus", "Terra", "Mercúrio", "Marte"],
        answer: "Mercúrio",
        word: "planeta"
      };
    }
    
    return {
      content: `${subject} - ${theme} (${schoolGrade}): Questão básica sobre o tema. Quanto é 1 + 1?`,
      choices: ["1", "2", "3", "4"],
      answer: "2",
      word: fallbackWord
    };
  }
};

const generateCharacterInfo = async (subject: string, theme: string, schoolGrade: string, themeDetails?: string) => {
  const prompt = `
  Crie informações sobre o tema ${theme} relacionado à matéria ${subject} para o ${schoolGrade} do ensino fundamental.
  
  Parâmetros específicos:
  - Matéria: ${subject}
  - Tema: ${theme}
  - Série: ${schoolGrade}
  ${themeDetails ? `- Detalhes específicos: ${themeDetails}` : ''}
  
  Retorne APENAS um JSON válido no seguinte formato:
  {
    "background_description": "descrição para buscar imagens de fundo relacionadas a ${subject} e ${theme}",
    "personality_traits": ["característica1", "característica2", "característica3"],
    "special_abilities": ["habilidade1", "habilidade2"],
    "motivations": ["motivação1", "motivação2"]
  }
  `;
  
  try {
    const content = await generateWithGemini(prompt);
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanContent);
    
    // Validar estrutura básica
    if (!parsed.background_description || !parsed.personality_traits || !parsed.special_abilities || !parsed.motivations) {
      throw new Error('JSON inválido - campos obrigatórios ausentes');
    }
    
    return parsed;
    
  } catch (error) {
    console.error('Erro ao gerar info do tema:', error);
    return {
      background_description: `${theme} relacionado a ${subject} em ambiente educativo para ${schoolGrade}`,
      personality_traits: ["Curioso", "Inteligente", "Dedicado"],
      special_abilities: [`Conhecimento de ${subject}`],
      motivations: ["Aprender mais", "Resolver desafios"]
    };
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      contentType, 
      subject, 
      theme, 
      schoolGrade, 
      themeDetails,
      difficulty = 'medium', 
      forceRegenerate = false 
    }: GenerateContentRequest = await req.json();

    console.log(`[API-GEMINI] Gerando ${contentType} para ${subject} - ${theme} (${schoolGrade})`);

    // Cache mais específico com tempo reduzido
    const cacheKey = `${contentType}_${subject}_${theme}_${schoolGrade}_v2`;
    
    if (!forceRegenerate) {
      try {
        const { data: cachedContent, error: cacheError } = await supabase
          .from('generated_content')
          .select('content')
          .eq('content_type', contentType)
          .eq('theme', cacheKey)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!cacheError && cachedContent?.content) {
          console.log(`[CACHE-HIT] Retornando do cache: ${cacheKey}`);
          return new Response(JSON.stringify(cachedContent.content), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          console.log(`[CACHE-MISS] Cache não encontrado para: ${cacheKey}`);
        }
      } catch (cacheError) {
        console.log('[CACHE-ERROR] Erro ao acessar cache, gerando novo conteúdo');
      }
    }

    // Gerar novo conteúdo
    let generatedContent;
    
    switch (contentType) {
      case 'story':
        generatedContent = await generateStory(subject, theme, schoolGrade, themeDetails);
        break;
      case 'question':
        generatedContent = await generateQuestion(subject, theme, schoolGrade, difficulty, themeDetails);
        break;
      case 'character_info':
        generatedContent = await generateCharacterInfo(subject, theme, schoolGrade, themeDetails);
        break;
      default:
        throw new Error(`Tipo de conteúdo não suportado: ${contentType}`);
    }

    // Salvar no cache com tempo reduzido (6 horas)
    try {
      const { error: saveError } = await supabase
        .from('generated_content')
        .insert({
          content_type: contentType,
          theme: cacheKey,
          content: generatedContent,
          expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
        });

      if (saveError) {
        console.error('[CACHE-SAVE-ERROR]:', saveError);
      } else {
        console.log(`[CACHE-SAVED] Conteúdo salvo: ${cacheKey}`);
      }
    } catch (cacheError) {
      console.error('[CACHE-ERROR] Erro ao salvar:', cacheError);
    }

    console.log(`[SUCCESS] Conteúdo gerado para ${subject} - ${theme}`);

    return new Response(JSON.stringify(generatedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[CRITICAL-ERROR] Erro na geração de conteúdo:', error);
    
    const fallbackContent = {
      title: "Conteúdo Educativo",
      content: "Prepare-se para uma aventura de aprendizado!"
    };
    
    return new Response(JSON.stringify(fallbackContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
