export type MeditationSession = {
  id: string;
  spaceId: string | null;
  spaceName: string | null;
  duration: number; // in seconds
  date: string; // ISO string
  completed: boolean;
  failed?: boolean; // New field to track failed sessions
};

export type AIMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO string
};

export type AIConversation = {
  id: string;
  messages: AIMessage[];
  title: string;
  lastUpdated: string; // ISO string
};

export type UserProfile = {
  totalSessions: number;
  totalMinutes: number;
  streak: number; // consecutive days
  lastMeditation: string | null; // ISO string
};