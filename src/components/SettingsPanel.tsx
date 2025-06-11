
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Settings, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GameSettings {
  id: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  preferred_characters: string[];
  cache_duration_hours: number;
}

const SettingsPanel = () => {
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const availableCharacters = ['Tanjiro', 'Nezuko', 'Zenitsu', 'Inosuke'];
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
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar configurações:', error);
        return;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<GameSettings>) => {
    if (!settings) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('game_settings')
        .update(newSettings)
        .eq('id', settings.id);

      if (error) {
        throw error;
      }

      setSettings({ ...settings, ...newSettings });
      toast({
        title: "✅ Configurações salvas!",
        description: "As preferências foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "❌ Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('generated_content')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Deletar tudo

      if (error) {
        throw error;
      }

      toast({
        title: "🗑️ Cache limpo!",
        description: "Todo o conteúdo em cache foi removido. Novo conteúdo será gerado.",
      });
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      toast({
        title: "❌ Erro ao limpar cache",
        description: "Não foi possível limpar o cache.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCharacter = (character: string) => {
    if (!settings) return;

    const newCharacters = settings.preferred_characters.includes(character)
      ? settings.preferred_characters.filter(c => c !== character)
      : [...settings.preferred_characters, character];

    updateSettings({ preferred_characters: newCharacters });
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
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Dificuldade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nível de Dificuldade
          </label>
          <Select
            value={settings.difficulty_level}
            onValueChange={(value: 'easy' | 'medium' | 'hard') => 
              updateSettings({ difficulty_level: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(difficultyLevels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Personagens Preferidos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Personagens Preferidos
          </label>
          <div className="flex flex-wrap gap-2">
            {availableCharacters.map((character) => (
              <Badge
                key={character}
                variant={settings.preferred_characters.includes(character) ? "default" : "outline"}
                className="cursor-pointer hover:scale-105 transition-transform"
                onClick={() => toggleCharacter(character)}
              >
                {character}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Clique para ativar/desativar personagens
          </p>
        </div>

        {/* Duração do Cache */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cache de Conteúdo (horas)
          </label>
          <Select
            value={settings.cache_duration_hours.toString()}
            onValueChange={(value) => 
              updateSettings({ cache_duration_hours: parseInt(value) })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 hora</SelectItem>
              <SelectItem value="6">6 horas</SelectItem>
              <SelectItem value="24">24 horas</SelectItem>
              <SelectItem value="168">1 semana</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Botão Limpar Cache */}
        <div>
          <Button
            onClick={clearCache}
            disabled={isLoading}
            variant="outline"
            className="w-full border-red-300 text-red-600 hover:bg-red-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Limpando...' : 'Limpar Cache de Conteúdo'}
          </Button>
          <p className="text-xs text-gray-500 mt-1">
            Remove todo conteúdo gerado para forçar nova criação
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsPanel;
