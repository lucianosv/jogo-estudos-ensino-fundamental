import { generateWithGemini } from '../utils/geminiClient.ts';
import { validateContent } from '../utils/contentValidator.ts';

export const generateQuestion = async (subject: string, theme: string, schoolGrade: string, difficulty: string, questionIndex: number = 0, themeDetails?: string) => {
  const gradeNumber = parseInt(schoolGrade.charAt(0));
  let difficultyDescription = "";
  
  if (gradeNumber >= 1 && gradeNumber <= 3) {
    difficultyDescription = "conceitos muito básicos, linguagem simples";
  } else if (gradeNumber >= 4 && gradeNumber <= 6) {
    difficultyDescription = "conceitos intermediários, problemas práticos";
  } else {
    difficultyDescription = "conceitos mais avançados, pensamento crítico";
  }
  
  // Adicionar seed única baseada no índice para gerar questões diferentes
  const seedVariations = [
    "primeira questão introdutória",
    "segunda questão com foco em detalhes", 
    "terceira questão com aplicação prática",
    "quarta questão de síntese e conclusão"
  ];
  
  const currentSeed = seedVariations[questionIndex % 4] || "questão única";
  
  const prompt = `
INSTRUÇÕES ULTRA-RÍGIDAS PARA CONTEÚDO EDUCATIVO BRASILEIRO (VERSÃO ANTI-TEMPLATE):

Você DEVE criar uma ${currentSeed} de múltipla escolha ESPECÍFICA sobre:
- Matéria: ${subject}
- Tema ESPECÍFICO: ${theme}
- Série: ${schoolGrade}
- Índice da questão: ${questionIndex}

⚠️ REGRAS INEGOCIÁVEIS E ABSOLUTAS:
1. A questão DEVE ser EXCLUSIVAMENTE sobre ${theme} dentro da matéria ${subject}
2. Use ${difficultyDescription} apropriados para crianças brasileiras do ${schoolGrade}
3. Tenha EXATAMENTE 4 alternativas diferentes
4. JAMAIS use: demônios, violência, personagens de anime, lutas, sangue, morte
5. JAMAIS faça questões matemáticas se a matéria NÃO for Matemática
6. A palavra secreta deve estar relacionada diretamente ao tema ${theme}
7. Use linguagem educativa brasileira adequada para a idade
8. IMPORTANTE: Esta é a questão ${questionIndex + 1} de uma série, deve ser ÚNICA e DIFERENTE das outras

🚫 EXPRESSAMENTE PROIBIDO (SERÁ REJEITADO):
- "estava caminhando pela floresta"
- "encontrou um grupo de demônios"
- "quantos demônios"
- "quantos golpes"
- "para derrotá-los"
- "precisava calcular"
- Qualquer referência a anime, luta, violência

✅ EXEMPLOS ESPECÍFICOS OBRIGATÓRIOS POR ÍNDICE:

${subject === 'Ciências' && theme.toLowerCase().includes('corpo') ? `
🧠 ESPECÍFICO OBRIGATÓRIO PARA CORPO HUMANO (Questão ${questionIndex + 1}):
Questão 0: Sobre coração e circulação
Questão 1: Sobre pulmões e respiração  
Questão 2: Sobre cérebro e sistema nervoso
Questão 3: Sobre ossos e esqueleto
A questão DEVE ser sobre: órgãos, sistemas, funções corporais, anatomia básica.
JAMAIS sobre matemática, demônios, ou temas não relacionados ao corpo humano.
` : ''}

Retorne APENAS um JSON válido no formato:
{
  "content": "pergunta específica sobre o tema (questão ${questionIndex + 1})",
  "choices": ["opção A", "opção B", "opção C", "opção D"],
  "answer": "resposta correta exata",
  "word": "palavra-secreta-relacionada-ao-tema-questao-${questionIndex}"
}
  `;
  
  try {
    const content = await generateWithGemini(prompt);
    
    // Parsing mais tolerante
    let cleanContent = content.trim();
    cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    cleanContent = cleanContent.replace(/^[^{]*({.*})[^}]*$/s, '$1');
    
    console.log('📥 Conteúdo da API Gemini STREAMING recebido:', cleanContent.substring(0, 300));
    
    const parsed = JSON.parse(cleanContent);
    
    // Validação rigorosa da estrutura
    if (!parsed.content || !parsed.choices || !parsed.answer || !parsed.word) {
      throw new Error('JSON inválido - campos obrigatórios ausentes');
    }
    
    if (!Array.isArray(parsed.choices) || parsed.choices.length !== 4) {
      throw new Error('JSON inválido - choices deve ter exatamente 4 elementos');
    }
    
    // VALIDAÇÃO ANTI-TEMPLATE ULTRA-RIGOROSA
    const contentStr = JSON.stringify(parsed).toLowerCase();
    if (contentStr.includes('demônio') || contentStr.includes('estava caminhando') || 
        contentStr.includes('golpes') || contentStr.includes('derrotá')) {
      console.error('🚨 CONTEÚDO TEMPLATE MATEMÁTICO DETECTADO - REJEITADO');
      throw new Error('Conteúdo template matemático rejeitado');
    }
    
    // VALIDAÇÃO RIGOROSA DE CONTEÚDO
    if (!validateContent(parsed, subject, theme)) {
      console.error('❌ Conteúdo gerado REJEITADO pela validação rigorosa');
      throw new Error('Conteúdo gerado não passou na validação temática rigorosa');
    }
    
    console.log('✅ Questão aprovada pela validação ultra-rigorosa');
    return parsed;
    
  } catch (error) {
    console.error('❌ Erro na API Gemini STREAMING, usando fallback temático específico por índice:', error);
    
    // FALLBACKS ESPECÍFICOS POR TEMA E ÍNDICE - NUNCA MATEMÁTICOS
    if (subject === 'Ciências' && (theme.toLowerCase().includes('corpo') || theme.toLowerCase().includes('humano'))) {
      const bodyQuestions = [
        {
          content: `Qual é a função principal do coração no corpo humano?`,
          choices: ["Filtrar toxinas", "Bombear sangue", "Produzir hormônios", "Armazenar nutrientes"],
          answer: "Bombear sangue",
          word: "circulação"
        },
        {
          content: `Quantos pulmões temos no nosso sistema respiratório?`,
          choices: ["1 pulmão", "2 pulmões", "3 pulmões", "4 pulmões"],
          answer: "2 pulmões",
          word: "respiração"
        },
        {
          content: `Qual órgão é responsável pelo controle de todo o corpo?`,
          choices: ["Coração", "Fígado", "Cérebro", "Estômago"],
          answer: "Cérebro",
          word: "neurônio"
        },
        {
          content: `Aproximadamente quantos ossos tem o corpo humano adulto?`,
          choices: ["156 ossos", "186 ossos", "206 ossos", "256 ossos"],
          answer: "206 ossos",
          word: "esqueleto"
        }
      ];
      
      return bodyQuestions[questionIndex % 4];
    }
    
    if (subject === 'Ciências' && (theme.toLowerCase().includes('solar') || theme.toLowerCase().includes('planeta'))) {
      return {
        content: `Qual planeta está mais próximo do Sol no nosso sistema solar?`,
        choices: ["Terra", "Vênus", "Mercúrio", "Marte"],
        answer: "Mercúrio",
        word: "astronomia"
      };
    }
    
    if (subject === 'História') {
      return {
        content: `Quem foi o navegador português que chegou ao Brasil em 1500?`,
        choices: ["Vasco da Gama", "Pedro Álvares Cabral", "Cristóvão Colombo", "Bartolomeu Dias"],
        answer: "Pedro Álvares Cabral",
        word: "descobrimento"
      };
    }
    
    if (subject === 'Português') {
      return {
        content: `Qual é a classe gramatical da palavra "casa"?`,
        choices: ["Verbo", "Adjetivo", "Substantivo", "Advérbio"],
        answer: "Substantivo",
        word: "gramática"
      };
    }
    
    if (subject === 'Geografia') {
      return {
        content: `Qual é a capital do Brasil?`,
        choices: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador"],
        answer: "Brasília",
        word: "capital"
      };
    }
    
    // Fallback genérico com índice único
    const subjectWords = {
      'Matemática': 'cálculo',
      'Português': 'gramática',
      'Geografia': 'localização',
      'História': 'passado',
      'Ciências': 'descoberta'
    };
    
    return {
      content: `${subject} (${schoolGrade}): Questão ${questionIndex + 1} sobre ${theme}`,
      choices: ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"],
      answer: "Alternativa A",
      word: `${subjectWords[subject] || "aprendizado"}${questionIndex + 1}`
    };
  }
};
