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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function CreateCampaignDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    systemBase: 'D&D 5e',
    dmType: 'AI',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setLoading(true);
    try {
      await api.createCampaign(formData);
      toast.success('Campanha criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setOpen(false);
      setFormData({
        title: '',
        description: '',
        systemBase: 'D&D 5e',
        dmType: 'AI',
      });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar campanha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Nova Campanha
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mestrar nova aventura</DialogTitle>
          <DialogDescription>
            Defina o tema e o sistema da sua nova jornada.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Campanha</Label>
            <Input
              id="title"
              placeholder="Ex: As Crônicas de Eldoria"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição / Lore (Opcional)</Label>
            <Textarea
              id="description"
              placeholder="Uma breve introdução sobre o mundo..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="system">Sistema</Label>
              <Select
                value={formData.systemBase}
                onValueChange={(v) => setFormData({ ...formData, systemBase: v })}
              >
                <SelectTrigger id="system">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="D&D 5e">D&D 5e</SelectItem>
                  <SelectItem value="Tormenta20">Tormenta20</SelectItem>
                  <SelectItem value="Ordem Paranormal">Ordem Paranormal</SelectItem>
                  <SelectItem value="Pathfinder 2e">Pathfinder 2e</SelectItem>
                  <SelectItem value="Savage Worlds">Savage Worlds</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dmType">Tipo de Mestre</Label>
              <Select
                value={formData.dmType}
                onValueChange={(v) => setFormData({ ...formData, dmType: v })}
              >
                <SelectTrigger id="dmType">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AI">🤖 IA Oracle</SelectItem>
                  <SelectItem value="HUMAN">👤 Humano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Começar Aventura
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
