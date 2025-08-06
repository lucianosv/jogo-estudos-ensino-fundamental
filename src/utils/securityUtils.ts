
// Security utility functions for input validation and sanitization

export const sanitizeText = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 1000); // Limit length
};

export const validateGameTheme = (theme: string): boolean => {
  const allowedThemes = [
    'Tanjiro', 'Nezuko', 'Zenitsu', 'Inosuke', 'Giyu', 'Rengoku', 'Shinobu', 'Tengen',
    'Tanjiro e a Coragem', 'Nezuko e a Família', 
    'Zenitsu e os Medos', 'Inosuke e a Natureza'
  ];
  
  // Allow basic character names and some custom variations
  return allowedThemes.some(allowed => 
    theme.toLowerCase().includes(allowed.toLowerCase()) || 
    allowed.toLowerCase().includes(theme.toLowerCase())
  ) || /^[a-záàâãéèêíïóôõöúçñA-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s]+$/.test(theme);
};

export const validateDifficultyLevel = (difficulty: string): 'easy' | 'medium' | 'hard' => {
  const validLevels: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
  return validLevels.includes(difficulty as any) ? difficulty as any : 'medium';
};

export const logSecurityEvent = (event: string, details?: any) => {
  // Log security events for monitoring
  console.warn(`Security Event: ${event}`, details ? JSON.stringify(details) : '');
};

// Rate limiting helper (simple in-memory implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (identifier: string, maxRequests = 10, windowMs = 60000): boolean => {
  const now = Date.now();
  const userRequests = requestCounts.get(identifier);
  
  if (!userRequests || now > userRequests.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (userRequests.count >= maxRequests) {
    logSecurityEvent('Rate limit exceeded', { identifier, count: userRequests.count });
    return false;
  }
  
  userRequests.count++;
  return true;
};
