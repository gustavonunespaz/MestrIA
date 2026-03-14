import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Music2 } from 'lucide-react';

const MOODS = {
  forest: { label: 'Floresta', base: 110, filter: 900 },
  dungeon: { label: 'Masmorra', base: 70, filter: 500 },
  tavern: { label: 'Taverna', base: 140, filter: 1200 },
};

type MoodKey = keyof typeof MOODS;

const AmbientSoundscape = () => {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [mood, setMood] = useState<MoodKey>('forest');

  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);

  const start = () => {
    if (playing) return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    const moodConfig = MOODS[mood];
    osc.type = 'sine';
    osc.frequency.value = moodConfig.base;
    filter.type = 'lowpass';
    filter.frequency.value = moodConfig.filter;
    gain.gain.value = volume;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    ctxRef.current = ctx;
    oscRef.current = osc;
    gainRef.current = gain;
    filterRef.current = filter;
    setPlaying(true);
  };

  const stop = () => {
    if (!playing) return;
    oscRef.current?.stop();
    oscRef.current?.disconnect();
    gainRef.current?.disconnect();
    filterRef.current?.disconnect();
    ctxRef.current?.close();
    ctxRef.current = null;
    oscRef.current = null;
    gainRef.current = null;
    filterRef.current = null;
    setPlaying(false);
  };

  useEffect(() => {
    if (!playing) return;
    if (oscRef.current) {
      oscRef.current.frequency.value = MOODS[mood].base;
    }
    if (filterRef.current) {
      filterRef.current.frequency.value = MOODS[mood].filter;
    }
  }, [mood, playing]);

  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = volume;
    }
  }, [volume]);

  useEffect(() => () => stop(), []);

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
        <Music2 className="h-4 w-4 text-primary" />
        Ambiencia sonora
      </h3>

      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Clima</label>
        <select
          value={mood}
          onChange={(e) => setMood(e.target.value as MoodKey)}
          className="w-full rounded border border-border bg-secondary px-2 py-2 text-xs text-foreground"
        >
          {Object.entries(MOODS).map(([key, value]) => (
            <option key={key} value={key}>{value.label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Volume</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="flex items-center gap-2">
        {playing ? (
          <Button variant="outline" onClick={stop} className="flex-1">
            <VolumeX className="mr-2 h-4 w-4" />
            Parar
          </Button>
        ) : (
          <Button onClick={start} className="flex-1">
            <Volume2 className="mr-2 h-4 w-4" />
            Tocar
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Dica: use fones para aumentar a imersao e combinar com o mapa.
      </p>
    </div>
  );
};

export default AmbientSoundscape;
