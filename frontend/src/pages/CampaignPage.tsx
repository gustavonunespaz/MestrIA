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
import { CreateCharacterDialog } from '@/components/CreateCharacterDialog';
import { SessionList } from '@/components/SessionList';
import { toast } from 'sonner';
import {
  ArrowLeft, Send, Users, ScrollText, Dices, MapIcon, Loader2, Sparkles,
} from 'lucide-react';
import type { Message, Character } from '@/types/models';

type RightTab = 'character' | 'dice' | 'members';

const CampaignPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [rightTab, setRightTab] = useState<RightTab>('character');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

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
    });

    return () => {
      socket.off('new-message');
    };
  }, [id, queryClient, user]);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const isDM = (role?: string) => role === 'AI_DM' || role === 'HUMAN_DM';

  const tabItems: { key: RightTab; icon: typeof ScrollText; label: string }[] = [
    { key: 'character', icon: ScrollText, label: 'Ficha' },
    { key: 'dice', icon: Dices, label: 'Dados' },
    { key: 'members', icon: Users, label: 'Grupo' },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <div className="glass-panel flex w-16 flex-col items-center gap-4 border-r border-border py-4">
        <button onClick={() => navigate('/')} className="text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="my-2 h-px w-8 bg-border" />
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
            {char.name.charAt(0).toUpperCase()}
          </button>
        ))}
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
          {campaign?.dmType === 'AI' && (
            <span className="ml-auto flex items-center gap-1 rounded-full bg-accent/15 px-3 py-1 text-xs text-accent">
              <Sparkles className="h-3 w-3" /> IA Narradora
            </span>
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
                    {isDM(msg.senderRole) ? '🎭 Narrador' : msg.sender?.name || 'Aventureiro'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="prose prose-sm prose-invert max-w-none text-foreground">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                {msg.diceRoll && (
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-sm">
                    <Dices className="h-4 w-4 text-primary" />
                    <span className="text-foreground">{msg.diceRoll.dice}: <strong>{msg.diceRoll.total}</strong></span>
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
      <div className="glass-panel flex w-80 flex-col border-l border-border">
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
          {rightTab === 'dice' && <DiceRoller />}
          {rightTab === 'members' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-foreground">Membros do Grupo</h3>
                <CreateCharacterDialog campaignId={id!} />
              </div>
              {charactersWithRefs.map((char) => (
                <div key={char.id} className="flex items-center gap-3 rounded-lg bg-secondary/40 p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                    {char.name.charAt(0)}
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
