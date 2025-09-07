/**
 * Utilitário para limpeza e normalização de palavras secretas
 * Garante consistência entre exibição e coleta
 */

export const cleanSecretWord = (word: string): string => {
  if (!word) return '';
  
  return word
    // Remove sufixos com timestamp longo (_1735123456789_0)
    .replace(/[-_]\d{10,}[-_]\d+$/g, '')
    // Remove sufixos _t1, _t2, etc.
    .replace(/[-_]t\d+$/g, '')
    // Remove sufixos numericos simples (_2, _3, etc.)
    .replace(/[-_]\d+$/g, '')
    // Remove sufixos com palavras (_emergency, _fallback, _gemini, _unified)
    .replace(/[-_](emergency|fallback|gemini|unified)$/g, '')
    // Remove códigos alfanuméricos curtos (_a1b2c3)
    .replace(/[-_][a-z0-9]{6}$/g, '')
    // Remove múltiplos sufixos concatenados
    .replace(/[-_][a-zA-Z0-9]+[-_][a-zA-Z0-9]+$/g, '')
    // Limpa espaços e normaliza
    .trim()
    .toLowerCase();
};

export const getDisplayWord = (word: string): string => {
  return cleanSecretWord(word);
};