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

// Função para chamada da API Gemini com retry e timeout
const generateWithGemini = async (prompt: string): Promise<string> => {
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  
  if (!geminiApiKey) {
    console.error('GEMINI_API_KEY não configurada');
    throw new Error('GEMINI_API_KEY not configured');
  }
  
  console.log('Iniciando chamada para API Gemini...');
  
  const maxRetries = 3;
  const timeoutMs = 30000; // 30 segundos
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Tentativa ${attempt}/${maxRetries} para API Gemini`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
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
              temperature: 0.8,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
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
        
        // Backoff exponencial
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
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
      
      // Backoff exponencial
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  throw new Error('Max retries exceeded');
};

const generateStory = async (subject: string, theme: string, schoolGrade: string, themeDetails?: string) => {
  // Adaptar complexidade da linguagem baseada na série
  const gradeNumber = parseInt(schoolGrade.charAt(0));
  let languageLevel = "";
  let contentComplexity = "";
  
  if (gradeNumber >= 1 && gradeNumber <= 3) {
    languageLevel = "linguagem simples e frases curtas";
    contentComplexity = "conceitos básicos e situações do dia a dia";
  } else if (gradeNumber >= 4 && gradeNumber <= 6) {
    languageLevel = "linguagem clara com vocabulário intermediário";
    contentComplexity = "conceitos intermediários com exemplos práticos";
  } else {
    languageLevel = "linguagem mais elaborada";
    contentComplexity = "conceitos mais complexos e abstratos";
  }

  const prompt = `
  Crie uma história curta e envolvente de ${subject} com o tema ${theme} para o ${schoolGrade} do ensino fundamental.
  
  Parâmetros específicos:
  - Matéria: ${subject}
  - Tema: ${theme}
  - Série: ${schoolGrade}
  ${themeDetails ? `- Detalhes específicos: ${themeDetails}` : ''}
  
  A história deve:
  - Ter entre 150-200 palavras
  - Usar ${languageLevel} apropriada para ${schoolGrade}
  - Focar em ${contentComplexity} de ${subject}
  - Incluir uma situação onde o conhecimento de ${subject} é importante
  - Ser adequada para crianças do ${schoolGrade}
  - Terminar com um desafio relacionado a ${subject} sendo apresentado
  - Usar linguagem brasileira
  - Incorporar elementos do tema ${theme}
  
  Formato: Retorne apenas o texto da história, sem formatação extra.
  `;
  
  try {
    const content = await generateWithGemini(prompt);
    return {
      title: `Aventura de ${subject}: ${theme}`,
      content: content.trim()
    };
  } catch (error) {
    console.error('Erro ao gerar história:', error);
    // Fallback para história padrão adaptada à matéria
    return {
      title: `Aventura de ${subject}: ${theme}`,
      content: `Bem-vindo à sua aventura de ${subject} sobre ${theme}! Você está no ${schoolGrade} e vai enfrentar desafios incríveis relacionados a ${subject}. Prepare-se para testar seus conhecimentos e descobrir coisas fantásticas sobre ${theme}. Vamos começar esta jornada de aprendizado!`
    };
  }
};

const generateQuestion = async (subject: string, theme: string, schoolGrade: string, difficulty: string, themeDetails?: string) => {
  // Adaptar dificuldade baseada na série
  const gradeNumber = parseInt(schoolGrade.charAt(0));
  let difficultyDescription = "";
  
  if (gradeNumber >= 1 && gradeNumber <= 3) {
    difficultyDescription = "números simples de 1 a 20, operações básicas de soma e subtração";
  } else if (gradeNumber >= 4 && gradeNumber <= 6) {
    difficultyDescription = "números de 1 a 100, multiplicação e divisão simples, problemas práticos";
  } else {
    difficultyDescription = "números maiores, frações simples, problemas de múltiplas etapas, conceitos mais abstratos";
  }
  
  const prompt = `
  Crie uma questão de ${subject} com tema ${theme} para o ${schoolGrade} do ensino fundamental.
  
  Parâmetros específicos:
  - Matéria: ${subject}
  - Tema: ${theme}
  - Série: ${schoolGrade}
  - Dificuldade apropriada: ${difficultyDescription}
  ${themeDetails ? `- Detalhes específicos: ${themeDetails}` : ''}
  
  A questão deve:
  - Ser contextualizada com uma situação envolvendo ${theme} e ${subject}
  - Ter EXATAMENTE 4 alternativas de resposta (A, B, C, D)
  - Ter apenas uma resposta correta
  - Ser apropriada para ${schoolGrade} do ensino fundamental
  - Incluir uma palavra secreta relacionada ao tema (ex: para História: "descoberta", para Ciências: "experiência")
  - Ser adequada para crianças brasileiras
  - Usar ${difficultyDescription}
  
  IMPORTANTE: A resposta deve ter EXATAMENTE 4 alternativas, nem mais nem menos.
  
  Retorne APENAS um JSON válido no seguinte formato:
  {
    "content": "texto da questão aqui",
    "choices": ["alternativa A", "alternativa B", "alternativa C", "alternativa D"],
    "answer": "alternativa correta exata",
    "word": "palavra secreta de uma palavra"
  }
  
  Certifique-se de que o array "choices" tenha EXATAMENTE 4 elementos.
  `;
  
  try {
    const content = await generateWithGemini(prompt);
    
    // Limpar possível formatação markdown
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    console.log('Conteúdo limpo para parsing:', cleanContent);
    
    const parsed = JSON.parse(cleanContent);
    
    // Validar estrutura
    if (!parsed.content || !parsed.choices || !parsed.answer || !parsed.word) {
      throw new Error('JSON inválido - campos obrigatórios ausentes');
    }
    
    if (!Array.isArray(parsed.choices) || parsed.choices.length !== 4) {
      console.error('Choices inválido:', parsed.choices);
      throw new Error('JSON inválido - choices deve ser array com EXATAMENTE 4 elementos');
    }
    
    return parsed;
    
  } catch (error) {
    console.error('Erro ao gerar questão:', error);
    // Fallback para questão padrão adaptada à matéria e série
    const fallbackWord = subject === 'Matemática' ? 'cálculo' : 
                        subject === 'História' ? 'descoberta' :
                        subject === 'Ciências' ? 'experiência' :
                        subject === 'Português' ? 'palavra' :
                        subject === 'Geografia' ? 'exploração' : 'conhecimento';
    
    return {
      content: `Questão de ${subject} (${schoolGrade}) sobre ${theme}: Se você tem 2 + 2, qual é o resultado?`,
      choices: ["3", "4", "5", "6"],
      answer: "4",
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

    console.log(`Gerando conteúdo: ${contentType} para ${subject} - ${theme} (${schoolGrade})`);

    // Criar chave de cache mais específica
    const cacheKey = `${contentType}_${subject}_${theme}_${schoolGrade}_${difficulty}`;
    
    // Verificar cache consolidado
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
          console.log('Retornando conteúdo do cache:', cacheKey);
          return new Response(JSON.stringify(cachedContent.content), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } catch (cacheError) {
        console.log('Cache não encontrado, gerando novo conteúdo');
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

    // Salvar no cache consolidado
    try {
      const { error: saveError } = await supabase
        .from('generated_content')
        .insert({
          content_type: contentType,
          theme: cacheKey,
          content: generatedContent,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
        });

      if (saveError) {
        console.error('Erro ao salvar no cache:', saveError);
      } else {
        console.log('Conteúdo salvo no cache:', cacheKey);
      }
    } catch (cacheError) {
      console.error('Erro ao salvar cache:', cacheError);
    }

    console.log('Conteúdo gerado com sucesso');

    return new Response(JSON.stringify(generatedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na geração de conteúdo:', error);
    
    // Fallback robusto
    const fallbackContent = {
      title: "História Personalizada",
      content: "Prepare-se para uma aventura de aprendizado personalizada!"
    };
    
    return new Response(JSON.stringify(fallbackContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
