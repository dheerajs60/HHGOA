export type CardFormat = 'boarding_pass' | 'pfp' | 'squad';

export type BuilderRole =
  | 'Full Stack'
  | 'Frontend'
  | 'Backend'
  | 'AI / ML'
  | 'UI/UX Design'
  | 'Product / PM'
  | 'Infra / DevOps'
  | 'Web3 / Crypto'
  | 'Founder / Hacker';

export interface BeachBagItem {
  name: string;
  category: string;
  iconName: string;
  emoji: string;
}

export interface DeterministicResult {
  builderClass: string;
  gate: string;
  seat: string;
  flightNo: string;
  boardingGroup: string;
  beachBag: BeachBagItem[];
  currentlyShipping: string;
  terminalCode: string;
  departureTime: string;
  visaCode: string;
  stampTilt: number;
  seed: number;
}

export interface SquadMember {
  id: string;
  name: string;
  role: string;
  imageSrc: string | null;
  crop: { x: number; y: number };
  zoom: number;
  builderClass?: string;
}

export interface BuilderProfile {
  name: string;
  handle: string;
  role: BuilderRole | string;
  stackOrProject: string;
  tagline: string;
  flightDate: string;
  originAirport: string;
  departureGate: string;
  seatNumber: string;
  customClass?: string;
  customCurrentlyShipping?: string;
}

export interface CropState {
  x: number;
  y: number;
  zoom: number;
  rotation: number;
  croppedAreaPixels?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
