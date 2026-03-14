import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export function JoinCampaignDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setLoading(true);
    try {
      const campaign = await api.joinCampaign(inviteCode.trim());
      toast.success('Você entrou na campanha!');
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setOpen(false);
      setInviteCode('');
      if (campaign?.id) {
        navigate(`/campaign/${campaign.id}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao entrar na campanha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 rounded-lg">
          <UserPlus className="h-4 w-4" />
          Entrar em campanha
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Entrar em campanha</DialogTitle>
          <DialogDescription>
            Cole o codigo de convite para participar da aventura.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleJoin} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="invite">Codigo de convite</Label>
            <Input
              id="invite"
              placeholder="Ex: 1b3f2a9d-..."
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              required
            />
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
