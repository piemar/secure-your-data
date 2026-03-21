import { VerificationCheck, VerificationContext } from './types.js';
import { mission1VerificationChecks } from '../../content/missions/the_phantom_index/verification.js';
import { mission3VerificationChecks } from '../../content/missions/the_aggregation_heist/verification.js';
import { mission5VerificationChecks } from '../../content/missions/the_schema_saboteur/verification.js';
import { mission6VerificationChecks } from '../../content/missions/rich_query_recon/verification.js';
import { mission8VerificationChecks } from '../../content/missions/analytics_extraction/verification.js';
import { mission12VerificationChecks } from '../../content/missions/crud_boot_camp/verification.js';
import { mission13VerificationChecks } from '../../content/missions/geospatial_pursuit/verification.js';
import { mission14VerificationChecks } from '../../content/missions/graph_infiltration/verification.js';
import { mission15VerificationChecks } from '../../content/missions/change_stream_stakeout/verification.js';
import { mission16VerificationChecks } from '../../content/missions/transaction_lockout/verification.js';
import { mission18VerificationChecks } from '../../content/missions/time_series_infiltration/verification.js';
import { mission20VerificationChecks } from '../../content/missions/schema_evolution/verification.js';

export type { VerificationCheck, VerificationContext } from './types.js';

export const VERIFICATION_CHECKS: Record<string, VerificationCheck[]> = {
  'mission-1': mission1VerificationChecks,
  'mission-3': mission3VerificationChecks,
  'mission-5': mission5VerificationChecks,
  'mission-6': mission6VerificationChecks,
  'mission-8': mission8VerificationChecks,
  'mission-12': mission12VerificationChecks,
  'mission-13': mission13VerificationChecks,
  'mission-14': mission14VerificationChecks,
  'mission-15': mission15VerificationChecks,
  'mission-16': mission16VerificationChecks,
  'mission-18': mission18VerificationChecks,
  'mission-20': mission20VerificationChecks,
};
