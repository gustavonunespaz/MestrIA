import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const STEPS = ['Identidade', 'Personalidade', 'Atributos', 'Historia', 'Resumo'];
const BASE_ATTR = 8;
const MAX_ATTR = 15;
const POOL = 10;

const defaultAttributes = {
  strength: BASE_ATTR,
  dexterity: BASE_ATTR,
  constitution: BASE_ATTR,
  intelligence: BASE_ATTR,
  wisdom: BASE_ATTR,
  charisma: BASE_ATTR,
};

const attributeLabels: Record<string, string> = {
  strength: 'Forca',
  dexterity: 'Destreza',
  constitution: 'Constituicao',
  intelligence: 'Inteligencia',
  wisdom: 'Sabedoria',
  charisma: 'Carisma',
};

const CharacterCreatePage = () => {
  const { id: campaignId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    raceId: '',
    classId: '',
    level: 1,
    avatarUrl: '',
    archetype: '',
    personality: '',
    behavior: '',
    voice: '',
    alignment: '',
    backstory: '',
    motivation: '',
    fear: '',
    goal: '',
  });

  const [attributes, setAttributes] = useState(defaultAttributes);

  const { data: campaign } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => api.getCampaign(campaignId!),
    enabled: !!campaignId,
  });

  const { data: races = [] } = useQuery({
    queryKey: ['races'],
    queryFn: api.getRaces,
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: api.getClasses,
  });

  const { data: existingCharacters = [], isLoading: charactersLoading } = useQuery({
    queryKey: ['characters', campaignId],
    queryFn: () => api.getCharacters(campaignId!),
    enabled: !!campaignId,
  });

  const selectedRace = useMemo(() => races.find((r) => r.id === form.raceId), [races, form.raceId]);
  const selectedClass = useMemo(() => classes.find((c) => c.id === form.classId), [classes, form.classId]);

  useEffect(() => {
    if (!campaignId || charactersLoading) return;
    if (!user?.id) return;
    const hasCharacter = existingCharacters.some((char) => char.userId === user.id);
    if (hasCharacter) {
      navigate(`/campaign/${campaignId}`);
    }
  }, [campaignId, charactersLoading, existingCharacters, navigate, user]);

  const pointsUsed = Object.values(attributes).reduce((acc, val) => acc + (val - BASE_ATTR), 0);
  const pointsLeft = POOL - pointsUsed;

  const canNext = () => {
    if (step === 0) {
      return form.name.trim().length >= 2 && form.raceId && form.classId && form.level >= 1;
    }
    if (step === 2) {
      return pointsLeft >= 0;
    }
    return true;
  };

  const updateAttribute = (key: keyof typeof attributes, delta: number) => {
    setAttributes((prev) => {
      const next = { ...prev };
      const nextVal = next[key] + delta;
      if (nextVal < BASE_ATTR || nextVal > MAX_ATTR) return prev;
      const used = Object.values({ ...next, [key]: nextVal }).reduce((acc, val) => acc + (val - BASE_ATTR), 0);
      if (used > POOL) return prev;
      next[key] = nextVal;
      return next;
    });
  };

  const computeHpMax = () => {
    const hitDice = selectedClass?.hitDice || 'd8';
    const die = parseInt(hitDice.replace(/\D/g, ''), 10);
    const conMod = Math.floor((attributes.constitution - 10) / 2);
    const base = Number.isFinite(die) && die > 0 ? die : 8;
    return Math.max(1, base + conMod);
  };

  const handleCreate = async () => {
    if (!campaignId) return;
    if (!canNext()) {
      toast.error('Preencha os campos obrigatorios');
      return;
    }

    setLoading(true);
    try {
      const hpMax = computeHpMax();
      const payload = {
        name: form.name.trim(),
        campaignId,
        raceId: form.raceId,
        classId: form.classId,
        level: Number(form.level) || 1,
        hpCurrent: hpMax,
        hpMax,
        isBot: false,
        avatarUrl: form.avatarUrl?.trim() || undefined,
        attributes: {
          ...attributes,
          profile: {
            archetype: form.archetype,
            personality: form.personality,
            behavior: form.behavior,
            voice: form.voice,
            alignment: form.alignment,
            backstory: form.backstory,
            motivation: form.motivation,
            fear: form.fear,
            goal: form.goal,
          },
        },
      };

      await api.createCharacter(payload);
      toast.success('Personagem criado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['characters', campaignId] });
      navigate(`/campaign/${campaignId}`);
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao criar personagem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para inicio
          </Button>
        </div>
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-foreground">Criar Personagem</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {campaign?.title ? `Campanha: ${campaign.title}` : 'Finalize a criacao antes de entrar na aventura'}
          </p>
        </div>

        <div className="glass-panel p-6">
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Etapa {step + 1} de {STEPS.length}</span>
              <span>{STEPS[step]}</span>
            </div>
            <Progress value={((step + 1) / STEPS.length) * 100} />
          </div>

          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do personagem</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Valerius"
                />
              </div>

              <div className="space-y-2">
                <Label>Avatar (URL opcional)</Label>
                <Input
                  value={form.avatarUrl}
                  onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Raca</Label>
                  <Select
                    value={form.raceId}
                    onValueChange={(v) => setForm({ ...form, raceId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {races.map((race) => (
                        <SelectItem key={race.id} value={race.id}>{race.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedRace?.description && (
                    <p className="text-xs text-muted-foreground">{selectedRace.description}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Classe</Label>
                  <Select
                    value={form.classId}
                    onValueChange={(v) => setForm({ ...form, classId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedClass?.description && (
                    <p className="text-xs text-muted-foreground">{selectedClass.description}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nivel inicial</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: Number(e.target.value) })}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Arquetipo</Label>
                <Input
                  value={form.archetype}
                  onChange={(e) => setForm({ ...form, archetype: e.target.value })}
                  placeholder="Ex: Heroi relutante, Estrategista, Curandeiro"
                />
              </div>

              <div className="space-y-2">
                <Label>Personalidade</Label>
                <Textarea
                  value={form.personality}
                  onChange={(e) => setForm({ ...form, personality: e.target.value })}
                  placeholder="Como ele(a) pensa e reage em situacoes de risco?"
                />
              </div>

              <div className="space-y-2">
                <Label>Comportamento</Label>
                <Textarea
                  value={form.behavior}
                  onChange={(e) => setForm({ ...form, behavior: e.target.value })}
                  placeholder="Como age com aliados, estranhos e inimigos?"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tom de voz</Label>
                  <Input
                    value={form.voice}
                    onChange={(e) => setForm({ ...form, voice: e.target.value })}
                    placeholder="Ex: Calmo, Ironico, Direto"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Alinhamento</Label>
                  <Input
                    value={form.alignment}
                    onChange={(e) => setForm({ ...form, alignment: e.target.value })}
                    placeholder="Ex: Leal e bom, Caotico neutro"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pontos disponiveis</span>
                <span className={pointsLeft < 0 ? 'text-destructive' : 'text-foreground'}>{pointsLeft}</span>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {Object.entries(attributes).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between rounded-lg bg-secondary/40 p-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{attributeLabels[key]}</p>
                      <p className="text-xs text-muted-foreground">Base {BASE_ATTR} ate {MAX_ATTR}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => updateAttribute(key as keyof typeof attributes, -1)}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center text-sm font-semibold text-foreground">{value}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => updateAttribute(key as keyof typeof attributes, 1)}
                        disabled={pointsLeft <= 0}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Historia curta</Label>
                <Textarea
                  value={form.backstory}
                  onChange={(e) => setForm({ ...form, backstory: e.target.value })}
                  placeholder="Conte o passado do personagem em poucas linhas"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Motivacao</Label>
                  <Textarea
                    value={form.motivation}
                    onChange={(e) => setForm({ ...form, motivation: e.target.value })}
                    placeholder="O que move o personagem?"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Medo</Label>
                  <Textarea
                    value={form.fear}
                    onChange={(e) => setForm({ ...form, fear: e.target.value })}
                    placeholder="Qual o maior medo?"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Objetivo</Label>
                <Textarea
                  value={form.goal}
                  onChange={(e) => setForm({ ...form, goal: e.target.value })}
                  placeholder="Qual o objetivo principal?"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-sm">
              <div className="rounded-lg bg-secondary/30 p-4">
                <p className="text-muted-foreground">Nome</p>
                <p className="text-foreground">{form.name || '-'}</p>
              </div>
              <div className="rounded-lg bg-secondary/30 p-4">
                <p className="text-muted-foreground">Raca / Classe</p>
                <p className="text-foreground">{selectedRace?.name || '-'} / {selectedClass?.name || '-'}</p>
              </div>
              <div className="rounded-lg bg-secondary/30 p-4">
                <p className="text-muted-foreground">Atributos</p>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(attributes).map(([key, value]) => (
                    <div key={key} className="rounded bg-secondary/40 px-2 py-1 text-center">
                      <p className="text-[10px] uppercase text-muted-foreground">{attributeLabels[key]}</p>
                      <p className="text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg bg-secondary/30 p-4">
                <p className="text-muted-foreground">Historia</p>
                <p className="text-foreground">{form.backstory || 'Nao informada'}</p>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => (step === 0 ? navigate(`/campaign/${campaignId}`) : setStep(step - 1))}
            >
              {step === 0 ? 'Voltar' : 'Anterior'}
            </Button>
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={() => canNext() && setStep(step + 1)} disabled={!canNext()}>
                Proximo
              </Button>
            ) : (
              <Button type="button" onClick={handleCreate} disabled={loading}>
                {loading ? 'Criando...' : 'Finalizar'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreatePage;
