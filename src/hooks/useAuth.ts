import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "✅ Conta criada!",
        description: "Verifique seu email para confirmar a conta.",
      });
      
      return { success: true };
    } catch (error: any) {
      toast({
        title: "❌ Erro ao criar conta",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "✅ Login realizado!",
        description: "Bem-vindo de volta!",
      });
      
      return { success: true };
    } catch (error: any) {
      toast({
        title: "❌ Erro no login",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "👋 Logout realizado",
        description: "Até logo!",
      });
    } catch (error: any) {
      toast({
        title: "❌ Erro no logout",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const isAdmin = () => {
    // Check if user has admin role or specific email domains
    if (!user?.email) return false;
    
    // Add your admin logic here
    const adminEmails = ['admin@example.com']; // Replace with actual admin emails
    return adminEmails.includes(user.email) || user.email.endsWith('@admin.com');
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin: isAdmin(),
    isAuthenticated: !!user,
  };
};