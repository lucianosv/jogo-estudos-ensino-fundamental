
-- Criar tabela para cache de conteúdo gerado
CREATE TABLE public.generated_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL CHECK (content_type IN ('story', 'question', 'character_info')),
  theme TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days')
);

-- Criar índices para performance
CREATE INDEX idx_generated_content_type_theme ON public.generated_content(content_type, theme);
CREATE INDEX idx_generated_content_expires ON public.generated_content(expires_at);

-- Criar tabela para configurações do jogo
CREATE TABLE public.game_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  difficulty_level TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  preferred_characters TEXT[] DEFAULT ARRAY['Tanjiro', 'Nezuko', 'Zenitsu', 'Inosuke'],
  cache_duration_hours INTEGER DEFAULT 24,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir configurações padrão
INSERT INTO public.game_settings (difficulty_level, preferred_characters, cache_duration_hours) 
VALUES ('medium', ARRAY['Tanjiro', 'Nezuko', 'Zenitsu', 'Inosuke'], 24);

-- Ativar RLS nas tabelas
ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acesso público (já que é um jogo)
CREATE POLICY "Allow public read access to generated content" 
  ON public.generated_content 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert to generated content" 
  ON public.generated_content 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public read access to game settings" 
  ON public.game_settings 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public update to game settings" 
  ON public.game_settings 
  FOR UPDATE 
  USING (true);
