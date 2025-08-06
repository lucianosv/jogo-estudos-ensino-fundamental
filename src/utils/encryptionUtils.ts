// Simple encryption utilities for sensitive data in localStorage
// Note: This is for basic obfuscation, not cryptographic security

const SECRET_KEY = 'LOVABLE_GAME_SECRET_2024';

export const encryptData = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data);
    const encoded = btoa(jsonString);
    
    // Simple XOR encryption for basic obfuscation
    let encrypted = '';
    for (let i = 0; i < encoded.length; i++) {
      encrypted += String.fromCharCode(
        encoded.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length)
      );
    }
    
    return btoa(encrypted);
  } catch (error) {
    console.error('Encryption failed:', error);
    return '';
  }
};

export const decryptData = (encryptedData: string): any => {
  try {
    const encrypted = atob(encryptedData);
    
    // Reverse XOR encryption
    let decoded = '';
    for (let i = 0; i < encrypted.length; i++) {
      decoded += String.fromCharCode(
        encrypted.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length)
      );
    }
    
    const jsonString = atob(decoded);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

export const secureSetItem = (key: string, data: any): void => {
  try {
    const encrypted = encryptData(data);
    if (encrypted) {
      localStorage.setItem(key, encrypted);
    }
  } catch (error) {
    console.error('Secure storage failed:', error);
  }
};

export const secureGetItem = (key: string): any => {
  try {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    
    return decryptData(encrypted);
  } catch (error) {
    console.error('Secure retrieval failed:', error);
    return null;
  }
};

export const secureRemoveItem = (key: string): void => {
  localStorage.removeItem(key);
};