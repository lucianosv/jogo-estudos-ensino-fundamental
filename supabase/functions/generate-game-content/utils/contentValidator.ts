
export const validateContent = (content: any, subject: string, theme: string): boolean => {
  if (!content) return false;
  
  const contentStr = JSON.stringify(content).toLowerCase();
  const subjectLower = subject.toLowerCase();
  const themeLower = theme.toLowerCase();
  
  // Palavras proibidas que indicam conteúdo inadequado
  const forbiddenWords = ['demon', 'demônio', 'devil', 'diabo', 'anime', 'manga', 'slayer', 'matador'];
  const hasForbiddenContent = forbiddenWords.some(word => contentStr.includes(word));
  
  if (hasForbiddenContent) {
    console.log(`Conteúdo rejeitado por conter palavras inadequadas: ${contentStr.substring(0, 100)}...`);
    return false;
  }
  
  // Verificar se o conteúdo está relacionado ao tema
  if (themeLower.includes('solar') || themeLower.includes('planeta')) {
    const spaceWords = ['planeta', 'sol', 'sistema', 'espaço', 'universo', 'estrela', 'órbita'];
    const hasSpaceContent = spaceWords.some(word => contentStr.includes(word));
    if (!hasSpaceContent) {
      console.log(`Conteúdo rejeitado por não ser sobre Sistema Solar: ${contentStr.substring(0, 100)}...`);
      return false;
    }
  }
  
  return true;
};
