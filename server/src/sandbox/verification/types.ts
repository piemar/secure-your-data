import { Db } from 'mongodb';

export interface VerificationContext {
  commandTrace?: Array<{ command: string; result: unknown; error?: string }>;
}

export interface VerificationCheck {
  objectiveId: string;
  description: string;
  successMessage: string;
  failMessage: string;
  verify: (db: Db, context?: VerificationContext) => Promise<boolean>;
}
