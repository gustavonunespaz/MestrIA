import { useState } from 'react';
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
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeleteCampaignDialogProps {
  campaignId: string;
  campaignTitle: string;
  onDeleted?: () => void;
}

export function DeleteCampaignDialog({ campaignId, campaignTitle, onDeleted }: DeleteCampaignDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.deleteCampaign(campaignId);
      toast.success('Campanha apagada.');
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setOpen(false);
      onDeleted?.();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao apagar campanha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:text-destructive"
          aria-label="Apagar campanha"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Apagar campanha</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja apagar a campanha "{campaignTitle}"? Esta acao nao pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Apagar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
