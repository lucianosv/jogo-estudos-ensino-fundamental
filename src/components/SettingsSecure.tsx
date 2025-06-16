
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Key, Eye, EyeOff, Users, Plus, X } from "lucide-react";

const SettingsSecure = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [preferredCharacters, setPreferredCharacters] = useState<string[]>([]);
  const [newCharacter, setNewCharacter] = useState('');
  const { toast } = useToast();

  const correctPassword = 'admin123';
  const availableCharacters = ['Tanjiro', 'Nezuko', 'Zenitsu', 'Inosuke', 'Giyu', 'Rengoku', 'Shinobu', 'Tengen'];

  useEffect(() => {
    const saved = localStorage.getItem('preferred_characters');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferredCharacters(Array.isArray(parsed) ? parsed : []);
      } catch {
        setPreferredCharacters([]);
      }
    }
  }, []);

  const handleUnlock = () => {
    if (password === correctPassword) {
      setIsUnlocked(true);
      toast({
        title: "🔓 Acesso liberado!",
        description: "Configurações avançadas desbloqueadas.",
      });
    } else {
      toast({
        title: "❌ Senha incorreta",
        description: "Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const toggleCharacter = (character: string) => {
    const updated = preferredCharacters.includes(character)
      ? preferredCharacters.filter(c => c !== character)
      : [...preferredCharacters, character];
    
    setPreferredCharacters(updated);
    localStorage.setItem('preferred_characters', JSON.stringify(updated));
  };

  const addCustomCharacter = () => {
    if (newCharacter.trim() && !preferredCharacters.includes(newCharacter.trim())) {
      const updated = [...preferredCharacters, newCharacter.trim()];
      setPreferredCharacters(updated);
      localStorage.setItem('preferred_characters', JSON.stringify(updated));
      setNewCharacter('');
      toast({
        title: "✅ Personagem adicionado!",
        description: `${newCharacter.trim()} foi adicionado às suas preferências.`,
      });
    }
  };

  const removeCharacter = (character: string) => {
    const updated = preferredCharacters.filter(c => c !== character);
    setPreferredCharacters(updated);
    localStorage.setItem('preferred_characters', JSON.stringify(updated));
  };

  if (!isUnlocked) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <CardTitle>Área Restrita</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Senha de Administrador</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha..."
                onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <Button onClick={handleUnlock} className="w-full">
            <Key className="w-4 h-4 mr-2" />
            Desbloquear
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Personagens Preferidos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {availableCharacters.map(character => (
              <Badge
                key={character}
                variant={preferredCharacters.includes(character) ? "default" : "outline" as "default" | "outline"}
                className="cursor-pointer"
                onClick={() => toggleCharacter(character)}
              >
                {character}
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Adicionar personagem personalizado..."
              value={newCharacter}
              onChange={(e) => setNewCharacter(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomCharacter()}
            />
            <Button onClick={addCustomCharacter} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {preferredCharacters.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Seus personagens:</h4>
              <div className="flex flex-wrap gap-2">
                {preferredCharacters.map(character => (
                  <Badge key={character} variant="default" className="flex items-center gap-1">
                    {character}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-red-500" 
                      onClick={() => removeCharacter(character)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsSecure;
