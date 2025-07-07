
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { GenerateContentRequest } from './types.ts';
import { generateStory } from './generators/storyGenerator.ts';
import { generateQuestion } from './generators/questionGenerator.ts';
import { generateCharacterInfo } from './generators/characterGenerator.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = "https://zgiriounlmdqrqjudgzw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaXJpb3VubG1kcXJxanVkZ3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NTMxOTYsImV4cCI6MjA2NTEyOTE5Nn0.pGHjmI3fXJ52dCaBZAjG874B3CY11BHHiH1bhHbNDLM";

const supabase = createClient(supabaseUrl, supabaseKey);

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
