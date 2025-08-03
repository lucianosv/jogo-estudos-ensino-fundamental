
export const validateContent = (content: any, subject: string, theme: string): boolean => {
  if (!content) return false;
  
  const contentStr = JSON.stringify(content).toLowerCase();
  const themeLower = theme.toLowerCase();
  const subjectLower = subject.toLowerCase();
  
  console.log(`[VALIDATOR] Analisando conteúdo para: ${subject} - ${theme}`);
  console.log(`[VALIDATOR] Conteúdo: ${contentStr.substring(0, 200)}...`);
  
  // VALIDAÇÃO ANTI-TEMPLATE RIGOROSA
  // Detectar padrões matemáticos genéricos inadequados
  const mathTemplatePatterns = [
    'estava caminhando pela floresta',
    'encontrou um grupo de demônios',
    'quantos demônios',
    'quantos golpes',
    'para derrotá-los',
    'precisava calcular',
    'se derrotou 3',
    'pela manhã e 5 à tarde',
    'quantos derrotou no total'
  ];
  
  const hasMathTemplate = mathTemplatePatterns.some(pattern => 
    contentStr.includes(pattern)
  );
  
  if (hasMathTemplate) {
    console.log(`[VALIDATOR] ❌ REJEITADO: Conteúdo contém template matemático inadequado`);
    return false;
  }
  
  // Rejeitar qualquer conteúdo com "demônios" quando não for sobre anime/fantasia
  if (contentStr.includes('demônio') || contentStr.includes('demons')) {
    if (!themeLower.includes('anime') && !themeLower.includes('fantasia') && !themeLower.includes('mitologia')) {
      console.log(`[VALIDATOR] ❌ REJEITADO: Conteúdo inadequado com demônios fora de contexto`);
      return false;
    }
  }
  
  // Lista rigorosa de palavras inadequadas para educação infantil
  const inappropriateWords = [
    'sangue', 'blood', 'morte', 'death', 'violência', 'violence',
    'matador', 'assassino', 'killer', 'luta', 'batalha', 'guerra'
  ];
  
  const hasInappropriateContent = inappropriateWords.some(word => 
    contentStr.includes(word)
  );
  
  if (hasInappropriateContent) {
    console.log(`[VALIDATOR] ❌ REJEITADO: Conteúdo inadequado para crianças`);
    return false;
  }
  
  // VALIDAÇÃO ESPECÍFICA POR MATÉRIA - RIGOROSA
  
  // Para CIÊNCIAS: deve ter vocabulário científico
  if (subjectLower === 'ciências') {
    if (themeLower.includes('corpo') || themeLower.includes('humano')) {
      const bodyWords = ['órgão', 'coração', 'pulmão', 'cérebro', 'sangue', 'digestão', 'respiração', 'circulação', 'osso', 'músculo'];
      const hasBodyContent = bodyWords.some(word => contentStr.includes(word));
      if (!hasBodyContent) {
        console.log(`[VALIDATOR] ❌ REJEITADO: Ciências/Corpo Humano sem vocabulário anatômico`);
        return false;
      }
    }
    
    if (themeLower.includes('solar') || themeLower.includes('planeta')) {
      const spaceWords = ['planeta', 'sol', 'sistema', 'espaço', 'universo', 'estrela', 'órbita', 'astronomia', 'mercúrio', 'vênus', 'terra', 'marte', 'júpiter'];
      const hasSpaceContent = spaceWords.some(word => contentStr.includes(word));
      if (!hasSpaceContent) {
        console.log(`[VALIDATOR] ❌ REJEITADO: Ciências/Sistema Solar sem vocabulário espacial`);
        return false;
      }
    }
    
    // Ciências NUNCA deve ter questões matemáticas básicas
    if (contentStr.includes('quanto é') && (contentStr.includes(' + ') || contentStr.includes(' - ') || contentStr.includes(' x ') || contentStr.includes(' ÷ '))) {
      console.log(`[VALIDATOR] ❌ REJEITADO: Ciências com questão matemática inadequada`);
      return false;
    }
  }
  
  // Para HISTÓRIA: deve ter contexto histórico
  if (subjectLower === 'história') {
    if (contentStr.includes('quanto é') && (contentStr.includes(' + ') || contentStr.includes(' - '))) {
      console.log(`[VALIDATOR] ❌ REJEITADO: História com questão matemática inadequada`);
      return false;
    }
  }
  
  // Para PORTUGUÊS: deve ter contexto linguístico
  if (subjectLower === 'português') {
    if (contentStr.includes('quanto é') && (contentStr.includes(' + ') || contentStr.includes(' - '))) {
      console.log(`[VALIDATOR] ❌ REJEITADO: Português com questão matemática inadequada`);
      return false;
    }
  }
  
  // Para GEOGRAFIA: deve ter contexto geográfico
  if (subjectLower === 'geografia') {
    if (contentStr.includes('quanto é') && (contentStr.includes(' + ') || contentStr.includes(' - '))) {
      console.log(`[VALIDATOR] ❌ REJEITADO: Geografia com questão matemática inadequada`);
      return false;
    }
  }
  
  // Verificar se não é genérico demais
  if (contentStr.includes('questão básica') || contentStr.includes('exemplo genérico') || contentStr.includes('opção a')) {
    console.log(`[VALIDATOR] ❌ REJEITADO: Conteúdo muito genérico`);
    return false;
  }
  
  console.log(`[VALIDATOR] ✅ APROVADO: Conteúdo válido para ${subject} - ${theme}`);
  return true;
};
