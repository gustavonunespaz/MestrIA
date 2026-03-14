import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Dices } from 'lucide-react';
import { toast } from 'sonner';

const DICE_OPTIONS = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

type RollMode = 'normal' | 'advantage' | 'disadvantage';

interface RollResult {
  dice: string;
  rolls: number[];
  total: number;
  mode?: RollMode;
  rawRolls?: number[];
  modifier?: number;
  label?: string;
}

interface DiceRollerProps {
  onRoll?: (result: RollResult) => void;
  abilityScores?: Partial<Record<'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma', number>>;
  disabled?: boolean;
  disabledReason?: string;
  enabledReason?: string;
}

const DiceRoller = ({
  onRoll,
  abilityScores = {},
  disabled = false,
  disabledReason,
  enabledReason,
}: DiceRollerProps) => {
  const [results, setResults] = useState<RollResult[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [mode, setMode] = useState<RollMode>('normal');

  const abilityMods = useMemo(() => {
    const entries = Object.entries(abilityScores) as Array<[keyof typeof abilityScores, number]>;
    return entries.reduce((acc, [key, val]) => {
      if (typeof val !== 'number' || !Number.isFinite(val)) return acc;
      acc[key] = Math.floor((val - 10) / 2);
      return acc;
    }, {} as Record<string, number>);
  }, [abilityScores]);

  const playDiceSound = () => {
    try {
      const settingsRaw = localStorage.getItem('mestria_settings');
      if (settingsRaw) {
        const parsed = JSON.parse(settingsRaw);
        if (parsed?.diceSounds === false) return;
      }
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = 320 + Math.random() * 120;
      gain.gain.value = 0.06;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
      osc.onended = () => ctx.close();
    } catch {
      // ignore audio errors
    }
  };

  const showBlockedToast = () => {
    toast.message(disabledReason || 'Rolagem bloqueada. Aguarde a Mestra liberar.');
  };

  const rollDice = (dice: string, modifier = 0, label?: string) => {
    if (disabled) {
      showBlockedToast();
      return;
    }
    const sides = parseInt(dice.slice(1));
    let rolls = Array.from({ length: quantity }, () => Math.floor(Math.random() * sides) + 1);
    let rawRolls: number[] | undefined;

    if (dice === 'd20' && mode !== 'normal' && quantity === 1) {
      const a = Math.floor(Math.random() * sides) + 1;
      const b = Math.floor(Math.random() * sides) + 1;
      rawRolls = [a, b];
      const selected = mode === 'advantage' ? Math.max(a, b) : Math.min(a, b);
      rolls = [selected];
    }

    const total = rolls.reduce((a, b) => a + b, 0) + modifier;
    const labelSuffix = modifier !== 0 ? `${modifier > 0 ? '+' : ''}${modifier}` : '';
    const result: RollResult = {
      dice: `${quantity}${dice}${labelSuffix}`,
      rolls,
      total,
      mode,
      rawRolls,
      modifier,
      label,
    };
    setResults((prev) => [result, ...prev].slice(0, 10));
    playDiceSound();
    if (dice === 'd20' && quantity === 1) {
      const rolled = rolls[0];
      if (rolled === 20) toast.success('Acerto critico!');
      if (rolled === 1) toast.error('Falha critica.');
    }
    onRoll?.(result);
  };

  return (
    <div className={`space-y-4 ${disabled ? 'opacity-70' : ''}`}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
          <Dices className="h-4 w-4 text-primary" />
          Rolagem de Dados
        </h3>
        <span
          className={`text-[10px] font-semibold uppercase tracking-wide ${
            disabled ? 'text-muted-foreground' : 'text-accent'
          }`}
        >
          {disabled ? 'Bloqueado' : 'Liberado'}
        </span>
      </div>
      {disabled && (
        <p className="text-[11px] text-muted-foreground">
          {disabledReason || 'Aguarde a Mestra liberar a rolagem.'}
        </p>
      )}
      {!disabled && (
        <p className="text-[11px] text-muted-foreground">
          {enabledReason || 'Rolagem liberada pela Mestra.'}
        </p>
      )}

      <div className="flex items-center gap-2">
        <label className="text-xs text-muted-foreground">Qtd:</label>
        <select
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="rounded border border-border bg-secondary px-2 py-1 text-xs text-foreground"
        >
          {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
          <button
            type="button"
            onClick={() => setMode('normal')}
            className={`rounded-full px-2 py-1 ${mode === 'normal' ? 'bg-primary/20 text-primary' : 'bg-secondary/40'}`}
          >
            Normal
          </button>
          <button
            type="button"
            onClick={() => setMode('advantage')}
            className={`rounded-full px-2 py-1 ${mode === 'advantage' ? 'bg-primary/20 text-primary' : 'bg-secondary/40'}`}
          >
            Vantagem
          </button>
          <button
            type="button"
            onClick={() => setMode('disadvantage')}
            className={`rounded-full px-2 py-1 ${mode === 'disadvantage' ? 'bg-primary/20 text-primary' : 'bg-secondary/40'}`}
          >
            Desvantagem
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { key: 'strength', label: 'Forca' },
          { key: 'dexterity', label: 'Destreza' },
          { key: 'constitution', label: 'Constituicao' },
          { key: 'intelligence', label: 'Inteligencia' },
          { key: 'wisdom', label: 'Sabedoria' },
          { key: 'charisma', label: 'Carisma' },
        ].map((ability) => (
          <button
            key={ability.key}
            type="button"
            onClick={() => rollDice('d20', abilityMods[ability.key] || 0, ability.label)}
            className="rounded-lg bg-secondary/40 px-2 py-2 text-xs font-medium text-foreground transition-all hover:bg-primary/20 hover:text-primary"
          >
            {ability.label} {abilityMods[ability.key] ? `${abilityMods[ability.key] > 0 ? '+' : ''}${abilityMods[ability.key]}` : ''}
          </button>
        ))}
        <button
          type="button"
          onClick={() => rollDice('d20', abilityMods.dexterity || 0, 'Iniciativa')}
          className="col-span-3 rounded-lg bg-secondary/30 px-2 py-2 text-xs font-medium text-foreground transition-all hover:bg-primary/20 hover:text-primary"
        >
          Iniciativa {abilityMods.dexterity ? `${abilityMods.dexterity > 0 ? '+' : ''}${abilityMods.dexterity}` : ''}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {DICE_OPTIONS.map((dice) => (
          <button
            key={dice}
            onClick={() => rollDice(dice)}
            className="rounded-lg bg-secondary/60 px-3 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-primary/20 hover:text-primary active:scale-95"
          >
            {dice}
          </button>
        ))}
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Resultados</p>
          {results.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2"
            >
              <span className="text-xs text-muted-foreground">{r.label ? `${r.label} • ${r.dice}` : r.dice}</span>
              <span className="text-xs text-muted-foreground">
                [{r.rolls.join(', ')}]{r.rawRolls ? ` (${r.rawRolls.join(', ')})` : ''}
              </span>
              <span className="text-sm font-bold text-primary">{r.total}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiceRoller;
