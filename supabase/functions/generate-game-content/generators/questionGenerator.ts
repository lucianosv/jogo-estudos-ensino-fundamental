
import { generateWithGemini } from '../utils/geminiClient.ts';
import { validateContent } from '../utils/contentValidator.ts';

export const generateQuestion = async (subject: string, theme: string, schoolGrade: string, difficulty: string, themeDetails?: string) => {
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
