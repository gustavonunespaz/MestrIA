import { StringUtils } from './index';

const MAP_NAMES = [
  'Bosque da Lua Azul',
  'Ruinas de Eldor',
  'Passagem das Brumas',
  'Vale da Cinza',
  'Fortaleza Abissal',
  'Trilha dos Druidas',
  'Planicie Rubra',
  'Templo do Eco',
  'Fenda de Aether',
  'Porto das Sombras',
];

const TILE_TYPES = ['grass', 'water', 'forest', 'mountain', 'road'] as const;

const TILE_COLORS: Record<string, string> = {
  grass: '#2f7d4a',
  water: '#2b5ca8',
  forest: '#1f6b4f',
  mountain: '#7d7d8c',
  road: '#8a6a3f',
};

const mulberry32 = (seed: number) => () => {
  let t = seed += 0x6D2B79F5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const toSeed = (input: string) => {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return h >>> 0;
};

export interface GeneratedMap {
  id: string;
  name: string;
  imageUrl: string;
  gridConfig: Record<string, any>;
  campaignId: string;
}

export function generateMap(campaignId: string, width = 20, height = 12): GeneratedMap {
  const seed = toSeed(`${campaignId}-${Date.now()}`);
  const rng = mulberry32(seed);
  const name = MAP_NAMES[Math.floor(rng() * MAP_NAMES.length)];

  const tiles: string[] = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const roll = rng();
      let type = 'grass';
      if (roll < 0.12) type = 'water';
      else if (roll < 0.3) type = 'forest';
      else if (roll < 0.4) type = 'mountain';
      else if (roll < 0.5) type = 'road';
      tiles.push(type);
    }
  }

  const tileSize = 24;
  const svgWidth = width * tileSize;
  const svgHeight = height * tileSize;
  const rects = tiles
    .map((tile, index) => {
      const x = (index % width) * tileSize;
      const y = Math.floor(index / width) * tileSize;
      const color = TILE_COLORS[tile] || TILE_COLORS.grass;
      return `<rect x="${x}" y="${y}" width="${tileSize}" height="${tileSize}" fill="${color}" />`;
    })
    .join('');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
  <rect width="100%" height="100%" fill="#111827" />
  ${rects}
  <rect width="100%" height="100%" fill="none" stroke="#1f2937" stroke-width="1" />
</svg>`;

  const imageUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  return {
    id: StringUtils.generateId(),
    name,
    imageUrl,
    gridConfig: {
      seed,
      width,
      height,
      tiles,
      positions: {},
    },
    campaignId,
  };
}
