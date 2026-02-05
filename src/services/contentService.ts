import {
  WorkshopLabDefinition,
  WorkshopTopic,
  WorkshopQuest,
  WorkshopFlag,
  WorkshopTemplate,
  WorkshopCompetitorScenario,
  WorkshopMode,
} from '../types';
import type { PovCapability } from '../types/pov-capabilities';
import { allLabs, allTopics } from '../content/topics';
import { povCapabilities } from '../content/pov-capabilities';
import { defaultEncryptionWorkshopTemplate } from '../content/workshop-templates/default-encryption-workshop';
import { retailEncryptionQuickstartTemplate } from '../content/workshop-templates/retail-encryption-quickstart';
import { retailDataBreachSimulationTemplate } from '../content/workshop-templates/retail-data-breach-simulation';
import { queryCapabilitiesWorkshopTemplate } from '../content/workshop-templates/query-capabilities-workshop';
import { stopTheLeakQuest } from '../content/quests/stop-the-leak';
import { hardenTheSystemQuest } from '../content/quests/harden-the-system';
import {
  encryptedPiiCollectionsFlag,
  noPlaintextPiiFlag,
  queryableEncryptionActiveFlag,
  properIndexesFlag,
  accessControlAuditFlag,
  queryOptimizationFlag
} from '../content/flags/encryption-flags';
import { encryptionComparisonScenario } from '../content/competitor-scenarios/encryption-comparison';
import { queryableEncryptionComparisonScenario } from '../content/competitor-scenarios/queryable-encryption-comparison';

/**
 * ContentService is the abstraction for reading structured workshop content
 * (topics, labs, quests, flags, templates, competitor scenarios) from the
 * `content/` repository.
 *
 * In early phases this will likely load static files from disk on the backend
 * and expose them via simple HTTP endpoints. Over time we can add caching,
 * validation, and potentially remote content sources if needed.
 *
 * CURRENT IMPLEMENTATION: In-memory TypeScript modules.
 * FUTURE: Will load from YAML/JSON files in content/ directory.
 */
export interface ContentService {
  getTopics(): Promise<WorkshopTopic[]>;
  getLabs(): Promise<WorkshopLabDefinition[]>;
  getLabById(id: string): Promise<WorkshopLabDefinition | undefined>;
  getQuests(): Promise<WorkshopQuest[]>;
  getFlags(): Promise<WorkshopFlag[]>;
  getTemplates(): Promise<WorkshopTemplate[]>;
  getCompetitorScenariosForLab(
    labId: string,
  ): Promise<WorkshopCompetitorScenario[]>;
  // New methods for dynamic configuration
  getPovCapabilities(): Promise<PovCapability[]>;
  getLabsByTopic(topicId: string): Promise<WorkshopLabDefinition[]>;
  getLabsByCapabilities(capabilityIds: string[]): Promise<WorkshopLabDefinition[]>;
  getLabsByTopicAndMode(topicId: string, mode: WorkshopMode): Promise<WorkshopLabDefinition[]>;
  getTopicsByCapabilities(capabilityIds: string[]): Promise<WorkshopTopic[]>;
  suggestLabsForTopics(topicIds: string[], mode?: WorkshopMode): Promise<WorkshopLabDefinition[]>;
}

/**
 * In-memory ContentService implementation.
 * 
 * Currently loads from TypeScript modules. In Phase 2+ we'll migrate
 * to loading from YAML/JSON files in the content/ directory.
 */
class InMemoryContentService implements ContentService {
  private topics: WorkshopTopic[] = allTopics;
  private labs: WorkshopLabDefinition[] = allLabs;
  private quests: WorkshopQuest[] = [
    stopTheLeakQuest,
    hardenTheSystemQuest
  ];
  private flags: WorkshopFlag[] = [
    encryptedPiiCollectionsFlag,
    noPlaintextPiiFlag,
    queryableEncryptionActiveFlag,
    properIndexesFlag,
    accessControlAuditFlag,
    queryOptimizationFlag
  ];
  private templates: WorkshopTemplate[] = [
    defaultEncryptionWorkshopTemplate,
    retailEncryptionQuickstartTemplate,
    retailDataBreachSimulationTemplate,
    queryCapabilitiesWorkshopTemplate,
  ];
  private competitorScenarios: WorkshopCompetitorScenario[] = [
    encryptionComparisonScenario,
    queryableEncryptionComparisonScenario
  ];

  async getTopics(): Promise<WorkshopTopic[]> {
    return [...this.topics];
  }

  async getLabs(): Promise<WorkshopLabDefinition[]> {
    return [...this.labs];
  }

  async getLabById(id: string): Promise<WorkshopLabDefinition | undefined> {
    return this.labs.find(lab => lab.id === id);
  }

  async getQuests(): Promise<WorkshopQuest[]> {
    return [...this.quests];
  }

  async getFlags(): Promise<WorkshopFlag[]> {
    return [...this.flags];
  }

  async getTemplates(): Promise<WorkshopTemplate[]> {
    return [...this.templates];
  }

  async getCompetitorScenariosForLab(
    labId: string,
  ): Promise<WorkshopCompetitorScenario[]> {
    return this.competitorScenarios.filter(scenario => scenario.labId === labId);
  }

  // New methods for dynamic configuration
  async getPovCapabilities(): Promise<PovCapability[]> {
    return [...povCapabilities];
  }

  async getLabsByTopic(topicId: string): Promise<WorkshopLabDefinition[]> {
    return this.labs.filter(lab => lab.topicId === topicId);
  }

  async getLabsByCapabilities(capabilityIds: string[]): Promise<WorkshopLabDefinition[]> {
    return this.labs.filter(lab => 
      lab.povCapabilities && 
      lab.povCapabilities.some(cap => capabilityIds.includes(cap))
    );
  }

  async getLabsByTopicAndMode(topicId: string, mode: WorkshopMode): Promise<WorkshopLabDefinition[]> {
    return this.labs.filter(lab => {
      const matchesTopic = lab.topicId === topicId;
      const supportsMode = !lab.modes || lab.modes.includes(mode);
      return matchesTopic && supportsMode;
    });
  }

  async getTopicsByCapabilities(capabilityIds: string[]): Promise<WorkshopTopic[]> {
    return this.topics.filter(topic => 
      topic.povCapabilities && 
      topic.povCapabilities.some(cap => capabilityIds.includes(cap))
    );
  }

  async suggestLabsForTopics(topicIds: string[], mode?: WorkshopMode): Promise<WorkshopLabDefinition[]> {
    // Get all labs for selected topics
    let suggestedLabs = this.labs.filter(lab => topicIds.includes(lab.topicId));

    // Filter by mode if specified
    if (mode) {
      suggestedLabs = suggestedLabs.filter(lab => 
        !lab.modes || lab.modes.includes(mode)
      );
    }

    // Sort by prerequisites (labs without prerequisites first)
    // Then by difficulty (beginner -> intermediate -> advanced)
    const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 };
    
    suggestedLabs.sort((a, b) => {
      // Labs without prerequisites come first
      const aHasPrereqs = a.prerequisites && a.prerequisites.length > 0;
      const bHasPrereqs = b.prerequisites && b.prerequisites.length > 0;
      if (aHasPrereqs !== bHasPrereqs) {
        return aHasPrereqs ? 1 : -1;
      }
      // Then sort by difficulty
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    });

    // Ensure prerequisites are included
    const labIds = new Set(suggestedLabs.map(lab => lab.id));
    const prerequisiteLabs: WorkshopLabDefinition[] = [];
    
    suggestedLabs.forEach(lab => {
      if (lab.prerequisites) {
        lab.prerequisites.forEach(prereqId => {
          if (!labIds.has(prereqId)) {
            const prereqLab = this.labs.find(l => l.id === prereqId);
            if (prereqLab && (!mode || !prereqLab.modes || prereqLab.modes.includes(mode))) {
              prerequisiteLabs.push(prereqLab);
              labIds.add(prereqId);
            }
          }
        });
      }
    });

    // Combine prerequisites with suggested labs
    return [...prerequisiteLabs, ...suggestedLabs];
  }
}

/**
 * Factory for creating a ContentService instance.
 *
 * Currently returns an in-memory implementation. In later phases,
 * this will load from the content/ directory (YAML/JSON files).
 */
export function createContentService(): ContentService {
  return new InMemoryContentService();
}

// Singleton instance for convenience
let contentServiceInstance: ContentService | null = null;

/**
 * Get or create the singleton ContentService instance.
 */
export function getContentService(): ContentService {
  if (!contentServiceInstance) {
    contentServiceInstance = createContentService();
  }
  return contentServiceInstance;
}
