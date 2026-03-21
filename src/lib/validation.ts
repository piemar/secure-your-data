/**
 * Pattern-matching validation engine for mission objectives.
 * Supports both client-side instant validation (Tier 1)
 * and async server-validated results (Tier 2/3).
 */

export type ValidationTier = 'pattern' | 'execute' | 'simulate';

export interface ValidationRule {
  pattern: RegExp;
  description: string;
  required: boolean;
}

export interface ObjectiveValidation {
  objectiveId: string;
  rules: ValidationRule[];
  tier?: ValidationTier;          // Which tier this objective uses
  executionCheck?: string;        // What to verify in execution output (Tier 2)
  simulatedOutput?: string;       // For Tier 3 mock responses
}

export interface ValidationResult {
  objectiveId: string;
  passed: boolean;
  matchedRules: string[];
  failedRules: string[];
  serverVerified?: boolean;       // Was this also verified server-side?
  serverMessage?: string;         // Server verification message
  tier?: ValidationTier;
}

function stripLineAndBlockComments(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

/**
 * Client-side pattern validation (Tier 1 — instant).
 */
export function validateCode(code: string, validation: ObjectiveValidation): ValidationResult {
  const matchedRules: string[] = [];
  const failedRules: string[] = [];
  const codeWithoutComments = stripLineAndBlockComments(code);

  for (const rule of validation.rules) {
    // Reset regex state in case a rule accidentally uses /g.
    rule.pattern.lastIndex = 0;
    if (rule.pattern.test(codeWithoutComments)) {
      matchedRules.push(rule.description);
    } else if (rule.required) {
      failedRules.push(rule.description);
    }
  }

  return {
    objectiveId: validation.objectiveId,
    passed: failedRules.length === 0 && matchedRules.length > 0,
    matchedRules,
    failedRules,
    tier: validation.tier || 'pattern',
  };
}

/**
 * Validate all objectives — client-side pattern matching.
 */
export function validateAllObjectives(
  code: string,
  validations: ObjectiveValidation[]
): ValidationResult[] {
  return validations.map(v => validateCode(code, v));
}

/**
 * Merge server-side verification results with client-side pattern results.
 * Server results override pattern-only results for Tier 2 objectives.
 */
export interface ServerVerificationResult {
  objectiveId: string;
  passed: boolean;
  message: string;
}

export function mergeValidationResults(
  patternResults: ValidationResult[],
  serverResults: ServerVerificationResult[]
): ValidationResult[] {
  const serverMap = new Map(serverResults.map(r => [r.objectiveId, r]));

  return patternResults.map(pr => {
    const sr = serverMap.get(pr.objectiveId);
    if (!sr) return pr;

    // For Tier 2: both pattern AND server must pass
    if (pr.tier === 'execute') {
      return {
        ...pr,
        passed: pr.passed && sr.passed,
        serverVerified: true,
        serverMessage: sr.message,
      };
    }

    // For other tiers, pattern result stands but augment with server info
    return {
      ...pr,
      serverVerified: sr.passed,
      serverMessage: sr.message,
    };
  });
}
