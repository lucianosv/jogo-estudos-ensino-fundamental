
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
INSTRUÇÕES RIGOROSAS PARA CONTEÚDO EDUCATIVO BRASILEIRO:

Você DEVE criar uma questão de múltipla escolha ESPECÍFICA sobre:
- Matéria: ${subject}
- Tema ESPECÍFICO: ${theme}
- Série: ${schoolGrade}

REGRAS OBRIGATÓRIAS E INEGOCIÁVEIS:
1. A questão DEVE ser EXCLUSIVAMENTE sobre ${theme} dentro da matéria ${subject}
2. Use ${difficultyDescription} apropriados para crianças brasileiras do ${schoolGrade}
3. Tenha EXATAMENTE 4 alternativas diferentes
4. NÃO use personagens de anime, demônios, violência ou conteúdo inadequado
5. NÃO faça questões matemáticas se a matéria não for Matemática
6. A palavra secreta deve estar relacionada diretamente ao tema ${theme}
7. Use linguagem educativa brasileira adequada para a idade

${subject === 'Ciências' && theme.toLowerCase().includes('corpo') ? 'ESPECÍFICO PARA CORPO HUMANO: A questão DEVE ser sobre anatomia, fisiologia, órgãos, sistemas do corpo humano. Exemplos: coração, pulmões, cérebro, digestão, respiração, circulação, ossos, músculos.' : ''}

${subject === 'Ciências' && (theme.toLowerCase().includes('solar') || theme.toLowerCase().includes('planeta')) ? 'ESPECÍFICO PARA SISTEMA SOLAR: A questão DEVE ser sobre planetas, estrelas, sol, espaço, astronomia, órbitas.' : ''}

${subject === 'História' ? 'ESPECÍFICO PARA HISTÓRIA: A questão deve ser sobre eventos históricos, personagens históricos, datas, civilizações, descobrimentos.' : ''}

${subject === 'Português' ? 'ESPECÍFICO PARA PORTUGUÊS: A questão deve ser sobre gramática, vocabulário, ortografia, literatura.' : ''}

${subject === 'Geografia' ? 'ESPECÍFICO PARA GEOGRAFIA: A questão deve ser sobre localização, países, continentes, relevo, clima.' : ''}

EXEMPLO DO QUE NÃO FAZER (PROIBIDO):
- "Corpo Humano estava caminhando e encontrou demônios"
- Qualquer referência a anime, luta, violência
- Questões matemáticas em matérias não-matemáticas

EXEMPLO DO QUE FAZER (CORRETO):
Para Ciências/Corpo Humano: "Qual órgão é responsável por bombear sangue pelo corpo?"

Retorne APENAS um JSON válido no formato:
{
  "content": "pergunta específica sobre o tema",
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
    
    console.log('Conteúdo da API Gemini para parsing:', cleanContent.substring(0, 300));
    
    const parsed = JSON.parse(cleanContent);
    
    // Validação rigorosa da estrutura
    if (!parsed.content || !parsed.choices || !parsed.answer || !parsed.word) {
      throw new Error('JSON inválido - campos obrigatórios ausentes');
    }
    
    if (!Array.isArray(parsed.choices) || parsed.choices.length !== 4) {
      throw new Error('JSON inválido - choices deve ter exatamente 4 elementos');
    }
    
    // VALIDAÇÃO RIGOROSA DE CONTEÚDO
    if (!validateContent(parsed, subject, theme)) {
      console.error('❌ Conteúdo gerado REJEITADO pela validação rigorosa');
      throw new Error('Conteúdo gerado não passou na validação temática rigorosa');
    }
    
    console.log('✅ Questão aprovada pela validação rigorosa');
    return parsed;
    
  } catch (error) {
    console.error('Erro na API Gemini, usando fallback temático específico:', error);
    
    // FALLBACKS ESPECÍFICOS POR TEMA - NUNCA GENÉRICOS
    if (subject === 'Ciências' && (theme.toLowerCase().includes('corpo') || theme.toLowerCase().includes('humano'))) {
      return {
        content: `Ciências - Corpo Humano (${schoolGrade}): Qual órgão é responsável por bombear o sangue pelo corpo?`,
        choices: ["Pulmão", "Fígado", "Coração", "Estômago"],
        answer: "Coração",
        word: "circulação"
      };
    }
    
    if (subject === 'Ciências' && (theme.toLowerCase().includes('solar') || theme.toLowerCase().includes('planeta'))) {
      return {
        content: `Ciências - Sistema Solar (${schoolGrade}): Qual é o planeta mais próximo do Sol?`,
        choices: ["Vênus", "Terra", "Mercúrio", "Marte"],
        answer: "Mercúrio",
        word: "planeta"
      };
    }
    
    if (subject === 'História') {
      return {
        content: `História - ${theme} (${schoolGrade}): Por que é importante estudar História?`,
        choices: ["Para decorar datas", "Para entender o passado", "Para fazer provas", "Para nada"],
        answer: "Para entender o passado",
        word: "passado"
      };
    }
    
    // Fallback mais genérico mas ainda específico da matéria
    const subjectWords = {
      'Matemática': 'número',
      'Português': 'palavra',
      'Geografia': 'lugar',
      'História': 'tempo',
      'Ciências': 'natureza'
    };
    
    return {
      content: `${subject} - ${theme} (${schoolGrade}): Questão sobre o tema ${theme}`,
      choices: ["Opção A", "Opção B", "Opção C", "Opção D"],
      answer: "Opção A",
      word: subjectWords[subject] || "conhecimento"
    };
  }
};
