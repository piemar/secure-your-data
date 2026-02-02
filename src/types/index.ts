// Slide types
export interface Slide {
  id: number;
  title: string;
  section: string;
  content: React.ReactNode;
  speakerNotes: string;
  interactiveElement?: 'poll' | 'challenge' | 'diagram' | null;
}

// Lab types
export interface LabStep {
  id: number;
  title: string;
  description: string;
  estimatedTime: number; // in minutes
  code?: string;
  language?: string;
  expectedOutput?: string;
  troubleshooting?: string[];
  isCompleted: boolean;
}

export interface Lab {
  id: number;
  title: string;
  description: string;
  totalTime: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: LabStep[];
  prerequisites: string[];
}

// Cheat sheet types
export interface CheatSheetSection {
  id: string;
  title: string;
  icon: string;
  content: React.ReactNode;
}

// Progress types
export interface Progress {
  currentSlide: number;
  completedSlides: number[];
  labProgress: {
    [labId: number]: {
      completedSteps: number[];
      startedAt?: Date;
      completedAt?: Date;
    };
  };
  timerState: {
    isRunning: boolean;
    elapsed: number;
    mode: 'presentation' | 'lab';
    labId?: number;
  };
}

// Poll types
export interface PollOption {
  id: string;
  label: string;
  votes: number;
}

export interface Poll {
  question: string;
  options: PollOption[];
  hasVoted: boolean;
  selectedOption?: string;
}

// Navigation
export type Section = 'presentation' | 'setup' | 'lab1' | 'lab2' | 'lab3' | 'cheatsheet' | 'leaderboard' | 'settings';
