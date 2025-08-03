
export const validateContent = (content: any, subject: string, theme: string): boolean => {
  if (!content) return false;
  
  const contentStr = JSON.stringify(content).toLowerCase();
  const themeLower = theme.toLowerCase();
  const subjectLower = subject.toLowerCase();
  
  // Lista muito focada apenas em palavras REALMENTE inadequadas para crianças
  const trulyInappropriateWords = [
    'sangue', 'blood', 'morte', 'death', 'violência', 'violence',
    'matador', 'assassino', 'killer'
  ];
  
  // Verificar apenas palavras realmente problemáticas
  const hasTrulyInappropriateContent = trulyInappropriateWords.some(word => 
    contentStr.includes(word)
  );
  
  if (hasTrulyInappropriateContent) {
    console.log(`[VALIDATOR] Conteúdo rejeitado por conter palavras inadequadas para crianças`);
    return false;
  }
  
  // Verificação temática muito flexível - apenas para casos óbvios
  if (themeLower.includes('solar') || themeLower.includes('planeta')) {
    const spaceWords = ['planeta', 'sol', 'sistema', 'espaço', 'universo', 'estrela', 'órbita', 'astronomia', 'solar'];
    const hasSpaceContent = spaceWords.some(word => contentStr.includes(word));
    if (!hasSpaceContent) {
      console.log(`[VALIDATOR] Conteúdo sobre Sistema Solar sem palavras espaciais`);
      return false;
    }
  }
  
  // Verificar se não é genérico demais
  if (contentStr.includes('questão básica') || contentStr.includes('exemplo genérico')) {
    console.log(`[VALIDATOR] Conteúdo muito genérico rejeitado`);
    return false;
  }
  
  console.log(`[VALIDATOR] Conteúdo aprovado para ${subject} - ${theme}`);
  return true;
};
