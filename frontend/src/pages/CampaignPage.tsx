import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { getSocket } from '@/services/socket';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import CharacterSheet from '@/components/rpg/CharacterSheet';
import DiceRoller from '@/components/rpg/DiceRoller';
import CampaignMap from '@/components/rpg/CampaignMap';
import AmbientSoundscape from '@/components/rpg/AmbientSoundscape';
import { CreateCharacterDialog } from '@/components/CreateCharacterDialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  ArrowLeft, Send, Users, ScrollText, Dices, MapIcon, Loader2, Sparkles, Copy, Music, RotateCcw,
} from 'lucide-react';
import type { Message, Character } from '@/types/models';

type RightTab = 'character' | 'members' | 'ambience';

const CampaignPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [startingStory, setStartingStory] = useState(false);
  const [rightTab, setRightTab] = useState<RightTab>('character');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [resettingParty, setResettingParty] = useState(false);

  const { data: campaign } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => api.getCampaign(id!),
    enabled: !!id,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', id],
    queryFn: () => api.getMessages(id!),
    enabled: !!id,
    refetchInterval: false,
  });

  const { data: characters = [], isLoading: charactersLoading } = useQuery({
    queryKey: ['characters', id],
    queryFn: () => api.getCharacters(id!),
    enabled: !!id,
  });

  const { data: races = [] } = useQuery({
    queryKey: ['races'],
    queryFn: api.getRaces,
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: api.getClasses,
  });

  const raceMap = useMemo(() => new Map(races.map((r) => [r.id, r])), [races]);
  const classMap = useMemo(() => new Map(classes.map((c) => [c.id, c])), [classes]);
  const charactersWithRefs = useMemo(
    () =>
      characters.map((char) => ({
        ...char,
        race: raceMap.get(char.raceId),
        class: classMap.get(char.classId),
      })),
    [characters, raceMap, classMap],
  );

  const myCharacter = useMemo(
    () => charactersWithRefs.find((char) => char.userId === user?.id) || null,
    [charactersWithRefs, user],
  );

  const storyStarted = useMemo(
    () => messages.some((msg) => msg.senderRole === 'AI_DM'),
    [messages],
  );

  // Select first user character by default
  useEffect(() => {
    if (charactersWithRefs.length && !selectedCharacter) {
      const mine = charactersWithRefs.find(c => c.userId === user?.id) || charactersWithRefs[0];
      setSelectedCharacter(mine);
    }
  }, [charactersWithRefs, user, selectedCharacter]);

  useEffect(() => {
    if (!selectedCharacter) return;
    const updated = charactersWithRefs.find((c) => c.id === selectedCharacter.id);
    if (updated && updated !== selectedCharacter) {
      setSelectedCharacter(updated);
    }
  }, [charactersWithRefs, selectedCharacter]);

  // Require character before playing
  useEffect(() => {
    if (!id || charactersLoading) return;
    if (!user?.id) return;
    if (!myCharacter) {
      toast.message('Crie seu personagem antes de iniciar a aventura.');
      navigate(`/campaign/${id}/character/create`);
    }
  }, [id, charactersLoading, myCharacter, navigate, user]);

  // Socket.IO real-time
  useEffect(() => {
    if (!id) return;
    const socket = getSocket();
    if (user?.id) {
      socket.emit('join-campaign', { campaignId: id, userId: user.id });
    }

    socket.on('new-message', (msg: Message) => {
      queryClient.setQueryData<Message[]>(['messages', id], (old) => [...(old || []), msg]);
      if (msg.senderId !== user?.id && (msg.senderRole === 'AI_DM' || msg.senderRole === 'HUMAN_DM')) {
        toast.message(`Mestre: ${msg.content.slice(0, 80)}${msg.content.length > 80 ? '...' : ''}`);
      }
    });

    socket.on('user-joined', (payload: { userId: string; campaignId: string }) => {
      if (payload.campaignId === id && payload.userId !== user?.id) {
        toast.message('Novo jogador entrou na campanha.');
      }
    });

    return () => {
      socket.off('new-message');
      socket.off('user-joined');
    };
  }, [id, queryClient, user]);

  // Auto scroll
  useEffect(() => {
    if (autoScroll) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  useEffect(() => {
    const settingsRaw = localStorage.getItem('mestria_settings');
    if (!settingsRaw) return;
    try {
      const parsed = JSON.parse(settingsRaw);
      if (parsed?.autoScrollChat !== undefined) {
        setAutoScroll(Boolean(parsed.autoScrollChat));
      }
      if (parsed?.showTimestamps !== undefined) {
        setShowTimestamps(Boolean(parsed.showTimestamps));
      }
    } catch {
      // ignore invalid settings
    }
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !id) return;
    setSending(true);
    try {
      const userMessage = message.trim();
      await api.sendMessage(id, userMessage, { senderRole: 'USER' });
      setMessage('');
      await queryClient.invalidateQueries({ queryKey: ['messages', id] });

      if (campaign?.dmType === 'AI') {
        const ai = await api.generateAI(id, userMessage, { characterId: selectedCharacter?.id || null });
        if (!ai?.content) {
          throw new Error('IA nao retornou resposta');
        }
        await api.sendMessage(id, ai.content, { senderRole: 'AI_DM' });
        await queryClient.invalidateQueries({ queryKey: ['messages', id] });
      }
    } catch {
      toast.error('Falha ao enviar mensagem para a IA.');
    } finally {
      setSending(false);
    }
  };

  const handleStartStory = async () => {
    if (!id || startingStory) return;
    setStartingStory(true);
    try {
      const prompt = `Kara, inicie a historia desta campanha como Mestra narradora. Comece pela cena inicial e introduza o tom, o lugar e a primeira situacao.`;
      const ai = await api.generateAI(id, prompt, { characterId: selectedCharacter?.id || null, type: 'narrative' });
      if (!ai?.content) {
        throw new Error('IA nao retornou resposta');
      }
      await api.sendMessage(id, ai.content, { senderRole: 'AI_DM' });
      await queryClient.invalidateQueries({ queryKey: ['messages', id] });
      toast.success('Historia iniciada por Kara.');
    } catch {
      toast.error('Falha ao iniciar a historia.');
    } finally {
      setStartingStory(false);
    }
  };

  const isDM = (role?: string) => role === 'AI_DM' || role === 'HUMAN_DM';
  const getDMLabel = (role?: string) => (role === 'AI_DM' ? '🎭 Kara' : '🎭 Mestre');
  const normalizeText = (value: string) => value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const isRollRequest = (content?: string) => {
    if (!content) return false;
    const text = normalizeText(content);
    return text.includes('[rolagem]');
  };
  const getCharacterNameForMessage = (msg: Message) => {
    if (isDM(msg.senderRole)) return getDMLabel(msg.senderRole);
    const character = charactersWithRefs.find((char) => char.userId === msg.senderId);
    return character?.name || msg.sender?.name || 'Personagem';
  };

  const isHumanDMUser = campaign?.dmType === 'HUMAN' && campaign?.creatorId === user?.id;
  const diceLock = useMemo(() => {
    if (isHumanDMUser) {
      return { locked: false, reason: '', enabledReason: 'Rolagem sempre liberada para a Mestra.' };
    }

    let lastRequestIndex = -1;
    messages.forEach((msg, index) => {
      if (isDM(msg.senderRole) && isRollRequest(msg.content)) {
        lastRequestIndex = index;
      }
    });

    if (lastRequestIndex === -1) {
      return { locked: true, reason: 'Aguarde a Mestra pedir a rolagem com [ROLAGEM].', enabledReason: '' };
    }

    const hasRollAfterRequest = messages.slice(lastRequestIndex + 1).some((msg) => Boolean(msg.diceRoll));
    if (hasRollAfterRequest) {
      return { locked: true, reason: 'A rolagem ja foi feita. Aguarde nova solicitacao da Mestra com [ROLAGEM].', enabledReason: '' };
    }

    return { locked: false, reason: '', enabledReason: 'Rolagem liberada pela Mestra. Role agora.' };
  }, [messages, isHumanDMUser, isDM, isRollRequest]);

  const handleCopyInvite = async () => {
    if (!campaign?.inviteCode) return;
    try {
      await navigator.clipboard.writeText(campaign.inviteCode);
      toast.success('Codigo de convite copiado!');
    } catch {
      toast.error('Nao foi possivel copiar o codigo.');
    }
  };

  const handleRoll = async (result: { dice: string; rolls: number[]; total: number; mode?: string; rawRolls?: number[]; modifier?: number; label?: string }) => {
    if (!id) return;
    try {
      const label = result.label ? `${result.label} ` : '';
      const content = `${label}rolou ${result.dice}: [${result.rolls.join(', ')}] = ${result.total}`;
      await api.sendMessage(id, content, {
        senderRole: 'USER',
        diceRoll: {
          dice: result.dice,
          rolls: result.rolls,
          total: result.total,
          mode: result.mode,
          rawRolls: result.rawRolls,
          modifier: result.modifier,
          label: result.label,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ['messages', id] });
    } catch {
      toast.error('Nao foi possivel enviar o resultado para o chat.');
    }
  };

  const tabItems: { key: RightTab; icon: typeof ScrollText; label: string }[] = [
    { key: 'character', icon: ScrollText, label: 'Ficha' },
    { key: 'ambience', icon: Music, label: 'Som' },
    { key: 'members', icon: Users, label: 'Grupo' },
  ];

  const isCampaignCreator = campaign?.creatorId === user?.id;

  const handleResetParty = async () => {
    if (!id || resettingParty) return;
    const confirmed = window.confirm(
      'Isso vai resetar o estado da party (HP, status e posicoes no mapa), sem apagar personagens ou historia. Deseja continuar?',
    );
    if (!confirmed) return;
    setResettingParty(true);
    try {
      await api.resetPartyState(id);
      await queryClient.invalidateQueries({ queryKey: ['characters', id] });
      await queryClient.invalidateQueries({ queryKey: ['map', id] });
      toast.success('Estado da party resetado.');
    } catch {
      toast.error('Nao foi possivel resetar o estado da party.');
    } finally {
      setResettingParty(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background lg:h-screen lg:flex-row">
      {/* Left Column (Avatares + Dados + Mapa) */}
      <div className="flex flex-col border-b border-border lg:flex-row lg:border-b-0 lg:border-r">
        <div className="glass-panel flex w-full flex-row items-center gap-4 overflow-x-auto border-b border-border px-4 py-4 lg:w-16 lg:flex-col lg:border-b-0 lg:border-r lg:px-0">
          <button onClick={() => navigate('/')} className="text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="my-2 h-px w-8 bg-border lg:my-2" />
          {charactersWithRefs.map((char) => (
            <button
              key={char.id}
              onClick={() => setSelectedCharacter(char)}
              title={char.name}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition-all ${
                selectedCharacter?.id === char.id
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary/50'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {char.avatarUrl ? (
                <img src={char.avatarUrl} alt={char.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                char.name.charAt(0).toUpperCase()
              )}
            </button>
          ))}
        </div>
        <div className="glass-panel flex w-full flex-col lg:w-[420px]">
          <div className="max-h-[38vh] overflow-y-auto border-b border-border p-4">
            <DiceRoller
              onRoll={handleRoll}
              disabled={diceLock.locked}
              disabledReason={diceLock.reason}
              enabledReason={diceLock.enabledReason}
              abilityScores={{
                strength: Number.isFinite(Number(selectedCharacter?.attributes?.strength)) ? Number(selectedCharacter?.attributes?.strength) : undefined,
                dexterity: Number.isFinite(Number(selectedCharacter?.attributes?.dexterity)) ? Number(selectedCharacter?.attributes?.dexterity) : undefined,
                constitution: Number.isFinite(Number(selectedCharacter?.attributes?.constitution)) ? Number(selectedCharacter?.attributes?.constitution) : undefined,
                intelligence: Number.isFinite(Number(selectedCharacter?.attributes?.intelligence)) ? Number(selectedCharacter?.attributes?.intelligence) : undefined,
                wisdom: Number.isFinite(Number(selectedCharacter?.attributes?.wisdom)) ? Number(selectedCharacter?.attributes?.wisdom) : undefined,
                charisma: Number.isFinite(Number(selectedCharacter?.attributes?.charisma)) ? Number(selectedCharacter?.attributes?.charisma) : undefined,
              }}
            />
          </div>
          <div className="flex-1 min-h-0 overflow-hidden p-4">
            <CampaignMap
              campaignId={id!}
              characters={charactersWithRefs}
              myCharacterId={myCharacter?.id}
              currentUserId={user?.id}
            />
          </div>
        </div>
      </div>

      {/* Center - Chat */}
      <div className="flex flex-1 flex-col">
        {/* Campaign Header */}
        <div className="glass-panel flex items-center gap-3 border-b border-border px-6 py-3">
          <MapIcon className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">{campaign?.title || 'Carregando...'}</h2>
            <span className="text-xs text-muted-foreground">{campaign?.systemBase}</span>
          </div>
          {campaign?.inviteCode && (
            <button
              onClick={handleCopyInvite}
              className="ml-4 flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Copy className="h-3.5 w-3.5" />
              {campaign.inviteCode}
            </button>
          )}
          {campaign?.dmType === 'AI' && (
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={handleStartStory}
                disabled={startingStory || storyStarted}
                className="flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-60"
              >
                {startingStory ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                {storyStarted ? 'Historia iniciada' : 'Iniciar historia'}
              </button>
              <span className="flex items-center gap-1 rounded-full bg-accent/15 px-3 py-1 text-xs text-accent">
                <Sparkles className="h-3 w-3" /> IA Narradora
              </span>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id || i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-4 rounded-lg p-4 ${
                  isDM(msg.senderRole)
                    ? 'dm-message'
                    : msg.senderRole === 'SYSTEM'
                    ? 'border border-border bg-secondary/30 text-center text-sm italic text-muted-foreground'
                    : 'bg-secondary/50'
                }`}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className={`text-sm font-semibold ${isDM(msg.senderRole) ? 'text-accent' : 'text-primary'}`}>
                    {getCharacterNameForMessage(msg)}
                  </span>
                  {showTimestamps && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <div className="prose prose-sm prose-invert max-w-none text-foreground">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                {msg.diceRoll && (
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-sm">
                    <Dices className="h-4 w-4 text-primary" />
                    <span className="text-foreground">
                      {(msg.diceRoll as any)?.dice}: <strong>{(msg.diceRoll as any)?.total}</strong>
                    </span>
                    {(msg.diceRoll as any)?.rolls && (
                      <span className="text-xs text-muted-foreground">
                        [{(msg.diceRoll as any)?.rolls?.join(', ')}]
                        {(msg.diceRoll as any)?.rawRolls ? ` (${(msg.diceRoll as any)?.rawRolls?.join(', ')})` : ''}
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="glass-panel flex items-center gap-3 border-t border-border px-6 py-4">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua ação ou mensagem..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            type="submit"
            disabled={sending || !message.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      </div>

      {/* Right Sidebar */}
      <div className="glass-panel flex w-full flex-col border-t border-border lg:w-80 lg:border-l lg:border-t-0">
        {/* Tabs */}
        <div className="flex border-b border-border">
          {tabItems.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setRightTab(key)}
              className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${
                rightTab === key ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="scrollbar-thin flex-1 overflow-y-auto p-4">
          {rightTab === 'character' && selectedCharacter && (
            <CharacterSheet character={selectedCharacter} />
          )}
          {rightTab === 'character' && !selectedCharacter && (
            <p className="text-center text-sm text-muted-foreground">Nenhum personagem selecionado</p>
          )}
          {rightTab === 'ambience' && <AmbientSoundscape />}
          {rightTab === 'members' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-sm font-bold text-foreground">Membros do Grupo</h3>
                <div className="flex items-center gap-2">
                  {isCampaignCreator && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleResetParty}
                      disabled={resettingParty}
                    >
                      <RotateCcw className="h-4 w-4" />
                      {resettingParty ? 'Resetando...' : 'Resetar party'}
                    </Button>
                  )}
                  <CreateCharacterDialog campaignId={id!} />
                </div>
              </div>
              {charactersWithRefs.map((char) => (
                <div key={char.id} className="flex items-center gap-3 rounded-lg bg-secondary/40 p-3">
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary/20 text-xs font-bold text-primary">
                    {char.avatarUrl ? (
                      <img src={char.avatarUrl} alt={char.name} className="h-full w-full object-cover" />
                    ) : (
                      char.name.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{char.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Nv. {char.level} • {char.race?.name} {char.class?.name}
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    <span className={char.hpCurrent > char.hpMax * 0.3 ? 'text-green-400' : 'text-destructive'}>
                      {char.hpCurrent}/{char.hpMax} HP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignPage;
