
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, Plus, X, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AuthForm from "@/components/auth/AuthForm";
import { sanitizeText, validateGameTheme } from "@/utils/securityUtils";

const SettingsSecure = () => {
  const [preferredCharacters, setPreferredCharacters] = useState<string[]>([]);
  const [newCharacter, setNewCharacter] = useState('');
  const { toast } = useToast();
  const { user, isAdmin, signOut, loading } = useAuth();

  const availableCharacters = ['Tanjiro', 'Nezuko', 'Zenitsu', 'Inosuke', 'Giyu', 'Rengoku', 'Shinobu', 'Tengen'];

  useEffect(() => {
    // Only load preferences if user is authenticated
    if (user) {
      const saved = localStorage.getItem(`preferred_characters_${user.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Validate each character before setting
          const validCharacters = Array.isArray(parsed) 
            ? parsed.filter(char => typeof char === 'string' && char.length <= 50)
            : [];
          setPreferredCharacters(validCharacters);
        } catch {
          setPreferredCharacters([]);
        }
      }
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    setPreferredCharacters([]);
  };

  const toggleCharacter = (character: string) => {
    if (!user) return;
    
    // Validate character name
    const sanitizedCharacter = sanitizeText(character);
    if (!sanitizedCharacter || !validateGameTheme(sanitizedCharacter)) {
      toast({
        title: "❌ Personagem inválido",
        description: "Nome de personagem não permitido.",
        variant: "destructive"
      });
      return;
    }
    
    const updated = preferredCharacters.includes(sanitizedCharacter)
      ? preferredCharacters.filter(c => c !== sanitizedCharacter)
      : [...preferredCharacters, sanitizedCharacter];
    
    setPreferredCharacters(updated);
    localStorage.setItem(`preferred_characters_${user.id}`, JSON.stringify(updated));
  };

  const addCustomCharacter = () => {
    if (!user) return;
    
    const sanitizedCharacter = sanitizeText(newCharacter.trim());
    
    if (!sanitizedCharacter) {
      toast({
        title: "❌ Nome inválido",
        description: "Nome do personagem não pode estar vazio.",
        variant: "destructive"
      });
      return;
    }
    
    if (preferredCharacters.includes(sanitizedCharacter)) {
      toast({
        title: "❌ Personagem já existe",
        description: "Este personagem já está nas suas preferências.",
        variant: "destructive"
      });
      return;
    }
    
    if (preferredCharacters.length >= 20) {
      toast({
        title: "❌ Limite atingido",
        description: "Máximo de 20 personagens permitidos.",
        variant: "destructive"
      });
      return;
    }
    
    const updated = [...preferredCharacters, sanitizedCharacter];
    setPreferredCharacters(updated);
    localStorage.setItem(`preferred_characters_${user.id}`, JSON.stringify(updated));
    setNewCharacter('');
    toast({
      title: "✅ Personagem adicionado!",
      description: `${sanitizedCharacter} foi adicionado às suas preferências.`,
    });
  };

  const removeCharacter = (character: string) => {
    if (!user) return;
    
    const updated = preferredCharacters.filter(c => c !== character);
    setPreferredCharacters(updated);
    localStorage.setItem(`preferred_characters_${user.id}`, JSON.stringify(updated));
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
            <CardTitle>Área Restrita</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Faça login para acessar as configurações avançadas
            </p>
          </CardHeader>
        </Card>
        <AuthForm />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-orange-500" />
          <CardTitle>Acesso Negado</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Você não tem permissão para acessar esta área.
          </p>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSignOut} variant="outline" className="w-full">
            <LogOut className="w-4 h-4 mr-2" />
            Fazer Logout
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Personagens Preferidos
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>👤 {user.email}</span>
              <Button onClick={handleSignOut} variant="ghost" size="sm">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
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
              placeholder="Adicionar personagem personalizado... (máx 50 chars)"
              value={newCharacter}
              onChange={(e) => setNewCharacter(sanitizeText(e.target.value))}
              onKeyPress={(e) => e.key === 'Enter' && addCustomCharacter()}
              maxLength={50}
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
