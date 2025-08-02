
import { generateWithGemini } from '../utils/geminiClient.ts';
import { validateContent } from '../utils/contentValidator.ts';

export const generateStory = async (subject: string, theme: string, schoolGrade: string, themeDetails?: string) => {
  const gradeNumber = parseInt(schoolGrade.charAt(0));
  let languageLevel = "";
  let storyComplexity = "";
  
  if (gradeNumber >= 1 && gradeNumber <= 3) {
    languageLevel = "linguagem muito simples e clara, frases curtas";
    storyComplexity = "história com personagens simples e situações do cotidiano";
  } else if (gradeNumber >= 4 && gradeNumber <= 6) {
    languageLevel = "linguagem adequada para crianças, frases bem estruturadas";
    storyComplexity = "narrativa com aventura educativa e personagens interessantes";
  } else {
    languageLevel = "linguagem adequada para adolescentes";
    storyComplexity = "história envolvente com elementos educativos mais elaborados";
  }

  const prompt = `
Crie uma HISTÓRIA NARRATIVA educativa sobre:
- Matéria: ${subject}
- Tema: ${theme}
- Série: ${schoolGrade}

INSTRUÇÕES OBRIGATÓRIAS:
1. Crie uma HISTÓRIA REAL com personagens, enredo, início, meio e fim
2. A história deve ser ESPECIFICAMENTE sobre ${theme} na matéria ${subject}
3. Use ${languageLevel}
4. Deve ser uma ${storyComplexity}
5. Tenha entre 150-200 palavras
6. NÃO seja apenas um texto de incentivo - seja uma NARRATIVA EDUCATIVA REAL
7. Inclua elementos educativos do tema ${theme} naturalmente na história
8. Termine com uma conclusão educativa interessante

${theme.toLowerCase().includes('solar') ? 'ESPECÍFICO PARA SISTEMA SOLAR: A história deve incluir personagens explorando planetas, estrelas, descobrindo características do espaço, falando sobre órbitas, tamanhos dos planetas, etc.' : ''}
${subject === 'História' ? 'ESPECÍFICO PARA HISTÓRIA: A história deve incluir personagens vivendo ou descobrindo eventos históricos do tema escolhido.' : ''}
${subject === 'Matemática' ? 'ESPECÍFICO PARA MATEMÁTICA: A história deve incluir personagens usando conceitos matemáticos para resolver problemas ou situações.' : ''}

Exemplo do que NÃO fazer: "Prepare-se para uma aventura de aprendizado!"
Exemplo do que FAZER: "Era uma vez uma menina chamada Ana que descobriu..."

Retorne APENAS o texto da história narrativa educativa, sem título ou formatação extra.
  `;
  
  try {
    const content = await generateWithGemini(prompt);
    const storyData = {
      title: `${subject}: ${theme}`,
      content: content.trim()
    };
    
    // Validar se é realmente uma história narrativa e não texto de incentivo
    if (content.includes('prepare-se') || content.includes('aventura de aprendizado') || content.includes('você está prestes')) {
      throw new Error('Conteúdo gerado é texto de incentivo, não história narrativa');
    }
    
    // Validar conteúdo temático
    if (!validateContent(storyData, subject, theme)) {
      throw new Error('Conteúdo gerado não passou na validação temática');
    }
    
    console.log(`[STORY-AI] História narrativa gerada com sucesso para ${subject} - ${theme}`);
    return storyData;
    
  } catch (error) {
    console.error('Erro ao gerar história narrativa, usando fallback:', error);
    return {
      title: `${subject}: ${theme}`,
      content: `Era uma vez um estudante curioso que decidiu explorar os segredos de ${theme}. Durante sua jornada de descoberta na matéria ${subject}, ele encontrou desafios interessantes e aprendeu conceitos importantes sobre ${theme}. Com dedicação e curiosidade, conseguiu dominar o assunto e se tornou um verdadeiro conhecedor do tema. Sua aventura educativa mostrou que aprender pode ser muito divertido e recompensador quando temos interesse genuíno pelo conhecimento!`
    };
  }
};
