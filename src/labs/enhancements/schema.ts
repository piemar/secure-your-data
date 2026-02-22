import type { Step } from '@/components/labs/LabViewWithTabs';
import type { LabDataRequirement } from '@/types';

/**
 * Enhancement Metadata Schema
 * 
 * Defines the structure for step enhancement metadata that can be stored
 * in configuration files (YAML/JSON) or TypeScript modules.
 */

export interface EnhancementMetadata {
  /** Unique identifier for this enhancement, e.g., "rich-query.compound-query" */
  id: string;
  
  /** PoV capability this enhancement demonstrates, e.g., "RICH-QUERY" */
  povCapability: string;
  
  /** Path to source proof exercise, e.g., "proofs/01/README.md" */
  sourceProof: string;
  
  /** Specific section in proof exercise, e.g., "Execution - TEST 1" */
  sourceSection?: string;
  
  /** Code blocks with full code, skeletons, and inline hints */
  codeBlocks?: CodeBlockMetadata[];
  
  /** Tips and best practices for this step */
  tips?: string[];
  
  /** Troubleshooting guidance */
  troubleshooting?: string[];
  
  /** Exercises (quizzes, fill-in-the-blank, challenges) */
  exercises?: ExerciseMetadata[];
  
  /** Reference to a reusable component for dynamic content */
  componentId?: string;
  
  /** Props to pass to the component */
  componentProps?: Record<string, any>;
  
  /** Data required for this step (collections, sample files, scripts) */
  dataRequirements?: LabDataRequirement[];
}

export interface CodeBlockMetadata {
  /** Filename to display in the code editor */
  filename: string;
  
  /** Programming language for syntax highlighting */
  language: string;
  
  /** Full working code */
  code: string;
  
  /** Guided skeleton with blanks for students to fill */
  skeleton?: string;
  
  /** Challenge mode skeleton (more minimal scaffolding) */
  challengeSkeleton?: string;
  
  /** Expert mode skeleton (minimal or no scaffolding) */
  expertSkeleton?: string;
  
  /** Inline hints for skeleton blanks */
  inlineHints?: InlineHintMetadata[];

  /**
   * Optional competitor equivalents for demo side-by-side view.
   * Key = competitor product id (e.g. postgresql, cosmosdb-vcore, dynamodb).
   */
  competitorEquivalents?: Record<
    string,
    {
      language: string;
      code: string;
      workaroundNote?: string;
      /** Short bullets on challenges doing it the competitor way (vs MongoDB) */
      challenges?: string[];
      /** Optional comparison text, capability matrix, or diagram description */
      comparisonSummary?: string;
    }
  >;
}

export interface InlineHintMetadata {
  /** Line number (1-indexed) where the blank appears */
  line: number;
  
  /** The blank pattern to match, e.g., "_________" */
  blankText: string;
  
  /** Conceptual hint explaining what should go here */
  hint: string;
  
  /** Exact text answer */
  answer: string;
}

export interface ExerciseMetadata {
  /** Unique identifier for this exercise */
  id: string;
  
  /** Type of exercise */
  type: 'quiz' | 'fill_blank' | 'challenge';
  
  /** Exercise title */
  title: string;
  
  /** Optional description */
  description?: string;
  
  /** Points awarded for completion */
  points?: number;
  
  /** Quiz question (for quiz type) */
  question?: string;
  
  /** Quiz options (for quiz type) */
  options?: Array<{
    id: string;
    label: string;
    isCorrect: boolean;
  }>;
  
  /** Code template (for fill_blank type) */
  codeTemplate?: string;
  
  /** Blanks to fill (for fill_blank type) */
  blanks?: Array<{
    id: string;
    placeholder: string;
    correctAnswer: string;
    hint?: string;
  }>;
  
  /** Challenge steps (for challenge type) */
  challengeSteps?: Array<{
    instruction: string;
    hint?: string;
  }>;
}

/**
 * Registry of enhancement metadata
 * Can be loaded from TypeScript modules or YAML/JSON files
 */
export type EnhancementMetadataRegistry = Record<string, EnhancementMetadata>;
