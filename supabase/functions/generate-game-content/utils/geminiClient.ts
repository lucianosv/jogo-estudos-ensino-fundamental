
export const generateWithGemini = async (prompt: string): Promise<string> => {
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  
  if (!geminiApiKey) {
    console.error('GEMINI_API_KEY não configurada');
    throw new Error('GEMINI_API_KEY not configured');
  }
  
  console.log('🎯 Iniciando chamada para API Gemini 1.5 Flash (STREAMING)...');
  
  const maxRetries = 2;
  const timeoutMs = 10000; // Reduzido para 10 segundos
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📡 Tentativa ${attempt}/${maxRetries} para API Gemini (STREAMING)`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      // Mudança crítica: usando StreamGenerateContent que tem 0% erro
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${geminiApiKey}`,
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
              temperature: 0.2, // Mais determinístico
              topK: 10,
              topP: 0.7,
              maxOutputTokens: 600, // Reduzido para foco
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH", 
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
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
        console.error(`❌ Erro da API Gemini STREAMING (tentativa ${attempt}):`, response.status, errorText);
        
        if (attempt === maxRetries) {
          throw new Error(`Gemini STREAMING API error after ${maxRetries} attempts: ${response.status} - ${errorText}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }

      // Parse streaming response
      const responseText = await response.text();
      console.log('📥 Resposta STREAMING recebida:', responseText.substring(0, 200));
      
      // Parse multiple JSON objects from streaming response
      const lines = responseText.split('\n').filter(line => line.trim());
      let fullText = '';
      
      for (const line of lines) {
        try {
          const jsonData = JSON.parse(line);
          if (jsonData.candidates?.[0]?.content?.parts?.[0]?.text) {
            fullText += jsonData.candidates[0].content.parts[0].text;
          }
        } catch (parseError) {
          // Skip malformed lines
          continue;
        }
      }
      
      if (!fullText.trim()) {
        console.error('❌ Resposta STREAMING vazia ou inválida');
        throw new Error('Empty streaming response from Gemini API');
      }
      
      console.log('✅ Conteúdo STREAMING processado com sucesso');
      return fullText.trim();
      
    } catch (error) {
      console.error(`❌ Erro na tentativa STREAMING ${attempt}:`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  throw new Error('Max retries exceeded for streaming');
};
