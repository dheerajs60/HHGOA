import type { BeachBagItem, DeterministicResult } from '../types/generator';

// DJB2 Hash function for fast deterministic string hashing
export function djb2Hash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash >>> 0);
}

// Curated Builder Classes matching HH Goa vibe
const BUILDER_CLASSES = [
  'Terminal Wizard',
  'Pixel Alchemist',
  'API Whisperer',
  'Async Custodian',
  'Ship Sorcerer',
  'Kernel Nomad',
  'Prompt Maestro',
  'Full-Stack Sailor',
  'Byte Falconer',
  'Infra Shaman',
  'Zero-Latency Oracle',
  'Distributed Druid',
  'GPU Tamer',
  'Query Juggler',
  'State Machine Shaman',
  'Refactor Samurai',
  'Sub-Second Pioneer',
  'Consensus Alchemist',
];

const GATES = [
  'GATE 03',
  'GATE 07',
  'GATE 09',
  'GATE 12',
  'GATE 14',
  'GATE 21',
  'GATE 26',
  'GATE 42',
  'GATE 88',
];

const SEATS = [
  'SEAT 01A',
  'SEAT 04F',
  'SEAT 07B',
  'SEAT 09C',
  'SEAT 14B',
  'SEAT 18A',
  'SEAT 21C',
  'SEAT 26D',
  'SEAT 42A',
  'SEAT 08E',
];

const FLIGHTS = [
  'HH-2026',
  'HH-GOA',
  'AIR-GOA',
  'GOA-SHIP',
  'PARADISE-01',
];

const BOARDING_GROUPS = [
  'GROUP 1 (ALPHA SHIPPER)',
  'GROUP 1 (CABIN CREW)',
  'GROUP 2 (CORE DEV)',
  'GROUP 2 (PROD HERO)',
  'GROUP 3 (FAST TRACK)',
];

const ALL_BEACH_BAG_ITEMS: BeachBagItem[] = [
  { name: 'Cashew Feni & Soda', category: 'Refreshment', iconName: 'glass-water', emoji: '🍸' },
  { name: 'VS Code Dark Modern', category: 'Editor', iconName: 'code', emoji: '💻' },
  { name: 'Zinc Sunscreen SPF 100', category: 'Survival', iconName: 'sun', emoji: '🧴' },
  { name: 'Noise-Cancelling Cans', category: 'Focus', iconName: 'headphones', emoji: '🎧' },
  { name: 'Kingfisher Ultra Chilled', category: 'Fuel', iconName: 'beer', emoji: '🍺' },
  { name: '60% Lubed Keyboard', category: 'Gear', iconName: 'keyboard', emoji: '⌨️' },
  { name: 'Curved Surfboard 6\'2"', category: 'Sport', iconName: 'waves', emoji: '🏄‍♂️' },
  { name: 'Lo-Fi Sunset Playlist', category: 'Vibe', iconName: 'music', emoji: '📻' },
  { name: 'Tender Coconut with Straw', category: 'Hydration', iconName: 'palmtree', emoji: '🥥' },
  { name: 'Foldable Electric Scooter', category: 'Transit', iconName: 'zap', emoji: '🛴' },
  { name: '100W Anker Gan Fast-Brick', category: 'Power', iconName: 'battery-charging', emoji: '⚡' },
  { name: 'Zero-Latency 5G Hotspot', category: 'Uptime', iconName: 'radio', emoji: '📡' },
  { name: 'Ray-Ban Polarized Shades', category: 'Optics', iconName: 'eye', emoji: '🕶️' },
  { name: 'Cashew Nut Trail Mix', category: 'Snack', iconName: 'nut', emoji: '🥜' },
  { name: 'Git Commit Streak Sticker', category: 'Flex', iconName: 'tag', emoji: '🏷️' },
];

const SHIPPING_TEMPLATES = [
  'Shipping zero-latency WebSockets from Palolem beach cabana',
  'Compiling Rust shaders under swaying coconut palms',
  'Fine-tuning 8-bit local LLMs with fresh tender coconut',
  'Refactoring distributed consensus with 200ms ocean breeze',
  'Deploying edge React microfrontends at 60fps sunset',
  'Crafting buttery smooth glassmorphism UI for next-gen rails',
  'Benchmarking NVMe SSD clusters between surf sessions',
  'Rewriting product architecture with zero corporate noise',
  'Automating Kubernetes failover before beach volleyball',
  'Running autonomous AI agent swarms on cashew feni power',
  'Optimizing SQLite WASM kernels while listening to ocean waves',
  'Architecting decentralized payment channels on the beach',
];

/**
 * Deterministically generates builder metadata based on user's name and stack.
 * Identical inputs will ALWAYS produce the exact same boarding pass details.
 */
export function generateDeterministicProfile(
  name: string,
  stackOrRole: string,
  customTagline?: string
): DeterministicResult {
  const seedString = `${(name || 'Hacker').trim().toLowerCase()}::${(stackOrRole || 'Full Stack').trim().toLowerCase()}`;
  const seed = djb2Hash(seedString);

  // Derive Builder Class
  const classIndex = seed % BUILDER_CLASSES.length;
  const builderClass = BUILDER_CLASSES[classIndex];

  // Derive Gate and Seat safely
  const gateIndex = Math.floor(seed / 4) % GATES.length;
  const seatIndex = Math.floor(seed / 16) % SEATS.length;
  const flightIndex = Math.floor(seed / 64) % FLIGHTS.length;
  const groupIndex = Math.floor(seed / 256) % BOARDING_GROUPS.length;

  const gate = GATES[gateIndex];
  const seat = SEATS[seatIndex];
  const flightNo = FLIGHTS[flightIndex];
  const boardingGroup = BOARDING_GROUPS[groupIndex];

  // Pick 3 unique beach bag items deterministically
  const bagItems: BeachBagItem[] = [];
  const pickedIndices = new Set<number>();
  let shift = 1;
  while (bagItems.length < 3) {
    const itemIndex = ((seed + shift * 7) >>> 0) % ALL_BEACH_BAG_ITEMS.length;
    if (!pickedIndices.has(itemIndex)) {
      pickedIndices.add(itemIndex);
      bagItems.push(ALL_BEACH_BAG_ITEMS[itemIndex]);
    }
    shift++;
  }

  // Pick or construct Currently Shipping text
  let currentlyShipping = '';
  if (customTagline && customTagline.trim().length > 0) {
    currentlyShipping = customTagline.trim();
  } else if (stackOrRole && stackOrRole.trim().length > 0 && !['Full Stack', 'Frontend', 'Backend'].includes(stackOrRole)) {
    currentlyShipping = `Shipping ${stackOrRole.trim()} live from the Goa shoreline`;
  } else {
    const shipIndex = (seed >> 3) % SHIPPING_TEMPLATES.length;
    currentlyShipping = SHIPPING_TEMPLATES[shipIndex];
  }

  // Stamp tilt between -6deg and +6deg
  const tiltRaw = (seed % 13) - 6;
  const stampTilt = tiltRaw === 0 ? -3 : tiltRaw;

  // Hex visa ID
  const visaHex = (seed % 0xffffff).toString(16).padStart(6, '0').toUpperCase();
  const visaCode = `GOA-26-${visaHex}`;

  // Time & Terminal
  const hours = 10 + (seed % 9);
  const minutes = (seed % 4) * 15;
  const departureTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} IST`;
  const terminalCode = seed % 2 === 0 ? 'GOI · TERM 1' : 'GOX · TERM 2';

  return {
    builderClass,
    gate,
    seat,
    flightNo,
    boardingGroup,
    beachBag: bagItems,
    currentlyShipping,
    terminalCode,
    departureTime,
    visaCode,
    stampTilt,
    seed,
  };
}
