
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Book, User, Sparkles } from "lucide-react";

export interface GameParameters {
  subject: string;
  theme: string;
}

interface GameSetupProps {
  onSetupComplete: (params: GameParameters) => void;
}

const subjects = ['Matemática', 'História', 'Ciências'];
const themes: Record<string, string[]> = {
  'Matemática': ['Demon Slayer', 'Naruto', 'One Piece'],
  'História': ['Antigo Egito', 'Roma Antiga', 'Grandes Navegações'],
  'Ciências': ['Sistema Solar', 'Corpo Humano', 'Dinossauros'],
};

const GameSetup = ({ onSetupComplete }: GameSetupProps) => {
  const [subject, setSubject] = useState<string>(subjects[0]);
  const [theme, setTheme] = useState<string>(themes[subject][0]);
  const [availableThemes, setAvailableThemes] = useState<string[]>(themes['Matemática']);

  const handleSubjectChange = (newSubject: string) => {
    setSubject(newSubject);
    const newThemes = themes[newSubject] || [];
    setAvailableThemes(newThemes);
    setTheme(newThemes[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject && theme) {
      onSetupComplete({ subject, theme });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-lg mx-auto bg-white/95 backdrop-blur-sm shadow-2xl border-4 border-purple-500 animate-fade-in">
        <CardHeader className="text-center bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white rounded-t-lg">
            <CardTitle className="text-3xl font-bold tracking-wide">Prepare sua Aventura!</CardTitle>
            <p className="text-lg opacity-90 font-medium">Escolha a matéria e o tema para começar</p>
        </CardHeader>
        <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="subject" className="text-lg font-semibold flex items-center gap-2"><Book className="w-5 h-5" /> Matéria</Label>
                <Select value={subject} onValueChange={handleSubjectChange}>
                <SelectTrigger id="subject" className="w-full text-base py-6">
                    <SelectValue placeholder="Selecione a matéria..." />
                </SelectTrigger>
                <SelectContent>
                    {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="theme" className="text-lg font-semibold flex items-center gap-2"><User className="w-5 h-5" /> Tema</Label>
                <Select value={theme} onValueChange={setTheme} disabled={!availableThemes.length}>
                <SelectTrigger id="theme" className="w-full text-base py-6">
                    <SelectValue placeholder="Selecione o tema..." />
                </SelectTrigger>
                <SelectContent>
                    {availableThemes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
                </Select>
            </div>
            <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:opacity-90 text-white font-bold py-4 px-10 text-xl rounded-full transform transition-all duration-200 hover:scale-105 shadow-lg"
            >
                <Sparkles className="w-6 h-6 mr-2" />
                Iniciar Jornada
            </Button>
            </form>
        </CardContent>
        </Card>
    </div>
  );
};

export default GameSetup;
