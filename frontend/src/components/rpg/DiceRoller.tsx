import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dices } from 'lucide-react';

const DICE_OPTIONS = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

interface RollResult {
  dice: string;
  rolls: number[];
  total: number;
}

const DiceRoller = () => {
  const [results, setResults] = useState<RollResult[]>([]);
  const [quantity, setQuantity] = useState(1);

  const rollDice = (dice: string) => {
    const sides = parseInt(dice.slice(1));
    const rolls = Array.from({ length: quantity }, () => Math.floor(Math.random() * sides) + 1);
    const total = rolls.reduce((a, b) => a + b, 0);
    setResults((prev) => [{ dice: `${quantity}${dice}`, rolls, total }, ...prev].slice(0, 10));
  };

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
        <Dices className="h-4 w-4 text-primary" />
        Rolagem de Dados
      </h3>

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
              <span className="text-xs text-muted-foreground">{r.dice}</span>
              <span className="text-xs text-muted-foreground">[{r.rolls.join(', ')}]</span>
              <span className="text-sm font-bold text-primary">{r.total}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiceRoller;
