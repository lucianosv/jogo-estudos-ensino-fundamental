
import { generateWithGemini } from '../utils/geminiClient.ts';

export const generateCharacterInfo = async (subject: string, theme: string, schoolGrade: string, themeDetails?: string) => {
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
