/**
 * Central place for workshop-related localStorage keys and clear helpers.
 * Used by Reset step and Reset progress to ensure a fresh session.
 */

const LAB_NUMBERS = [1, 2, 3] as const;

export function getLabStepStateKey(labNumber: number): string {
  return `lab${labNumber}-step-state`;
}

export function getLabProgressKey(labNumber: number): string {
  return `lab${labNumber}-progress`;
}

export function getLabCurrentStepKey(labNumber: number): string {
  return `lab${labNumber}-currentStep`;
}

export function getLabOutputByStepKey(labNumber: number): string {
  return `lab${labNumber}-output-by-step`;
}

/** All workshop-related localStorage keys we clear on full reset */
const WORKSHOP_KEYS = [
  'completedLabs',
  'labStartTimes',
  'lab_mongo_uri',
  'lab_aws_profile',
  'lab_kms_alias',
  'workshop_always_show_solutions',
  'workshop_prereq_checklist',
] as const;

/**
 * Clear localStorage for a single lab (step state, progress, current step, output).
 * Does not clear LabContext state (call resetProgress for that).
 */
export function clearLabStorage(labNumber: number): void {
  try {
    localStorage.removeItem(getLabStepStateKey(labNumber));
    localStorage.removeItem(getLabProgressKey(labNumber));
    localStorage.removeItem(getLabCurrentStepKey(labNumber));
    localStorage.removeItem(getLabOutputByStepKey(labNumber));
  } catch {
    // ignore
  }
}

/**
 * Clear step-state for one step only (e.g. on "Reset step").
 * Removes block keys like "2-0", "2-1" from the persisted step-state object.
 */
export function clearStepStateForStep(labNumber: number, stepIndex: number, codeBlocksCount: number): void {
  try {
    const key = getLabStepStateKey(labNumber);
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const data = JSON.parse(raw) as Record<string, unknown>;
    const keysToRemove: string[] = [];
    for (let i = 0; i < codeBlocksCount; i++) {
      keysToRemove.push(`${stepIndex}-${i}`);
    }
    let changed = false;
    for (const k of keysToRemove) {
      if (data.showSolution && (data.showSolution as Record<string, boolean>)[k] !== undefined) {
        delete (data.showSolution as Record<string, boolean>)[k];
        changed = true;
      }
      if (data.revealedHints && (data.revealedHints as Record<string, number[]>)[k] !== undefined) {
        delete (data.revealedHints as Record<string, number[]>)[k];
        changed = true;
      }
      if (data.revealedAnswers && (data.revealedAnswers as Record<string, number[]>)[k] !== undefined) {
        delete (data.revealedAnswers as Record<string, number[]>)[k];
        changed = true;
      }
    }
    if (changed) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch {
    // ignore
  }
}

/**
 * Clear all lab and workshop localStorage so the user can start from the beginning.
 * Does not clear: userEmail, workshop_attendee_name, user_role (keep identity).
 */
export function clearAllWorkshopLabStorage(): void {
  try {
    for (const lab of LAB_NUMBERS) {
      clearLabStorage(lab);
    }
    WORKSHOP_KEYS.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}
