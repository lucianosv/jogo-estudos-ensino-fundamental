import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Settings, RefreshCw, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GameSettings {
  id: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  preferred_characters: string[];
  cache_duration_hours: number;
}

const SettingsSecure = () => {
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const availableCharacters = ['Tanjiro', 'Nezuko', 'Zenitsu', 'Inosuke'];
  // O tipo "variant" do Badge pode ser só "default" | "secondary" | "destructive" | "outline"
  // Vamos fazer um helper para garantir o tipo correto:
  type BadgeVariant = "default" | "secondary" | "destructive" | "outline";
  const getBadgeVariant = (isActive: boolean): "default" | "outline" =>
    isActive ? "default" : "outline";
  const difficultyLevels = {
    easy: 'Fácil (1-20)',
    medium: 'Médio (1-100)', 
    hard: 'Difícil (números maiores)'
  };

  useEffect(() => {
    loadSettings();
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
      // Call cleanup function to remove expired content
      const { error } = await supabase.rpc('cleanup_expired_content');

      if (error) {
        throw error;
      }

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
        {/* Display current difficulty (read-only for security) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nível de Dificuldade
          </label>
          <div className="p-3 bg-gray-50 border rounded-md">
            <span className="text-sm text-gray-800">
              {difficultyLevels[settings.difficulty_level as keyof typeof difficultyLevels]}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Configuração protegida contra alterações
          </p>
        </div>

        {/* Display preferred characters (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Personagens Disponíveis
          </label>
          <div className="flex flex-wrap gap-2">
            {availableCharacters.map((character) => {
              const isActive = settings.preferred_characters.includes(character);
              const variant: "default" | "outline" = getBadgeVariant(isActive);
              return (
                <Badge
                  key={character}
                  variant={variant}
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

        {/* Cache duration (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cache de Conteúdo
          </label>
          <div className="p-3 bg-gray-50 border rounded-md">
            <span className="text-sm text-gray-800">
              {settings.cache_duration_hours} horas
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Duração do cache otimizada para segurança
          </p>
        </div>

        {/* Secure cache clear button */}
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
      </CardContent>
    </Card>
  );
};

export default SettingsSecure;
