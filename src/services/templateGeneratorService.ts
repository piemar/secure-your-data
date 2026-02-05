import {
  WorkshopTemplate,
  WorkshopLabDefinition,
  WorkshopQuest,
  WorkshopFlag,
  WorkshopMode,
  WorkshopGamificationConfig,
} from '../types';
import { getContentService } from './contentService';

export interface TemplateConfig {
  topicIds: string[];
  labIds: string[]; // Selected labs (may be auto-suggested)
  defaultMode: WorkshopMode;
  allowedModes: WorkshopMode[];
  gamification?: WorkshopGamificationConfig;
  industry?: string;
  name?: string;
  description?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TemplateGeneratorService {
  generateTemplate(config: TemplateConfig): Promise<WorkshopTemplate>;
  validateTemplate(template: WorkshopTemplate): Promise<ValidationResult>;
  suggestQuestsForLabs(labIds: string[]): Promise<WorkshopQuest[]>;
  suggestFlagsForLabs(labIds: string[]): Promise<WorkshopFlag[]>;
}

class TemplateGeneratorServiceImpl implements TemplateGeneratorService {
  async generateTemplate(config: TemplateConfig): Promise<WorkshopTemplate> {
    const contentService = getContentService();
    
    // Validate prerequisites
    const labs = await Promise.all(
      config.labIds.map(id => contentService.getLabById(id))
    );
    const validLabs = labs.filter((lab): lab is WorkshopLabDefinition => lab !== undefined);

    // Order labs by prerequisites (topological sort)
    const orderedLabIds = this.orderLabsByPrerequisites(validLabs);

    // Suggest quests and flags
    const quests = await this.suggestQuestsForLabs(config.labIds);
    const flags = await this.suggestFlagsForLabs(config.labIds);

    // Generate template
    const template: WorkshopTemplate = {
      id: `template-custom-${Date.now()}`,
      name: config.name || `Custom Workshop (${config.topicIds.join(', ')})`,
      description: config.description || `Custom workshop covering ${config.topicIds.length} topic(s)`,
      topicIds: config.topicIds,
      labIds: orderedLabIds,
      questIds: quests.length > 0 ? quests.map(q => q.id) : undefined,
      defaultMode: config.defaultMode,
      allowedModes: config.allowedModes,
      gamification: config.gamification,
      industry: config.industry,
    };

    return template;
  }

  async validateTemplate(template: WorkshopTemplate): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const contentService = getContentService();

    // Validate topics exist
    const allTopics = await contentService.getTopics();
    const topicIds = new Set(allTopics.map(t => t.id));
    template.topicIds.forEach(topicId => {
      if (!topicIds.has(topicId)) {
        errors.push(`Topic "${topicId}" does not exist`);
      }
    });

    // Validate labs exist and belong to selected topics
    const allLabs = await contentService.getLabs();
    const labIds = new Set(allLabs.map(l => l.id));
    template.labIds.forEach(labId => {
      if (!labIds.has(labId)) {
        errors.push(`Lab "${labId}" does not exist`);
      } else {
        const lab = allLabs.find(l => l.id === labId);
        if (lab && !template.topicIds.includes(lab.topicId)) {
          warnings.push(`Lab "${labId}" belongs to topic "${lab.topicId}" which is not selected`);
        }
      }
    });

    // Validate prerequisites
    const labMap = new Map(allLabs.map(l => [l.id, l]));
    const includedLabs = new Set(template.labIds);
    
    template.labIds.forEach(labId => {
      const lab = labMap.get(labId);
      if (lab && lab.prerequisites) {
        lab.prerequisites.forEach(prereqId => {
          if (!includedLabs.has(prereqId)) {
            warnings.push(`Lab "${labId}" requires prerequisite "${prereqId}" which is not included`);
          }
        });
      }
    });

    // Validate modes
    if (!template.allowedModes || template.allowedModes.length === 0) {
      warnings.push('No allowed modes specified');
    }
    if (!template.allowedModes?.includes(template.defaultMode)) {
      errors.push(`Default mode "${template.defaultMode}" is not in allowed modes`);
    }

    // Validate labs support selected modes
    template.labIds.forEach(labId => {
      const lab = labMap.get(labId);
      if (lab && lab.modes && template.allowedModes) {
        const labSupportsAnyMode = lab.modes.some(mode => template.allowedModes!.includes(mode));
        if (!labSupportsAnyMode) {
          warnings.push(`Lab "${labId}" does not support any of the selected modes`);
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  async suggestQuestsForLabs(labIds: string[]): Promise<WorkshopQuest[]> {
    const contentService = getContentService();
    const allQuests = await contentService.getQuests();
    
    // Find quests that use any of the selected labs
    return allQuests.filter(quest => 
      quest.labIds.some(labId => labIds.includes(labId))
    );
  }

  async suggestFlagsForLabs(labIds: string[]): Promise<WorkshopFlag[]> {
    const contentService = getContentService();
    const allFlags = await contentService.getFlags();
    
    // For now, return all flags (in future, could map flags to labs)
    // This is a placeholder - flags could be associated with labs via metadata
    return allFlags;
  }

  /**
   * Order labs by prerequisites using topological sort
   * Labs without prerequisites come first
   */
  private orderLabsByPrerequisites(labs: WorkshopLabDefinition[]): string[] {
    const labMap = new Map(labs.map(l => [l.id, l]));
    const ordered: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (labId: string) => {
      if (visiting.has(labId)) {
        // Circular dependency detected, skip
        return;
      }
      if (visited.has(labId)) {
        return;
      }

      visiting.add(labId);
      const lab = labMap.get(labId);
      if (lab && lab.prerequisites) {
        lab.prerequisites.forEach(prereqId => {
          if (labMap.has(prereqId)) {
            visit(prereqId);
          }
        });
      }
      visiting.delete(labId);
      visited.add(labId);
      ordered.push(labId);
    };

    labs.forEach(lab => visit(lab.id));
    return ordered;
  }
}

let templateGeneratorInstance: TemplateGeneratorService | null = null;

export function getTemplateGeneratorService(): TemplateGeneratorService {
  if (!templateGeneratorInstance) {
    templateGeneratorInstance = new TemplateGeneratorServiceImpl();
  }
  return templateGeneratorInstance;
}
