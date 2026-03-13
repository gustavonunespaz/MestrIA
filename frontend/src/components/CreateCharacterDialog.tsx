import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface CreateCharacterDialogProps {
  campaignId: string;
}

export function CreateCharacterDialog({ campaignId }: CreateCharacterDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    raceId: '',
    classId: '',
    level: 1,
  });

  const { data: races = [] } = useQuery({
    queryKey: ['races'],
    queryFn: api.getRaces,
    enabled: open,
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: api.getClasses,
    enabled: open,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.raceId || !formData.classId) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      await api.createCharacter({
        ...formData,
        campaignId,
        isBot: false,
        isAlive: true,
        attributes: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }
      });
      toast.success('Personagem criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['characters', campaignId] });
      setOpen(false);
      setFormData({ name: '', raceId: '', classId: '', level: 1 });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar personagem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Novo Personagem
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Herói</DialogTitle>
          <DialogDescription>
            Entre no mundo de MestrIA com um novo personagem.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="char-name">Nome do Personagem</Label>
            <Input
              id="char-name"
              placeholder="Ex: Valerius, o Bravo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="race">Raça</Label>
              <Select
                value={formData.raceId}
                onValueChange={(v) => setFormData({ ...formData, raceId: v })}
              >
                <SelectTrigger id="race">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {races.map((race) => (
                    <SelectItem key={race.id} value={race.id}>{race.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="class">Classe</Label>
              <Select
                value={formData.classId}
                onValueChange={(v) => setFormData({ ...formData, classId: v })}
              >
                <SelectTrigger id="class">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Nível Inicial</Label>
            <Input
              id="level"
              type="number"
              min={1}
              max={20}
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
              required
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Personagem
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
