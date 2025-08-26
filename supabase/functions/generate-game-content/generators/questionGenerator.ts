import { generateWithGemini } from '../utils/geminiClient.ts';
import { validateContent } from '../utils/contentValidator.ts';

export const generateQuestion = async (subject: string, theme: string, schoolGrade: string, difficulty: string, questionIndex: number = 0, themeDetails?: string, uniqueSessionId?: string, timestamp?: number, promptType?: string, promptInstruction?: string, antiDuplicationSeed?: string) => {
  const gradeNumber = parseInt(schoolGrade.charAt(0));
  let difficultyDescription = "";
  
  if (gradeNumber >= 1 && gradeNumber <= 3) {
    difficultyDescription = "conceitos muito básicos, linguagem simples";
  } else if (gradeNumber >= 4 && gradeNumber <= 6) {
    difficultyDescription = "conceitos intermediários, problemas práticos";
  } else {
    difficultyDescription = "conceitos mais avançados, pensamento crítico";
  }
  
  // PROMPTS ULTRA-DIFERENCIADOS para evitar questões idênticas do Gemini
  const questionTypes = [
    {
      type: "DEFINIÇÕES E CONCEITOS BÁSICOS",
      focus: "O QUE É, definições fundamentais, termos básicos",
      style: "questão conceitual sobre fundamentos"
    },
    {
      type: "PERSONAGENS E FIGURAS IMPORTANTES", 
      focus: "QUEM FOI, personalidades, líderes, descobridores",
      style: "questão sobre pessoas relevantes"
    },
    {
      type: "EVENTOS ESPECÍFICOS E DATAS",
      focus: "QUANDO ACONTECEU, fatos históricos, descobertas",
      style: "questão sobre acontecimentos e cronologia"
    },
    {
      type: "CONSEQUÊNCIAS E LEGADOS",
      focus: "QUAL FOI O RESULTADO, impactos, influências",
      style: "questão sobre resultados e importância"
    }
  ];
  
  const currentQuestionType = questionTypes[questionIndex % 4];
  
  // Usar parâmetros anti-duplicação se fornecidos
  const sessionId = uniqueSessionId || Math.random().toString(36).substring(2, 15);
  const timeStamp = timestamp || Date.now();
  const duplicationSeed = antiDuplicationSeed || `${sessionId}_${timeStamp}_${questionIndex}`;
  
  const prompt = `
INSTRUÇÕES ULTRA-ESPECÍFICAS PARA QUESTÃO ÚNICA (ANTI-DUPLICAÇÃO GEMINI):

🆔 SESSÃO ÚNICA: ${sessionId}
⏰ TIMESTAMP: ${timeStamp}
🌱 SEED ANTI-DUPLICAÇÃO: ${duplicationSeed}

🎯 TIPO ESPECÍFICO DE QUESTÃO: ${promptType || currentQuestionType.type}
Você DEVE criar uma questão de múltipla escolha FOCADA EM: ${promptInstruction || currentQuestionType.focus}

PARÂMETROS ESPECÍFICOS:
- Matéria: ${subject}
- Tema ESPECÍFICO: ${theme}
- Série: ${schoolGrade}
- Questão Nº: ${questionIndex + 1} de 4
- Estilo: ${currentQuestionType.style}
- Sessão: ${sessionId}

⚠️ FOCO ULTRA-ESPECÍFICO PARA ESTA QUESTÃO:
1. OBRIGATÓRIO: Foque APENAS em ${currentQuestionType.focus} sobre ${theme}
2. PROIBIDO: Qualquer outro tipo de pergunta que não seja sobre ${currentQuestionType.type}
3. Use ${difficultyDescription} apropriados para ${schoolGrade}
4. Tenha EXATAMENTE 4 alternativas diferentes
5. JAMAIS use: demônios, violência, anime, lutas, sangue, morte
6. JAMAIS faça questões matemáticas se a matéria NÃO for Matemática
7. A palavra secreta deve relacionar-se ao aspecto específico: ${currentQuestionType.focus}
8. Esta questão Nº${questionIndex + 1} DEVE ser sobre ${currentQuestionType.type} - NÃO misture com outros tipos

🚫 EXPRESSAMENTE PROIBIDO (SERÁ REJEITADO):
- "estava caminhando pela floresta"
- "encontrou um grupo de demônios"
- "quantos demônios"
- "quantos golpes"
- "para derrotá-los"
- "precisava calcular"
- Qualquer referência a anime, luta, violência

✅ EXEMPLOS ULTRA-ESPECÍFICOS PARA ${currentQuestionType.type}:

${questionIndex === 0 ? `
🎯 QUESTÃO TIPO 0 - DEFINIÇÕES E CONCEITOS:
- "O que é...?"
- "Como se define...?"  
- "Qual o significado de...?"
- "O que caracteriza...?"
` : ''}

${questionIndex === 1 ? `
🎯 QUESTÃO TIPO 1 - PERSONAGENS E FIGURAS:
- "Quem foi...?"
- "Qual personagem...?"
- "Que líder...?"
- "Quem descobriu...?"
` : ''}

${questionIndex === 2 ? `
🎯 QUESTÃO TIPO 2 - EVENTOS E DATAS:
- "Quando aconteceu...?"
- "Em que século...?"
- "Que evento marcou...?"
- "Em que ano...?"
` : ''}

${questionIndex === 3 ? `
🎯 QUESTÃO TIPO 3 - CONSEQUÊNCIAS E LEGADOS:
- "Qual foi o resultado...?"
- "Que impacto teve...?"
- "Qual a importância...?"
- "Que influência deixou...?"
` : ''}

Retorne APENAS um JSON válido no formato:
{
  "content": "pergunta TIPO ${currentQuestionType.type} sobre ${theme}",
  "choices": ["opção A", "opção B", "opção C", "opção D"],
  "answer": "resposta correta exata",
  "word": "palavra-${currentQuestionType.type.toLowerCase().replace(/\s+/g, '')}-${questionIndex}-${sessionId.substring(0, 4)}"
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
