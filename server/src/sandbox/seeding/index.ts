import { SeedDefinition } from './types.js';
import { mission1SeedData } from '../../content/missions/the_phantom_index/seed-data.js';
import { mission3SeedData } from '../../content/missions/the_aggregation_heist/seed-data.js';
import { mission5SeedData } from '../../content/missions/the_schema_saboteur/seed-data.js';
import { mission6SeedData } from '../../content/missions/rich_query_recon/seed-data.js';
import { mission8SeedData } from '../../content/missions/analytics_extraction/seed-data.js';
import { mission12SeedData } from '../../content/missions/crud_boot_camp/seed-data.js';
import { mission13SeedData } from '../../content/missions/geospatial_pursuit/seed-data.js';
import { mission14SeedData } from '../../content/missions/graph_infiltration/seed-data.js';
import { mission15SeedData } from '../../content/missions/change_stream_stakeout/seed-data.js';
import { mission16SeedData } from '../../content/missions/transaction_lockout/seed-data.js';
import { mission18SeedData } from '../../content/missions/time_series_infiltration/seed-data.js';
import { mission20SeedData } from '../../content/missions/schema_evolution/seed-data.js';

export type { CollectionSeed, SeedDefinition } from './types.js';

export const SEED_DATA: Record<string, SeedDefinition> = {
  'mission-1': mission1SeedData,
  'mission-3': mission3SeedData,
  'mission-5': mission5SeedData,
  'mission-6': mission6SeedData,
  'mission-8': mission8SeedData,
  'mission-12': mission12SeedData,
  'mission-13': mission13SeedData,
  'mission-14': mission14SeedData,
  'mission-15': mission15SeedData,
  'mission-16': mission16SeedData,
  'mission-18': mission18SeedData,
  'mission-20': mission20SeedData,
};
