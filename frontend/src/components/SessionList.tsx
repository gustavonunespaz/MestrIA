import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Loader2, Play } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SessionListProps {
  campaignId: string;
}

export function SessionList({ campaignId }: SessionListProps) {
  const queryClient = useQueryClient();
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions', campaignId],
    queryFn: () => api.getSessions(campaignId),
  });

  const handleCreateSession = async () => {
    try {
      await api.createSession({ 
        campaignId, 
        title: `Sessão ${sessions.length + 1}`,
        scheduledFor: new Date().toISOString() 
      });
      toast.success('Sessão agendada!');
      queryClient.invalidateQueries({ queryKey: ['sessions', campaignId] });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar sessão');
    }
  };

  if (isLoading) return <Loader2 className="mx-auto h-6 w-6 animate-spin" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Sessões
        </h3>
        <Button variant="ghost" size="sm" onClick={handleCreateSession} className="h-8 px-2">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {sessions.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-4">Nenhuma sessão agendada.</p>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="group relative flex items-center gap-3 rounded-lg bg-secondary/30 p-3 transition-colors hover:bg-secondary/50">
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {session.title || 'Sessão sem título'}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {session.scheduledFor ? format(new Date(session.scheduledFor), "PPP 'às' p", { locale: ptBR }) : 'Não agendada'}
                </p>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="h-4 w-4 text-primary" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
