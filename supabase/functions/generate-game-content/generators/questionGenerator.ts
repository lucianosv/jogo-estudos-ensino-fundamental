
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
INSTRUÇÕES ULTRA-RÍGIDAS PARA CONTEÚDO EDUCATIVO BRASILEIRO (VERSÃO ANTI-TEMPLATE):

Você DEVE criar uma questão de múltipla escolha ESPECÍFICA sobre:
- Matéria: ${subject}
- Tema ESPECÍFICO: ${theme}
- Série: ${schoolGrade}

⚠️ REGRAS INEGOCIÁVEIS E ABSOLUTAS:
1. A questão DEVE ser EXCLUSIVAMENTE sobre ${theme} dentro da matéria ${subject}
2. Use ${difficultyDescription} apropriados para crianças brasileiras do ${schoolGrade}
3. Tenha EXATAMENTE 4 alternativas diferentes
4. JAMAIS use: demônios, violência, personagens de anime, lutas, sangue, morte
5. JAMAIS faça questões matemáticas se a matéria NÃO for Matemática
6. A palavra secreta deve estar relacionada diretamente ao tema ${theme}
7. Use linguagem educativa brasileira adequada para a idade

🚫 EXPRESSAMENTE PROIBIDO (SERÁ REJEITADO):
- "estava caminhando pela floresta"
- "encontrou um grupo de demônios"
- "quantos demônios"
- "quantos golpes"
- "para derrotá-los"
- "precisava calcular"
- Qualquer referência a anime, luta, violência

✅ EXEMPLOS CORRETOS OBRIGATÓRIOS:

Para Ciências/Corpo Humano: 
"Qual órgão é responsável por bombear sangue pelo corpo?"
Alternativas: ["Fígado", "Coração", "Pulmão", "Cérebro"]
Resposta: "Coração"
Palavra: "circulação"

Para História:
"Quem descobriu o Brasil em 1500?"
Alternativas: ["Cabral", "Colombo", "Vasco", "Caminha"]
Resposta: "Cabral"
Palavra: "descobrimento"

${subject === 'Ciências' && theme.toLowerCase().includes('corpo') ? `
🧠 ESPECÍFICO OBRIGATÓRIO PARA CORPO HUMANO:
A questão DEVE ser sobre: órgãos (coração, pulmões, fígado, cérebro), sistemas (digestivo, respiratório, circulatório), funções corporais, anatomia básica.
JAMAIS sobre matemática, demônios, ou temas não relacionados ao corpo humano.
` : ''}

${subject === 'Ciências' && (theme.toLowerCase().includes('solar') || theme.toLowerCase().includes('planeta')) ? `
🌟 ESPECÍFICO OBRIGATÓRIO PARA SISTEMA SOLAR:
A questão DEVE ser sobre: planetas (Mercúrio, Vênus, Terra, Marte, Júpiter, Saturno, Urano, Netuno), sol, estrelas, astronomia, órbitas.
` : ''}

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
    console.error('❌ Erro na API Gemini STREAMING, usando fallback temático específico:', error);
    
    // FALLBACKS ESPECÍFICOS POR TEMA - NUNCA MATEMÁTICOS
    if (subject === 'Ciências' && (theme.toLowerCase().includes('corpo') || theme.toLowerCase().includes('humano'))) {
      return {
        content: `Qual é a função principal do coração no corpo humano?`,
        choices: ["Filtrar toxinas", "Bombear sangue", "Produzir hormônios", "Armazenar nutrientes"],
        answer: "Bombear sangue",
        word: "circulação"
      };
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
    
    // Fallback genérico específico da matéria (SEM MATEMÁTICA)
    const subjectWords = {
      'Matemática': 'cálculo',
      'Português': 'gramática',
      'Geografia': 'localização',
      'História': 'passado',
      'Ciências': 'descoberta'
    };
    
    return {
      content: `${subject} (${schoolGrade}): Questão educativa sobre ${theme}`,
      choices: ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"],
      answer: "Alternativa A",
      word: subjectWords[subject] || "aprendizado"
    };
  }
};
