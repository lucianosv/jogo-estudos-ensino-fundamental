/**
 * Testes para validar o funcionamento do word cleaner
 */

import { cleanSecretWord, getDisplayWord } from './wordCleaner';

export const runWordCleanerTests = () => {
  console.log('🧪 TESTANDO WORD CLEANER');
  
  const testCases = [
    // Casos problemáticos encontrados
    { input: 'navegação_t1', expected: 'navegação' },
    { input: 'palavra_2', expected: 'palavra' },
    { input: 'teste_1735123456789_0', expected: 'teste' },
    { input: 'exemplo_fallback', expected: 'exemplo' },
    { input: 'demo_gemini', expected: 'demo' },
    { input: 'palavra_emergency', expected: 'palavra' },
    { input: 'normal', expected: 'normal' },
    { input: 'casa_a1b2c3', expected: 'casa' },
    { input: 'palavra_abc_123', expected: 'palavra' },
    { input: '', expected: '' },
  ];
  
  testCases.forEach(({ input, expected }) => {
    const result = cleanSecretWord(input);
    const displayResult = getDisplayWord(input);
    
    const cleanPassed = result === expected;
    const displayPassed = displayResult === expected;
    
    console.log(`${cleanPassed ? '✅' : '❌'} "${input}" → "${result}" (esperado: "${expected}")`);
    
    if (!cleanPassed) {
      console.error(`   ❌ cleanSecretWord falhou: "${input}" → "${result}" (esperado: "${expected}")`);
    }
    
    if (!displayPassed) {
      console.error(`   ❌ getDisplayWord falhou: "${input}" → "${displayResult}" (esperado: "${expected}")`);
    }
  });
  
  console.log('🧪 TESTES WORD CLEANER CONCLUÍDOS');
};