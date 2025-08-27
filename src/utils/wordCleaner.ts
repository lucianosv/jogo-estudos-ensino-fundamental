/**
 * Utilitário para limpeza e normalização de palavras secretas
 * Garante consistência entre exibição e coleta
 */

export const cleanSecretWord = (word: string): string => {
  return word
    .replace(/[-_]\d+$/g, '')
    .replace(/[-_](emergency|fallback|gemini)$/g, '')
    .replace(/[-_][a-z0-9]{6}$/g, '');
};

export const getDisplayWord = (word: string): string => {
  return cleanSecretWord(word);
};