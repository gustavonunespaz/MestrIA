import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Wand2, Sparkles, Crosshair } from 'lucide-react';
import type { Character } from '@/types/models';
import { api } from '@/services/api';
import { getSocket } from '@/services/socket';
import dmAvatar from '@/assets/dm-avatar.svg';

const DEFAULT_GRID_W = 20;
const DEFAULT_GRID_H = 12;

const TILE_STYLES: Record<string, string> = {
  grass: 'linear-gradient(135deg, rgba(40,130,70,0.7), rgba(25,90,55,0.9))',
  water: 'linear-gradient(135deg, rgba(40,90,160,0.85), rgba(20,50,120,0.95))',
  forest: 'linear-gradient(135deg, rgba(30,110,80,0.85), rgba(15,60,45,0.95))',
  mountain: 'linear-gradient(135deg, rgba(120,120,140,0.85), rgba(70,70,90,0.95))',
  road: 'linear-gradient(135deg, rgba(120,90,50,0.7), rgba(80,60,35,0.9))',
};

type Position = { x: number; y: number };

interface CampaignMapProps {
  campaignId: string;
  characters: Character[];
  myCharacterId?: string | null;
  currentUserId?: string | null;
}

const CampaignMap = ({ campaignId, characters, myCharacterId, currentUserId }: CampaignMapProps) => {
  const queryClient = useQueryClient();
  const generatedRef = useRef(false);
  const [positions, setPositions] = useState<Record<string, Position>>({});
  const [selectedId, setSelectedId] = useState<string | null>(myCharacterId || null);
  const [mapStory, setMapStory] = useState('');
  const [storyLoading, setStoryLoading] = useState(false);
  const [savingPositions, setSavingPositions] = useState(false);

  const { data: mapData, isLoading } = useQuery({
    queryKey: ['map', campaignId],
    queryFn: async () => {
      try {
        return await api.getCampaignMap(campaignId);
      } catch (err: any) {
        if (err?.message?.toLowerCase?.().includes('mapa nao encontrado')) {
          return null;
        }
        throw err;
      }
    },
    retry: false,
  });

  useEffect(() => {
    if (mapData?.gridConfig?.positions) {
      setPositions(mapData.gridConfig.positions as Record<string, Position>);
    }
  }, [mapData]);

  useEffect(() => {
    setSelectedId(myCharacterId || characters[0]?.id || null);
  }, [myCharacterId, characters]);

  useEffect(() => {
    if (isLoading) return;
    if (mapData === null && !generatedRef.current) {
      generatedRef.current = true;
      api.generateCampaignMap(campaignId)
        .then((created) => {
          queryClient.setQueryData(['map', campaignId], created);
        })
        .catch(() => {
          toast.error('Nao foi possivel gerar o mapa.');
        });
    }
  }, [campaignId, isLoading, mapData, queryClient]);

  useEffect(() => {
    const socket = getSocket();
    const handler = (payload: { campaignId: string; payload: any }) => {
      if (payload?.campaignId !== campaignId) return;
      if (payload.payload?.type === 'positions') {
        setPositions(payload.payload.positions || {});
        if (payload.payload.updatedBy && payload.payload.updatedBy !== currentUserId) {
          toast.message('Posicoes do mapa atualizadas por outro jogador.');
        }
      }
      if (payload.payload?.type === 'generated' && payload.payload?.map) {
        queryClient.setQueryData(['map', campaignId], payload.payload.map);
        toast.message('Novo mapa gerado na campanha.');
      }
    };

    socket.on('map-updated', handler);
    return () => {
      socket.off('map-updated', handler);
    };
  }, [campaignId, currentUserId, queryClient]);

  const gridW = mapData?.gridConfig?.width || DEFAULT_GRID_W;
  const gridH = mapData?.gridConfig?.height || DEFAULT_GRID_H;
  const tiles = mapData?.gridConfig?.tiles || [];
  const mapName = mapData?.name || 'Mapa da campanha';

  useEffect(() => {
    if (!mapData) return;
    if (!characters.length) return;
    const next = { ...positions };
    let changed = false;
    characters.forEach((char) => {
      if (next[char.id]) return;
      next[char.id] = {
        x: Math.floor(Math.random() * gridW),
        y: Math.floor(Math.random() * gridH),
      };
      changed = true;
    });
    if (changed) {
      setPositions(next);
      api.updateCampaignMapPositions(campaignId, next).catch(() => {
        toast.error('Nao foi possivel sincronizar novos jogadores no mapa.');
      });
    }
  }, [characters, gridH, gridW, mapData, campaignId, positions]);

  const handleCellClick = (x: number, y: number) => {
    if (!mapData) {
      toast.message('Mapa ainda nao foi gerado.');
      return;
    }
    if (!selectedId) {
      toast.message('Selecione um personagem para mover.');
      return;
    }
    const next = { ...positions, [selectedId]: { x, y } };
    setPositions(next);
    setSavingPositions(true);
    api.updateCampaignMapPositions(campaignId, next)
      .then((updated) => {
        queryClient.setQueryData(['map', campaignId], updated);
      })
      .catch(() => {
        toast.error('Nao foi possivel salvar a posicao.');
      })
      .finally(() => setSavingPositions(false));
  };

  const handleGenerateStory = async () => {
    if (!mapName || !campaignId) return;
    setStoryLoading(true);
    try {
      const response = await api.generateAI(
        campaignId,
        `Crie uma descricao curta e cinematografica para um mapa chamado "${mapName}". Use no maximo 4 frases.`,
        { type: 'narrative' },
      );
      setMapStory(response.content || '');
    } catch (error: any) {
      toast.error(error.message || 'Nao foi possivel gerar a descricao.');
    } finally {
      setStoryLoading(false);
    }
  };

  const handleGenerateMap = async () => {
    try {
      const created = await api.generateCampaignMap(campaignId);
      queryClient.setQueryData(['map', campaignId], created);
      setMapStory('');
      toast.success('Novo mapa gerado!');
    } catch (error: any) {
      toast.error(error.message || 'Nao foi possivel gerar o mapa.');
    }
  };

  if (mapData === null && isLoading) {
    return <p className="text-sm text-muted-foreground">Carregando mapa...</p>;
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex flex-col gap-3 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-sm font-bold text-foreground">Mapa da campanha</h3>
            <p className="text-[11px] text-muted-foreground">{mapName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleGenerateMap}>
              <Wand2 className="mr-2 h-4 w-4" />
              Novo mapa
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedId(myCharacterId || characters[0]?.id || null)}>
              <Crosshair className="mr-2 h-4 w-4" />
              Centralizar
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Movendo:</span>
          <select
            value={selectedId || ''}
            onChange={(e) => setSelectedId(e.target.value || null)}
            className="flex-1 rounded border border-border bg-secondary px-2 py-1 text-xs text-foreground"
          >
            <option value="" disabled>Selecione um personagem</option>
            {characters.map((char) => (
              <option key={char.id} value={char.id}>{char.name}</option>
            ))}
          </select>
        </div>
      </div>

      {mapData?.imageUrl && (
        <div className="shrink-0 overflow-hidden rounded-xl border border-border">
          <img
            src={mapData.imageUrl}
            alt={mapName}
            className="h-[clamp(64px,15vh,96px)] w-full object-cover"
          />
        </div>
      )}

      <div className="relative flex-1 min-h-[clamp(120px,25vh,220px)] overflow-hidden rounded-xl border border-border bg-secondary/30">
        <div
          className="grid h-full w-full"
          style={{ gridTemplateColumns: `repeat(${gridW}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${gridH}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: gridW * gridH }).map((_, index) => (
            <button
              key={`tile-${index}`}
              type="button"
              onClick={() => handleCellClick(index % gridW, Math.floor(index / gridW))}
              className="w-full border border-border/30 transition-transform hover:scale-[1.02]"
              style={{ backgroundImage: TILE_STYLES[tiles[index] || 'grass'] }}
            />
          ))}
        </div>
        <div
          className="absolute inset-0 grid h-full w-full pointer-events-none"
          style={{ gridTemplateColumns: `repeat(${gridW}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${gridH}, minmax(0, 1fr))` }}
        >
          {characters.map((char) => {
            const pos = positions[char.id];
            if (!pos) return null;
            const isSelected = char.id === selectedId;
            return (
              <div
                key={char.id}
                className="flex items-center justify-center"
                style={{ gridColumn: pos.x + 1, gridRow: pos.y + 1 }}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 text-xs font-bold transition-all ${
                    isSelected ? 'border-primary shadow-[0_0_10px_rgba(79,145,255,0.6)]' : 'border-border'
                  }`}
                >
                  {char.avatarUrl ? (
                    <img src={char.avatarUrl} alt={char.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-foreground">{char.name.charAt(0)}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-h-[clamp(120px,30vh,220px)] space-y-3 overflow-y-auto pr-1">
        <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
          <span>Jogadores: {characters.length}</span>
          <span>{savingPositions ? 'Salvando posicao...' : `Selecao: ${selectedId ? characters.find((c) => c.id === selectedId)?.name : 'Nenhum'}`}</span>
        </div>

        <div className="rounded-lg border border-border bg-secondary/20 p-3">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Narrativa do mapa
            </h4>
            <Button size="sm" variant="outline" disabled={storyLoading} onClick={handleGenerateStory}>
              Gerar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {storyLoading ? 'Invocando a narrativa...' : mapStory || 'Crie uma descricao rapida para ajudar a imersao.'}
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-lg bg-secondary/20 p-3">
          <img src={dmAvatar} alt="Mestre" className="h-10 w-10" />
          <div>
            <p className="text-xs font-semibold text-foreground">Mestre da campanha</p>
            <p className="text-[11px] text-muted-foreground">Presenca observando o tabuleiro.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignMap;
