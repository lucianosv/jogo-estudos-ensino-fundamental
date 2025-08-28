
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

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? "https://zgiriounlmdqrqjudgzw.supabase.co";
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaXJpb3VubG1kcXJxanVkZ3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NTMxOTYsImV4cCI6MjA2NTEyOTE5Nn0.pGHjmI3fXJ52dCaBZAjG874B3CY11BHHiH1bhHbNDLM";

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

    console.log(`🎯 [API-GEMINI] Gerando ${contentType} para ${subject} - ${theme} (${schoolGrade})`);

    // FASE 2: LIMPAR CACHE CORROMPIDO DEFINITIVAMENTE
    if (forceRegenerate) {
      console.log('🧹 LIMPANDO CACHE CORROMPIDO...');
      try {
        const { error: deleteError } = await supabase
          .from('generated_content')
          .delete()
          .like('theme', `%${subject}%${theme}%`);
        
        if (!deleteError) {
          console.log('✅ Cache corrompido removido');
        }
      } catch (cleanError) {
        console.log('⚠️ Erro ao limpar cache, continuando...');
      }
    }

    // Cache ultra-específico com timestamp e randomização
    const timestamp = Math.floor(Date.now() / (1000 * 60 * 5)); // 5 minutos
    const randomSeed = Math.floor(Math.random() * 100);
    const cacheKey = `${contentType}_${subject}_${theme}_${schoolGrade}_v3_${timestamp}_${randomSeed}`;
    
    console.log(`🔑 Chave de cache: ${cacheKey}`);

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
          // VALIDAÇÃO ANTI-CORRUPÇÃO NO CACHE
          const contentStr = JSON.stringify(cachedContent.content).toLowerCase();
          if (contentStr.includes('demônio') || contentStr.includes('estava caminhando')) {
            console.log('🚨 CACHE CORROMPIDO DETECTADO - DELETANDO');
            await supabase
              .from('generated_content')
              .delete()
              .eq('theme', cacheKey);
          } else {
            console.log(`✅ [CACHE-LIMPO] Cache válido encontrado: ${cacheKey}`);
            return new Response(JSON.stringify(cachedContent.content), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      } catch (cacheError) {
        console.log('⚠️ [CACHE-ERROR] Erro ao acessar cache, gerando novo conteúdo');
      }
    }

    // FASE 1: GERAR NOVO CONTEÚDO COM API STREAMING
    let generatedContent;
    
    console.log(`🚀 Gerando conteúdo via API Gemini STREAMING...`);
    
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

    // VALIDAÇÃO FINAL ANTI-CORRUPÇÃO
    const finalContentStr = JSON.stringify(generatedContent).toLowerCase();
    if (finalContentStr.includes('demônio') || finalContentStr.includes('estava caminhando')) {
      console.log('🚨 CONTEÚDO CORROMPIDO DETECTADO - USANDO FALLBACK ESPECÍFICO');
      
      // Fallback específico por matéria
      if (subject === 'Ciências' && theme.toLowerCase().includes('corpo')) {
        generatedContent = {
          content: `Qual órgão do corpo humano é responsável por bombear sangue?`,
          choices: ["Fígado", "Coração", "Pulmão", "Cérebro"],
          answer: "Coração",
          word: "circulação"
        };
      }
    }

    // Salvar no cache limpo com tempo reduzido (2 horas)
    try {
      const { error: saveError } = await supabase
        .from('generated_content')
        .insert({
          content_type: contentType,
          theme: cacheKey,
          content: generatedContent,
          expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        });

      if (saveError) {
        console.error('❌ [CACHE-SAVE-ERROR]:', saveError);
      } else {
        console.log(`✅ [CACHE-SAVED] Conteúdo limpo salvo: ${cacheKey}`);
      }
    } catch (cacheError) {
      console.error('❌ [CACHE-ERROR] Erro ao salvar:', cacheError);
    }

    console.log(`✅ [SUCCESS] Conteúdo gerado para ${subject} - ${theme}`);

    return new Response(JSON.stringify(generatedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ [CRITICAL-ERROR] Erro na geração de conteúdo:', error);
    
    // FALLBACK DE EMERGÊNCIA ESPECÍFICO (NÃO MATEMÁTICO)
    const emergencyFallback = {
      title: "Conteúdo Educativo Específico",
      content: "Conteúdo educativo sobre o tema selecionado será apresentado aqui."
    };
    
    return new Response(JSON.stringify(emergencyFallback), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
