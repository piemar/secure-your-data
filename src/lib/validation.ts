/**
 * Pattern-matching validation engine for mission objectives.
 * Each objective has validation rules (regex patterns) that the user's code must match.
 */

export interface ValidationRule {
  pattern: RegExp;
  description: string;
  required: boolean;
}

export interface ObjectiveValidation {
  objectiveId: string;
  rules: ValidationRule[];
}

export interface ValidationResult {
  objectiveId: string;
  passed: boolean;
  matchedRules: string[];
  failedRules: string[];
}

export function validateCode(code: string, validation: ObjectiveValidation): ValidationResult {
  const matchedRules: string[] = [];
  const failedRules: string[] = [];

  for (const rule of validation.rules) {
    if (rule.pattern.test(code)) {
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
  };
}

export function validateAllObjectives(
  code: string,
  validations: ObjectiveValidation[]
): ValidationResult[] {
  return validations.map(v => validateCode(code, v));
}
