
export const validateContent = (content: any, subject: string, theme: string): boolean => {
  if (!content) return false;
  
  const contentStr = JSON.stringify(content).toLowerCase();
  const subjectLower = subject.toLowerCase();
  const themeLower = theme.toLowerCase();
  
  // Lista expandida de palavras proibidas
  const forbiddenWords = [
    'demon', 'demônio', 'demonio', 'diabo', 'devil', 'satan', 'inferno',
    'matador', 'slayer', 'mata', 'mata-', 'assassin', 'killer',
    'anime', 'manga', 'tanjiro', 'nezuko', 'hashira', 'breathing',
    'sangue', 'blood', 'morte', 'death', 'violência', 'violence',
    'espada', 'sword', 'luta', 'fight', 'batalha', 'battle'
  ];
  
  const hasForbiddenContent = forbiddenWords.some(word => contentStr.includes(word));
  
  if (hasForbiddenContent) {
    console.log(`[VALIDATOR] Conteúdo rejeitado por conter palavras inadequadas: ${contentStr.substring(0, 100)}...`);
    return false;
  }
  
  // Verificar se o conteúdo está relacionado ao tema
  if (themeLower.includes('solar') || themeLower.includes('planeta')) {
    const spaceWords = ['planeta', 'sol', 'sistema', 'espaço', 'universo', 'estrela', 'órbita', 'astronomia'];
    const hasSpaceContent = spaceWords.some(word => contentStr.includes(word));
    if (!hasSpaceContent) {
      console.log(`[VALIDATOR] Conteúdo rejeitado por não ser sobre Sistema Solar: ${contentStr.substring(0, 100)}...`);
      return false;
    }
  }
  
  // Verificar se não é muito genérico
  const genericPhrases = ['questão básica', 'exemplo genérico', 'questão sobre', 'tema básico'];
  const isGeneric = genericPhrases.some(phrase => contentStr.includes(phrase));
  if (isGeneric) {
    console.log(`[VALIDATOR] Conteúdo rejeitado por ser muito genérico: ${contentStr.substring(0, 100)}...`);
    return false;
  }
  
  // Verificar relevância temática mínima
  const hasThemeRelevance = contentStr.includes(themeLower) || 
                           contentStr.includes(subjectLower) ||
                           themeLower.split(' ').some(word => contentStr.includes(word));
  
  if (!hasThemeRelevance) {
    console.log(`[VALIDATOR] Conteúdo rejeitado por falta de relevância temática: ${contentStr.substring(0, 100)}...`);
    return false;
  }
  
  console.log(`[VALIDATOR] Conteúdo aprovado para ${subject} - ${theme}`);
  return true;
};
