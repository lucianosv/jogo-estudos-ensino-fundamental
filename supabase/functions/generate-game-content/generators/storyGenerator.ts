
import { generateWithGemini } from '../utils/geminiClient.ts';
import { validateContent } from '../utils/contentValidator.ts';

export const generateStory = async (subject: string, theme: string, schoolGrade: string, themeDetails?: string) => {
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
