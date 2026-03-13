import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, ScrollText, LogOut, Plus } from 'lucide-react';
import { CreateCampaignDialog } from '@/components/CreateCampaignDialog';
import type { Campaign } from '@/types/models';
import mestriaLogo from '@/assets/mestria-logo.svg';

const CampaignCard = ({ campaign, index }: { campaign: Campaign; index: number }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onClick={() => navigate(`/campaign/${campaign.id}`)}
      className="glass-card cursor-pointer p-6"
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
          <ScrollText className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-lg font-bold text-foreground">{campaign.title}</h3>
          <span className="text-xs text-accent">{campaign.systemBase}</span>
        </div>
      </div>
      {campaign.description && (
        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{campaign.description}</p>
      )}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {campaign._count?.members ?? campaign.members?.length ?? 0} membros
        </span>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-foreground">
          {campaign.dmType === 'AI' ? '🤖 IA Mestre' : '👤 Mestre Humano'}
        </span>
      </div>
    </motion.div>
  );
};

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: api.getCampaigns,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-panel sticky top-0 z-50 flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <img src={mestriaLogo} alt="MestrIA" className="h-7 w-7" />
          <h1 className="font-display text-xl font-bold text-foreground">MestrIA</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Olá, {user?.name}</span>
          <button onClick={logout} className="text-muted-foreground transition-colors hover:text-foreground">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground">Suas Campanhas</h2>
            <p className="mt-1 text-sm text-muted-foreground">Escolha uma aventura para continuar</p>
          </div>
          <CreateCampaignDialog />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card h-40 animate-pulse p-6" />
            ))}
          </div>
        ) : campaigns && campaigns.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((c, i) => (
              <CampaignCard key={c.id} campaign={c} index={i} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-panel flex flex-col items-center justify-center py-20 text-center"
          >
            <ScrollText className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="font-display text-xl font-bold text-foreground">Nenhuma campanha encontrada</h3>
            <p className="mt-2 text-sm text-muted-foreground">Crie sua primeira aventura!</p>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
