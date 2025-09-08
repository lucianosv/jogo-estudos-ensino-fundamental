// SERVIÇO DE FALLBACK VIA SUPABASE - BANCO DE DADOS
// Consulta tabelas fallback_questions e fallback_stories como backup robusto

import { supabase } from '@/integrations/supabase/client';
import { GameParameters } from '@/components/GameSetup';

export interface DatabaseQuestion {
  content: string;
  choices: string[];
  answer: string;
  word: string;
  subject?: string;
  theme?: string;
  school_grade?: string;
}

export interface DatabaseStory {
  title: string;
  content: string;
  subject?: string;
  theme?: string;
  school_grade?: string;
}

class DatabaseFallbackService {
  private static instance: DatabaseFallbackService;
  private questionCache = new Map<string, DatabaseQuestion[]>();
  private storyCache = new Map<string, DatabaseStory[]>();

  static getInstance(): DatabaseFallbackService {
    if (!this.instance) {
      this.instance = new DatabaseFallbackService();
    }
    return this.instance;
  }

  // Buscar questões do banco para parâmetros específicos
  async getFallbackQuestions(gameParams: GameParameters): Promise<DatabaseQuestion[]> {
    const cacheKey = `${gameParams.subject}_${gameParams.theme}_${gameParams.schoolGrade}`;
    
    // Verificar cache primeiro
    if (this.questionCache.has(cacheKey)) {
      console.log(`[DATABASE-FALLBACK] ✅ Questões em cache para ${cacheKey}`);
      return this.questionCache.get(cacheKey) || [];
    }

    try {
      console.log(`[DATABASE-FALLBACK] 🔍 Buscando questões no Supabase para:`, gameParams);
      
      // Tentar busca exata primeiro
      let { data: exactQuestions, error: exactError } = await supabase
        .from('fallback_questions')
        .select('*')
        .eq('subject', gameParams.subject)
        .eq('theme', gameParams.theme)
        .eq('school_grade', gameParams.schoolGrade)
        .limit(10);

      if (exactQuestions && exactQuestions.length > 0) {
        console.log(`[DATABASE-FALLBACK] ✅ Encontradas ${exactQuestions.length} questões exatas`);
        this.questionCache.set(cacheKey, exactQuestions);
        return exactQuestions;
      }

      // Busca menos restritiva por matéria e série
      let { data: subjectQuestions, error: subjectError } = await supabase
        .from('fallback_questions')
        .select('*')
        .eq('subject', gameParams.subject)
        .eq('school_grade', gameParams.schoolGrade)
        .limit(8);

      if (subjectQuestions && subjectQuestions.length > 0) {
        console.log(`[DATABASE-FALLBACK] ✅ Encontradas ${subjectQuestions.length} questões por matéria`);
        this.questionCache.set(cacheKey, subjectQuestions);
        return subjectQuestions;
      }

      // Busca genérica por matéria
      let { data: genericQuestions, error: genericError } = await supabase
        .from('fallback_questions')
        .select('*')
        .eq('subject', gameParams.subject)
        .limit(6);

      if (genericQuestions && genericQuestions.length > 0) {
        console.log(`[DATABASE-FALLBACK] ✅ Encontradas ${genericQuestions.length} questões genéricas`);
        this.questionCache.set(cacheKey, genericQuestions);
        return genericQuestions;
      }

      console.log(`[DATABASE-FALLBACK] ⚠️ Nenhuma questão encontrada no banco`);
      return [];

    } catch (error) {
      console.error(`[DATABASE-FALLBACK] ❌ Erro ao buscar questões:`, error);
      return [];
    }
  }

  // Buscar histórias do banco para parâmetros específicos
  async getFallbackStories(gameParams: GameParameters): Promise<DatabaseStory[]> {
    const cacheKey = `story_${gameParams.subject}_${gameParams.theme}_${gameParams.schoolGrade}`;
    
    // Verificar cache primeiro
    if (this.storyCache.has(cacheKey)) {
      console.log(`[DATABASE-FALLBACK] ✅ Histórias em cache para ${cacheKey}`);
      return this.storyCache.get(cacheKey) || [];
    }

    try {
      console.log(`[DATABASE-FALLBACK] 🔍 Buscando histórias no Supabase para:`, gameParams);
      
      // Tentar busca exata primeiro
      let { data: exactStories, error: exactError } = await supabase
        .from('fallback_stories')
        .select('*')
        .eq('subject', gameParams.subject)
        .eq('theme', gameParams.theme)
        .eq('school_grade', gameParams.schoolGrade)
        .limit(5);

      if (exactStories && exactStories.length > 0) {
        console.log(`[DATABASE-FALLBACK] ✅ Encontradas ${exactStories.length} histórias exatas`);
        this.storyCache.set(cacheKey, exactStories);
        return exactStories;
      }

      // Busca menos restritiva por matéria e série
      let { data: subjectStories, error: subjectError } = await supabase
        .from('fallback_stories')
        .select('*')
        .eq('subject', gameParams.subject)
        .eq('school_grade', gameParams.schoolGrade)
        .limit(3);

      if (subjectStories && subjectStories.length > 0) {
        console.log(`[DATABASE-FALLBACK] ✅ Encontradas ${subjectStories.length} histórias por matéria`);
        this.storyCache.set(cacheKey, subjectStories);
        return subjectStories;
      }

      // Busca genérica por matéria
      let { data: genericStories, error: genericError } = await supabase
        .from('fallback_stories')
        .select('*')
        .eq('subject', gameParams.subject)
        .limit(2);

      if (genericStories && genericStories.length > 0) {
        console.log(`[DATABASE-FALLBACK] ✅ Encontradas ${genericStories.length} histórias genéricas`);
        this.storyCache.set(cacheKey, genericStories);
        return genericStories;
      }

      console.log(`[DATABASE-FALLBACK] ⚠️ Nenhuma história encontrada no banco`);
      return [];

    } catch (error) {
      console.error(`[DATABASE-FALLBACK] ❌ Erro ao buscar histórias:`, error);
      return [];
    }
  }

  // Limpar cache
  clearCache(): void {
    this.questionCache.clear();
    this.storyCache.clear();
    console.log('[DATABASE-FALLBACK] Cache limpo');
  }

  // Verificar se as tabelas existem (opcional para debug)
  async checkTablesExist(): Promise<boolean> {
    try {
      const { data: questionsExists } = await supabase
        .from('fallback_questions')
        .select('id')
        .limit(1);
      
      const { data: storiesExists } = await supabase
        .from('fallback_stories')  
        .select('id')
        .limit(1);

      const tablesExist = questionsExists !== null && storiesExists !== null;
      console.log(`[DATABASE-FALLBACK] Tabelas existem: ${tablesExist}`);
      return tablesExist;

    } catch (error) {
      console.log(`[DATABASE-FALLBACK] ⚠️ Tabelas fallback não encontradas - usando apenas fallbacks locais`);
      return false;
    }
  }
}

export const databaseFallbackService = DatabaseFallbackService.getInstance();