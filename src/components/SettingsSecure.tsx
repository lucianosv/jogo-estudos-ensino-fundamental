import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Settings, RefreshCw, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GameSettings {
  id: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  preferred_characters: string[];
  cache_duration_hours: number;
}

// Restringe explicitamente os tipos aceitos pelo Badge

// use exatamente o tipo aceito pelo Badge
const getBadgeVariant = (isActive: boolean): NonNullable<BadgeProps['variant']> =>
  isActive ? "default" : "outline";

// Subcomponentes pequenos
const DifficultyField = ({ level }: { level: GameSettings['difficulty_level'] }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Nível de Dificuldade
    </label>
    <div className="p-3 bg-gray-50 border rounded-md">
      <span className="text-sm text-gray-800">{difficultyLevels[level]}</span>
    </div>
    <p className="text-xs text-gray-500 mt-1">
      Configuração protegida contra alterações
    </p>
  </div>
);

const availableCharacters = ['Tanjiro', 'Nezuko', 'Zenitsu', 'Inosuke'];
const difficultyLevels = {
  easy: 'Fácil (1-20)',
  medium: 'Médio (1-100)', 
  hard: 'Difícil (números maiores)'
};

const CharactersField = ({ preferred }: { preferred: string[] }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Personagens Disponíveis
    </label>
    <div className="flex flex-wrap gap-2">
      {availableCharacters.map((character) => {
        const isActive = preferred.includes(character);
        return (
          <Badge
            key={character}
            variant={getBadgeVariant(isActive)}
            className="cursor-default"
          >
            {character}
          </Badge>
        );
      })}
    </div>
    <p className="text-xs text-gray-500 mt-1">
      Personagens configurados pelo sistema
    </p>
  </div>
);

const CacheField = ({ hours }: { hours: number }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Cache de Conteúdo
    </label>
    <div className="p-3 bg-gray-50 border rounded-md">
      <span className="text-sm text-gray-800">
        {hours} horas
      </span>
    </div>
    <p className="text-xs text-gray-500 mt-1">
      Duração do cache otimizada para segurança
    </p>
  </div>
);

const CacheClearButton = ({ clearCache, isLoading }: { clearCache: () => void, isLoading: boolean }) => (
  <div>
    <Button
      onClick={clearCache}
      disabled={isLoading}
      variant="outline"
      className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
    >
      <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? 'Limpando...' : 'Limpar Cache Expirado'}
    </Button>
    <p className="text-xs text-gray-500 mt-1">
      Remove apenas conteúdo expirado com segurança
    </p>
  </div>
);

const SettingsSecure = () => {
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('game_settings')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error loading settings:', error);
        toast({
          title: "Erro ao carregar configurações",
          description: "Usando configurações padrão.",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        const typedSettings: GameSettings = {
          ...data,
          difficulty_level: data.difficulty_level as 'easy' | 'medium' | 'hard'
        };
        setSettings(typedSettings);
      }
    } catch (error) {
      console.error('Unexpected error loading settings:', error);
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  };

  const clearCache = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.rpc('cleanup_expired_content');
      if (error) throw error;
      toast({
        title: "🗑️ Cache limpo!",
        description: "Conteúdo expirado foi removido com segurança.",
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast({
        title: "❌ Erro ao limpar cache",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!settings) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando configurações...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-xl border-2 border-purple-200">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configurações do Jogo
          <span className="ml-auto flex items-center">
            <Shield className="w-4 h-4" aria-hidden="true" />
            <span className="sr-only">Configurações seguras</span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <DifficultyField level={settings.difficulty_level} />
        <CharactersField preferred={settings.preferred_characters} />
        <CacheField hours={settings.cache_duration_hours} />
        <CacheClearButton clearCache={clearCache} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
};

export default SettingsSecure;
