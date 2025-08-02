
export const validateContent = (content: any, subject: string, theme: string): boolean => {
  if (!content) return false;
  
  const contentStr = JSON.stringify(content).toLowerCase();
  const themeLower = theme.toLowerCase();
  
  // Lista mais focada de palavras realmente inadequadas para crianças
  const forbiddenWords = [
    'demon slayer', 'tanjiro', 'nezuko', 'hashira', 'breathing',
    'matador', 'assassino', 'killer', 'death', 'morte',
    'sangue', 'blood', 'violência', 'violence'
  ];
  
  // Verificar apenas palavras realmente problemáticas
  const hasForbiddenContent = forbiddenWords.some(word => contentStr.includes(word));
  
  if (hasForbiddenContent) {
    console.log(`[VALIDATOR] Conteúdo rejeitado por conter palavras inadequadas`);
    return false;
  }
  
  // Verificação mais flexível para temas específicos
  if (themeLower.includes('solar') || themeLower.includes('planeta')) {
    const spaceWords = ['planeta', 'sol', 'sistema', 'espaço', 'universo', 'estrela', 'órbita', 'astronomia'];
    const hasSpaceContent = spaceWords.some(word => contentStr.includes(word));
    if (!hasSpaceContent && !contentStr.includes('solar')) {
      console.log(`[VALIDATOR] Conteúdo sobre Sistema Solar rejeitado por não ter palavras espaciais`);
      return false;
    }
  }
  
  // Remover verificação muito genérica - permitir mais conteúdo passar
  console.log(`[VALIDATOR] Conteúdo aprovado para ${subject} - ${theme}`);
  return true;
};
