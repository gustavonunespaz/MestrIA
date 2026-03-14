import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Facebook, Mail, User, Chrome } from 'lucide-react';
import mestriaLogo from '@/assets/mestria-logo.svg';

const UserProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await updateProfile({ name: name.trim() });
      toast.success('Nome atualizado com sucesso');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleSocial = (provider: 'google' | 'facebook') => {
    toast.message(`Conexao com ${provider} sera liberada assim que as chaves forem configuradas.`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-panel sticky top-0 z-50 flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <img src={mestriaLogo} alt="MestrIA" className="h-7 w-7" />
          <h1 className="font-display text-xl font-bold text-foreground">MestrIA</h1>
        </div>
        <Button variant="ghost" onClick={() => navigate('/')}> 
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-6">
          <h2 className="font-display text-3xl font-bold text-foreground">Perfil do usuario</h2>
          <p className="mt-1 text-sm text-muted-foreground">Atualize seus dados e conecte contas sociais.</p>
        </div>

        <div className="glass-panel p-6">
          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ''} disabled />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={saving}>
                <User className="mr-2 h-4 w-4" />
                Salvar perfil
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-8 glass-panel p-6">
          <h3 className="mb-2 font-display text-lg font-bold text-foreground">Contas sociais</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Conecte para entrar mais rapido. Para ativar, configure as chaves no backend.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" onClick={() => handleSocial('google')} className="flex-1 justify-center">
              <Chrome className="mr-2 h-4 w-4" />
              Conectar Google
            </Button>
            <Button variant="outline" onClick={() => handleSocial('facebook')} className="flex-1 justify-center">
              <Facebook className="mr-2 h-4 w-4" />
              Conectar Facebook
            </Button>
            <Button variant="outline" onClick={() => toast.message('Link magico em breve.')} className="flex-1 justify-center">
              <Mail className="mr-2 h-4 w-4" />
              Link por email
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfilePage;
