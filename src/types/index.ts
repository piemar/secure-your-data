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
// 'lab1' | 'lab2' | 'lab3' are legacy CSFLE lab sections.
// 'lab' is the entry point for template-driven, content-based labs (via LabRunner).
export type Section =
  | 'presentation'
  | 'setup'
  | 'lab'
  | 'lab1'
  | 'lab2'
  | 'lab3'
  | 'cheatsheet'
  | 'leaderboard'
  | 'settings'
  | 'challenge'
  | 'metrics';

// Workshop domain model (initial, framework-oriented types)

export type WorkshopMode = 'demo' | 'lab' | 'challenge';

export type WorkshopRole = 'moderator' | 'attendee' | 'observer';

export type LabDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface WorkshopTopic {
  id: string;
  name: string;
  description: string;
  tags?: string[];
  defaultLabIds?: string[];
  prerequisites?: string[];
  povCapabilities?: string[]; // POV capabilities this topic covers
  labIds?: string[]; // Available labs for this topic (discovered dynamically)
}

/**
 * Data requirement for a lab or step.
 * Describes what data (collections, sample files, etc.) is needed to run the lab/step.
 */
export interface LabDataRequirement {
  /** Unique id for this requirement */
  id: string;
  /** Human-readable description */
  description: string;
  /** Type: collection (MongoDB), file (JSON/CSV), or script (generates data) */
  type: 'collection' | 'file' | 'script';
  /** Path relative to lab folder, e.g. "data/sample.json" or "scripts/seed.py" */
  path?: string;
  /** For type=collection: database.collection */
  namespace?: string;
  /** Optional: size hint for UI (e.g. "1MB", "10K docs") */
  sizeHint?: string;
}

export interface WorkshopLabStep {
  id: string;
  title: string;
  narrative?: string;
  instructions: string;
  estimatedTimeMinutes?: number;
  /** Data required for this step (e.g. sample collection, seed file) */
  dataRequirements?: LabDataRequirement[];
  codeSnippets?: {
    language: string;
    code: string;
    description?: string;
  }[];
  verificationId?: string;
  points?: number;
  hints?: string[];
  dependsOnStepIds?: string[];
  modes?: WorkshopMode[]; // which modes this step applies to
  /**
   * Optional enhancement identifier used by the step enhancement registry.
   * Allows us to attach reusable code blocks, exercises, or richer UI
   * behavior to a step without hard-coding logic per PoV inside LabRunner.
   *
   * Example values:
   * - 'rich-query.compound-query'
   * - 'rich-query.index-explain'
   */
  enhancementId?: string;
  /**
   * Path to the source proof exercise document.
   * Example: "proofs/01/README.md"
   */
  sourceProof?: string;
  /**
   * Specific section within the proof exercise this step references.
   * Example: "Execution - TEST 1"
   */
  sourceSection?: string;
}

/**
 * Lab Context Overlay allows quests/challenges to customize lab narrative
 * without duplicating lab definitions. This enables:
 * - Same lab steps/code/verification across multiple quests
 * - Quest-specific story context and narrative
 * - Mode-specific step filtering
 */
export interface LabContextOverlay {
  labId: string;
  // Override lab-level narrative (optional)
  titleOverride?: string;
  descriptionOverride?: string;
  introNarrative?: string; // Quest-specific intro for this lab
  outroNarrative?: string; // Quest-specific outro for this lab
  // Step-level narrative overrides (keyed by step.id)
  stepNarrativeOverrides?: Record<string, string>;
  // Filter steps by mode (if provided, only these steps show in this context)
  stepFilter?: {
    stepIds?: string[]; // Only include these steps
    excludeStepIds?: string[]; // Exclude these steps
    modeFilter?: WorkshopMode[]; // Only show steps that support these modes
  };
}

export interface WorkshopLabDefinition {
  id: string;
  topicId: string;
  title: string;
  description: string;
  difficulty: LabDifficulty;
  estimatedTotalTimeMinutes?: number;
  tags?: string[];
  prerequisites?: string[];
  steps: WorkshopLabStep[];
  modes?: WorkshopMode[]; // which modes this lab supports
  audience?: WorkshopRole | 'all';
  povCapabilities?: string[]; // Array of POV capability IDs this lab covers
  /** Data required for this lab (collections, sample files, scripts). Can be overridden per step. */
  dataRequirements?: LabDataRequirement[];
  /** Optional: path to lab folder containing data, scripts, etc. (e.g. "Docs/pov-proof-exercises/proofs/08" or "content/topics/scalability/scale-up") */
  labFolderPath?: string;
  /** Optional: key concepts for the lab overview/intro tab */
  keyConcepts?: Array<{ term: string; explanation: string }>;

  /** Default competitor product id to show in demo side-by-side (e.g. postgresql) */
  defaultCompetitorId?: string;
  /** Competitor product ids this lab has equivalent code for */
  competitorIds?: string[];
}

export interface WorkshopGamificationConfig {
  enabled: boolean;
  basePointsPerStep?: number;
  bonusPointsPerFlag?: number;
  bonusPointsPerQuest?: number;
  allowTeams?: boolean;
}

export interface WorkshopQuest {
  id: string;
  title: string;
  storyContext: string;
  objectiveSummary: string;
  labIds: string[];
  requiredFlagIds: string[];
  optionalFlagIds?: string[];
  modes?: WorkshopMode[]; // usually includes 'challenge'
  // Lab context overlays: customize lab narrative per quest without duplicating labs
  labContextOverlays?: LabContextOverlay[];
}

export interface WorkshopFlag {
  id: string;
  name: string;
  description?: string;
  visibility: 'hidden' | 'visible';
  verificationId: string;
  points?: number;
}

export interface WorkshopCompetitorImplementation {
  competitorId: string; // e.g. 'rdbms', 'documentdb'
  title: string;
  description: string;
  codeSnippets?: {
    language: string;
    code: string;
    description?: string;
  }[];
  painPoints?: string[];
}

export interface WorkshopCompetitorScenario {
  id: string;
  labId: string;
  stepId?: string;
  mongodbDescription: string;
  competitorImplementations: WorkshopCompetitorImplementation[];
}

export interface WorkshopTemplate {
  id: string;
  name: string;
  description: string;
  topicIds: string[];
  labIds: string[];
  questIds?: string[];
  defaultMode: WorkshopMode;
  allowedModes?: WorkshopMode[];
  gamification?: WorkshopGamificationConfig;
  // Lab context overlays at template level (applies to all quests in this template)
  labContextOverlays?: LabContextOverlay[];
  includeCompetitorComparisons?: boolean;
  /** Default competitor product id in demo side-by-side when template is used */
  defaultCompetitorId?: string;
  industry?: string; // e.g. 'retail', 'financial-services'
  storyIntro?: string;
  storyOutro?: string;
}

export interface WorkshopInstance {
  id: string;
  templateId: string;
  customerName?: string;
  scheduledAt?: Date;
  createdAt: Date;
  mode: WorkshopMode;
  archived?: boolean;
}

export interface WorkshopTeam {
  id: string;
  name: string;
  memberIds: string[];
}

export interface WorkshopScoreEntry {
  participantId: string;
  teamId?: string;
  totalPoints: number;
  completedLabIds: string[];
  completedQuestIds: string[];
  capturedFlagIds: string[];
}
