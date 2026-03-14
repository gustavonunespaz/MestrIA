import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import mestriaLogo from '@/assets/mestria-logo.svg';

const SETTINGS_KEY = 'mestria_settings';

type SettingsState = {
  autoScrollChat: boolean;
  diceSounds: boolean;
  showTimestamps: boolean;
  compactSidebar: boolean;
};

const DEFAULT_SETTINGS: SettingsState = {
  autoScrollChat: true,
  diceSounds: true,
  showTimestamps: true,
  compactSidebar: false,
};

const UserSettingsPage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);

  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<SettingsState>;
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch {
        setSettings(DEFAULT_SETTINGS);
      }
    }
  }, []);

  const updateSetting = (key: keyof SettingsState, value: boolean) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    toast.success('Configuracao salva.');
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
          <h2 className="font-display text-3xl font-bold text-foreground">Configuracoes</h2>
          <p className="mt-1 text-sm text-muted-foreground">Personalize sua experiencia.</p>
        </div>

        <div className="glass-panel divide-y divide-border">
          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <Label className="text-base">Auto-scroll no chat</Label>
              <p className="text-xs text-muted-foreground">Mantem a conversa no final automaticamente.</p>
            </div>
            <Switch
              checked={settings.autoScrollChat}
              onCheckedChange={(value) => updateSetting('autoScrollChat', value)}
            />
          </div>

          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <Label className="text-base">Som nos dados</Label>
              <p className="text-xs text-muted-foreground">Ativa efeitos sonoros ao rolar dados.</p>
            </div>
            <Switch
              checked={settings.diceSounds}
              onCheckedChange={(value) => updateSetting('diceSounds', value)}
            />
          </div>

          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <Label className="text-base">Mostrar horarios</Label>
              <p className="text-xs text-muted-foreground">Exibe horario nas mensagens.</p>
            </div>
            <Switch
              checked={settings.showTimestamps}
              onCheckedChange={(value) => updateSetting('showTimestamps', value)}
            />
          </div>

          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <Label className="text-base">Sidebar compacta</Label>
              <p className="text-xs text-muted-foreground">Economiza espaco em telas menores.</p>
            </div>
            <Switch
              checked={settings.compactSidebar}
              onCheckedChange={(value) => updateSetting('compactSidebar', value)}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserSettingsPage;
