
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
  theme: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  forceRegenerate?: boolean;
}

const generateWithGemini = async (prompt: string) => {
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  
  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
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
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Invalid response from Gemini API');
  }
  
  return data.candidates[0].content.parts[0].text;
};

const generateStory = async (theme: string) => {
  const prompt = `
  Crie uma história curta e envolvente de Demon Slayer com o personagem ${theme}.
  A história deve:
  - Ter entre 150-200 palavras
  - Incluir uma situação onde matemática é importante
  - Ser adequada para crianças
  - Terminar com um desafio matemático sendo apresentado
  - Usar linguagem brasileira
  - Incluir elementos únicos do personagem ${theme}
  
  Formato: Retorne apenas o texto da história, sem formatação extra.
  `;
  
  const content = await generateWithGemini(prompt);
  
  return {
    title: `A Aventura de ${theme}`,
    content: content.trim()
  };
};

const generateQuestion = async (theme: string, difficulty: string) => {
  const difficultyLevels = {
    easy: "números de 1 a 20, operações básicas",
    medium: "números de 1 a 100, multiplicação e divisão simples",
    hard: "números maiores, frações simples, problemas de múltiplas etapas"
  };
  
  const prompt = `
  Crie uma questão de matemática temática de Demon Slayer com ${theme}.
  
  Dificuldade: ${difficulty} (${difficultyLevels[difficulty as keyof typeof difficultyLevels]})
  
  A questão deve:
  - Ser contextualizada com uma situação envolvendo ${theme}
  - Ter exatamente 4 alternativas de resposta
  - Ter apenas uma resposta correta
  - Incluir uma palavra secreta relacionada ao tema (ex: "coragem", "técnica", "respiração")
  - Ser adequada para crianças brasileiras
  
  Formato JSON:
  {
    "content": "texto da questão aqui",
    "choices": ["alternativa A", "alternativa B", "alternativa C", "alternativa D"],
    "answer": "alternativa correta exata",
    "word": "palavra secreta de uma palavra"
  }
  
  Retorne apenas o JSON válido, sem formatação extra.
  `;
  
  const content = await generateWithGemini(prompt);
  
  try {
    // Limpar possível formatação markdown
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error('Erro ao parsear JSON:', error);
    // Fallback para questão padrão
    return {
      content: `${theme} precisa calcular quantos demônios derrotou. Se derrotou 3 demônios pela manhã e 5 à tarde, quantos derrotou no total?`,
      choices: ["6 demônios", "7 demônios", "8 demônios", "9 demônios"],
      answer: "8 demônios",
      word: "vitória"
    };
  }
};

const generateCharacterInfo = async (theme: string) => {
  const prompt = `
  Crie informações sobre o personagem ${theme} de Demon Slayer.
  
  Retorne um JSON com:
  - background_description: descrição para buscar imagens de fundo temáticas
  - personality_traits: 3 características marcantes
  - special_abilities: habilidades especiais do personagem
  - motivations: motivações principais
  
  Formato JSON válido, sem formatação extra.
  `;
  
  const content = await generateWithGemini(prompt);
  
  try {
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error('Erro ao parsear character info:', error);
    return {
      background_description: `${theme} em paisagem japonesa tradicional com elementos místicos`,
      personality_traits: ["Determinado", "Corajoso", "Leal"],
      special_abilities: ["Técnicas de respiração"],
      motivations: ["Proteger os inocentes", "Derrotar demônios"]
    };
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contentType, theme, difficulty = 'medium', forceRegenerate = false }: GenerateContentRequest = await req.json();

    console.log(`Gerando conteúdo: ${contentType} para ${theme}`);

    // Verificar se já existe conteúdo em cache
    if (!forceRegenerate) {
      const { data: cachedContent } = await supabase
        .from('generated_content')
        .select('content')
        .eq('content_type', contentType)
        .eq('theme', theme)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (cachedContent) {
        console.log('Retornando conteúdo do cache');
        return new Response(JSON.stringify(cachedContent.content), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Gerar novo conteúdo
    let generatedContent;
    
    switch (contentType) {
      case 'story':
        generatedContent = await generateStory(theme);
        break;
      case 'question':
        generatedContent = await generateQuestion(theme, difficulty);
        break;
      case 'character_info':
        generatedContent = await generateCharacterInfo(theme);
        break;
      default:
        throw new Error(`Tipo de conteúdo não suportado: ${contentType}`);
    }

    // Salvar no cache
    await supabase
      .from('generated_content')
      .insert({
        content_type: contentType,
        theme: theme,
        content: generatedContent,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias
      });

    console.log('Conteúdo gerado e salvo no cache');

    return new Response(JSON.stringify(generatedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na geração de conteúdo:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro ao gerar conteúdo',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
