export interface ScentProfile {
  topNotes: string[];
  middleNotes: string[];
  baseNotes: string[];
  description?: string;
}

export interface Poem {
  title: string;
  author: string;
  dynasty: string;
  content: string[];
  translation: string;
  appreciation: string;
}

export interface EmotionalProfile {
  mood: string;
  interactionTip: string;
  comfortWords: string;
}

export interface CreativeProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: 'incense' | 'burner' | 'stationery' | 'ornament';
}

export interface SolarTerm {
  id: string;
  name: string;
  englishName: string;
  solarTermPeriod: string;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  color: string; // Traditional color hex (e.g., #e0f0e0)
  textColor: string; // Dynamic text contrasting color
  bgGradient: string; // Tailwind gradient starting color or full class
  incenseName: string;
  scentProfile: ScentProfile;
  poem: Poem;
  emotionalProfile: EmotionalProfile;
  creativeProducts: CreativeProduct[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
  suggestedProducts?: CreativeProduct[];
  suggestedTermId?: string;
}

export interface LlmStatus {
  configured: boolean;
  model: string;
  mode: 'live' | 'demo';
  keyHint: string | null;
}
