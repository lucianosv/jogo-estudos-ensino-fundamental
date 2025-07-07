
export const generateWithGemini = async (prompt: string): Promise<string> => {
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
