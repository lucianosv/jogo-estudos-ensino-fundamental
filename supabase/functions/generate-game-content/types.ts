
export interface GenerateContentRequest {
  contentType: 'story' | 'question' | 'character_info';
  subject: string;
  theme: string;
  schoolGrade: string;
  themeDetails?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  forceRegenerate?: boolean;
}
