import { motion } from 'framer-motion';
import { Heart, Shield, Swords, Star, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { Character } from '@/types/models';

interface Props {
  character: Character;
}

const ATTR_LABELS: Record<string, string> = {
  strength: 'Força',
  dexterity: 'Destreza',
  constitution: 'Constituição',
  intelligence: 'Inteligência',
  wisdom: 'Sabedoria',
  charisma: 'Carisma',
  str: 'Força',
  dex: 'Destreza',
  con: 'Constituição',
  int: 'Inteligência',
  wis: 'Sabedoria',
  cha: 'Carisma',
};

const getModifier = (val: number) => {
  const mod = Math.floor((val - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
};

const CollapsibleSection = ({ title, icon: Icon, children }: { title: string; icon: typeof Star; children: React.ReactNode }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="mb-2 flex w-full items-center gap-2 text-sm font-semibold text-foreground"
      >
        <Icon className="h-4 w-4 text-primary" />
        {title}
        {open ? <ChevronDown className="ml-auto h-3 w-3 text-muted-foreground" /> : <ChevronRight className="ml-auto h-3 w-3 text-muted-foreground" />}
      </button>
      {open && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{children}</motion.div>}
    </div>
  );
};

const CharacterSheet = ({ character }: Props) => {
  const hpPercent = (character.hpCurrent / character.hpMax) * 100;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-primary/20 text-2xl font-bold text-primary">
          {character.avatarUrl ? (
            <img src={character.avatarUrl} alt={character.name} className="h-full w-full object-cover" />
          ) : (
            character.name.charAt(0)
          )}
        </div>
        <h3 className="font-display text-xl font-bold text-foreground">{character.name}</h3>
        <p className="text-xs text-muted-foreground">
          Nv. {character.level} • {character.race?.name || 'Raça'} • {character.class?.name || 'Classe'}
        </p>
      </div>

      {/* HP Bar */}
      <div className="rounded-lg bg-secondary/50 p-3">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Heart className="h-3 w-3" /> Pontos de Vida
          </span>
          <span className="font-medium text-foreground">{character.hpCurrent} / {character.hpMax}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${hpPercent}%` }}
            className={`h-full rounded-full ${hpPercent > 50 ? 'bg-green-500' : hpPercent > 25 ? 'bg-accent' : 'bg-destructive'}`}
          />
        </div>
      </div>

      {/* Attributes */}
      <CollapsibleSection title="Atributos" icon={Shield}>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(character.attributes)
            .filter(([, val]) => typeof val === 'number')
            .map(([key, val]) => (
            <div key={key} className="rounded-lg bg-secondary/40 p-2 text-center">
              <p className="text-[10px] uppercase text-muted-foreground">{ATTR_LABELS[key.toLowerCase()] || key}</p>
              <p className="text-lg font-bold text-foreground">{val as number}</p>
              <p className="text-xs text-primary">{getModifier(val as number)}</p>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Items */}
      {character.items && character.items.length > 0 && (
        <CollapsibleSection title="Inventário" icon={Swords}>
          <div className="space-y-1.5">
            {character.items.map((ci) => (
              <div key={ci.id} className="flex items-center justify-between rounded bg-secondary/30 px-3 py-2 text-sm">
                <span className="text-foreground">{ci.item.name}</span>
                <span className="text-xs text-muted-foreground capitalize">{ci.item.type}</span>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Spells */}
      {character.spells && character.spells.length > 0 && (
        <CollapsibleSection title="Magias" icon={Star}>
          <div className="space-y-1.5">
            {character.spells.map((cs) => (
              <div key={cs.id} className="rounded bg-secondary/30 px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{cs.spell.name}</span>
                  <span className="text-xs text-accent">Nv. {cs.spell.level}</span>
                </div>
                {cs.spell.school && <p className="text-xs text-muted-foreground">{cs.spell.school}</p>}
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
};

export default CharacterSheet;
