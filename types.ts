export enum ViewState {
  LANDING = 'LANDING',
  ABOUT = 'ABOUT',
  AUTH = 'AUTH',
  SETUP = 'SETUP',
  PITCHING = 'PITCHING',
  REPORT = 'REPORT',
  HISTORY = 'HISTORY',
  PROFILE = 'PROFILE',
  PRICING = 'PRICING',
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan?: 'FREE' | 'PRO' | 'ENTERPRISE';
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  description: string;
  style: string;
  icon: string;
  color: string;
}

export interface StartupDetails {
  name: string;
  description: string;
}

export interface PitchMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  interestChange?: number; // How much this message affected the score
}

export interface PitchResponse {
  response: string;
  interest_change: number; // -10 to +10
  is_dealbreaker: boolean;
}

export interface PitchReport {
  score: number;
  feedback: string;
  funding_decision: 'Funded' | 'Passed' | 'Ghosted';
  strengths: string[];
  weaknesses: string[];
}

// Database Schema (Simulated)
export interface PitchSession {
  id: string;
  userId: string;
  date: string; // ISO string
  startup: StartupDetails;
  persona: Persona;
  messages: PitchMessage[];
  score: number;
  interestTrajectory?: number[]; // Array of scores over time for charts
  report?: PitchReport; // Optional, populated after analysis
}
