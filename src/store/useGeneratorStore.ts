import { create } from 'zustand';
import type { CardFormat, SquadMember, BuilderProfile } from '../types/generator';

interface GeneratorState {
  // Format Selection
  format: CardFormat;
  setFormat: (format: CardFormat) => void;

  // Single Builder / PFP Photo
  imageSrc: string | null;
  setImageSrc: (src: string | null) => void;
  crop: { x: number; y: number };
  setCrop: (crop: { x: number; y: number }) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  rotation: number;
  setRotation: (rotation: number) => void;

  // Builder Profile Form Fields
  profile: BuilderProfile;
  setProfile: (updates: Partial<BuilderProfile>) => void;

  // Squad Members (2-3 members)
  squadMembers: SquadMember[];
  activeSquadMemberIndex: number;
  setActiveSquadMemberIndex: (index: number) => void;
  setSquadMemberImage: (index: number, src: string) => void;
  setSquadMemberInfo: (index: number, name: string, role: string) => void;
  setSquadMemberCrop: (index: number, crop: { x: number; y: number }, zoom: number) => void;
  addSquadMember: () => void;
  removeSquadMember: (index: number) => void;

  // Generation & Stamp States
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  hasGenerated: boolean;
  setHasGenerated: (generated: boolean) => void;
  generatedBlob: Blob | null;
  generatedDataUrl: string | null;
  setGeneratedResult: (blob: Blob | null, dataUrl: string | null) => void;

  // Animation & Audio toggles
  isStampAnimating: boolean;
  setIsStampAnimating: (animating: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  showTearStub: boolean;
  setShowTearStub: (show: boolean) => void;
  isStubTorn: boolean;
  setIsStubTorn: (torn: boolean) => void;

  // Reset
  resetStore: () => void;
}

const DEFAULT_PROFILE: BuilderProfile = {
  name: 'Alex Rivera',
  handle: '@arivera_dev',
  role: 'Full Stack',
  stackOrProject: 'Next.js, Rust & Solana',
  tagline: 'Shipping zero-latency edge services from Palolem beach',
  flightDate: 'OCT 2026',
  originAirport: 'BLR / DEL / SFO',
  departureGate: 'GATE 07',
  seatNumber: 'SEAT 14B',
};

const DEFAULT_SQUAD: SquadMember[] = [
  {
    id: 'squad-1',
    name: 'Alex (Lead)',
    role: 'Full Stack',
    imageSrc: null,
    crop: { x: 0, y: 0 },
    zoom: 1,
  },
  {
    id: 'squad-2',
    name: 'Priya (Design)',
    role: 'Product / UI',
    imageSrc: null,
    crop: { x: 0, y: 0 },
    zoom: 1,
  },
  {
    id: 'squad-3',
    name: 'Dev (Systems)',
    role: 'Rust / Kernel',
    imageSrc: null,
    crop: { x: 0, y: 0 },
    zoom: 1,
  },
];

export const useGeneratorStore = create<GeneratorState>((set) => ({
  format: 'boarding_pass',
  setFormat: (format) => set({ format, hasGenerated: false }),

  imageSrc: null,
  setImageSrc: (imageSrc) => set({ imageSrc, hasGenerated: false }),
  crop: { x: 0, y: 0 },
  setCrop: (crop) => set({ crop }),
  zoom: 1,
  setZoom: (zoom) => set({ zoom }),
  rotation: 0,
  setRotation: (rotation) => set({ rotation }),

  profile: DEFAULT_PROFILE,
  setProfile: (updates) =>
    set((state) => ({
      profile: { ...state.profile, ...updates },
      hasGenerated: false,
    })),

  squadMembers: DEFAULT_SQUAD,
  activeSquadMemberIndex: 0,
  setActiveSquadMemberIndex: (index) => set({ activeSquadMemberIndex: index }),

  setSquadMemberImage: (index, src) =>
    set((state) => {
      const updated = [...state.squadMembers];
      if (updated[index]) {
        updated[index] = { ...updated[index], imageSrc: src };
      }
      return { squadMembers: updated, hasGenerated: false };
    }),

  setSquadMemberInfo: (index, name, role) =>
    set((state) => {
      const updated = [...state.squadMembers];
      if (updated[index]) {
        updated[index] = { ...updated[index], name, role };
      }
      return { squadMembers: updated, hasGenerated: false };
    }),

  setSquadMemberCrop: (index, crop, zoom) =>
    set((state) => {
      const updated = [...state.squadMembers];
      if (updated[index]) {
        updated[index] = { ...updated[index], crop, zoom };
      }
      return { squadMembers: updated };
    }),

  addSquadMember: () =>
    set((state) => {
      if (state.squadMembers.length >= 4) return state;
      const newMember: SquadMember = {
        id: `squad-${Date.now()}`,
        name: `Member ${state.squadMembers.length + 1}`,
        role: 'Builder',
        imageSrc: null,
        crop: { x: 0, y: 0 },
        zoom: 1,
      };
      return { squadMembers: [...state.squadMembers, newMember], hasGenerated: false };
    }),

  removeSquadMember: (index) =>
    set((state) => {
      if (state.squadMembers.length <= 2) return state;
      const updated = state.squadMembers.filter((_, i) => i !== index);
      return {
        squadMembers: updated,
        activeSquadMemberIndex: Math.min(state.activeSquadMemberIndex, updated.length - 1),
        hasGenerated: false,
      };
    }),

  isGenerating: false,
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  hasGenerated: false,
  setHasGenerated: (hasGenerated) => set({ hasGenerated }),
  generatedBlob: null,
  generatedDataUrl: null,
  setGeneratedResult: (generatedBlob, generatedDataUrl) =>
    set({ generatedBlob, generatedDataUrl, hasGenerated: true, isGenerating: false }),

  isStampAnimating: false,
  setIsStampAnimating: (isStampAnimating) => set({ isStampAnimating }),
  soundEnabled: true,
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  showTearStub: true,
  setShowTearStub: (showTearStub) => set({ showTearStub }),
  isStubTorn: false,
  setIsStubTorn: (isStubTorn) => set({ isStubTorn }),

  resetStore: () =>
    set({
      imageSrc: null,
      crop: { x: 0, y: 0 },
      zoom: 1,
      rotation: 0,
      hasGenerated: false,
      generatedBlob: null,
      generatedDataUrl: null,
      isStubTorn: false,
    }),
}));
