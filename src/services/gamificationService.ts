import { WorkshopGamificationConfig, WorkshopScoreEntry } from '@/types';

export interface GamificationEvent {
  type: 'step_completed' | 'flag_captured' | 'quest_completed' | 'lab_completed';
  participantId: string;
  labId?: string;
  stepId?: string;
  flagId?: string;
  questId?: string;
  assisted?: boolean;
  timestamp: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon?: string;
  unlockedAt?: Date;
}

/**
 * GamificationService handles scoring, achievements, and leaderboards
 * for the workshop framework.
 * 
 * CURRENT IMPLEMENTATION: Uses existing leaderboard utilities and localStorage.
 * FUTURE: Will integrate with backend MongoDB for persistent storage.
 */
export class GamificationService {
  private config: WorkshopGamificationConfig;

  constructor(config: WorkshopGamificationConfig) {
    this.config = config;
  }

  /**
   * Calculate points for a gamification event based on the config.
   */
  calculatePoints(event: GamificationEvent): number {
    if (!this.config.enabled) {
      return 0;
    }

    switch (event.type) {
      case 'step_completed':
        const basePoints = this.config.basePointsPerStep || 10;
        return event.assisted ? Math.floor(basePoints / 2) : basePoints;
      
      case 'flag_captured':
        return this.config.bonusPointsPerFlag || 25;
      
      case 'quest_completed':
        return this.config.bonusPointsPerQuest || 50;
      
      case 'lab_completed':
        // Lab completion bonus: sum of all step points + bonus
        return (this.config.basePointsPerStep || 10) * 5; // Rough estimate
      
      default:
        return 0;
    }
  }

  /**
   * Record a gamification event and update scores.
   * 
   * Currently integrates with existing leaderboardUtils.
   * In future phases, this will be backend-driven.
   */
  async recordEvent(event: GamificationEvent): Promise<number> {
    const points = this.calculatePoints(event);
    
    if (points > 0 && event.participantId) {
      // Integrate with existing leaderboard system
      // This is a bridge to the current implementation
      if (event.type === 'step_completed' && event.labId) {
        const labNumber = this.extractLabNumber(event.labId);
        if (labNumber) {
          // Use existing leaderboard utilities
          const { addPoints } = await import('@/utils/leaderboardUtils');
          addPoints(event.participantId, points, labNumber);
        }
      } else if (event.type === 'flag_captured' && event.flagId) {
        // Record flag capture
        const { addPoints } = await import('@/utils/leaderboardUtils');
        // Use lab 0 as a special "challenge" lab for flags
        addPoints(event.participantId, points, 0);
        
        // Store flag capture in localStorage for now
        const capturedFlags = JSON.parse(
          localStorage.getItem('captured_flags') || '[]'
        );
        if (!capturedFlags.includes(event.flagId)) {
          capturedFlags.push(event.flagId);
          localStorage.setItem('captured_flags', JSON.stringify(capturedFlags));
        }
      } else if (event.type === 'quest_completed' && event.questId) {
        // Record quest completion
        const { addPoints } = await import('@/utils/leaderboardUtils');
        addPoints(event.participantId, points, 0);
        
        // Store quest completion in localStorage
        const completedQuests = JSON.parse(
          localStorage.getItem('completed_quests') || '[]'
        );
        if (!completedQuests.includes(event.questId)) {
          completedQuests.push(event.questId);
          localStorage.setItem('completed_quests', JSON.stringify(completedQuests));
        }
      }
    }

    return points;
  }

  /**
   * Get current score entry for a participant.
   */
  async getScoreEntry(participantId: string): Promise<WorkshopScoreEntry | null> {
    // For now, construct from localStorage and leaderboard data
    // In future, this will query backend MongoDB
    const completedLabs = this.getCompletedLabs(participantId);
    const totalPoints = this.getTotalPoints(participantId);

    return {
      participantId,
      totalPoints,
      completedLabIds: completedLabs.map(l => `lab-${l}`),
      completedQuestIds: [],
      capturedFlagIds: [],
    };
  }

  /**
   * Get achievements for a participant.
   */
  async getAchievements(participantId: string): Promise<Achievement[]> {
    const achievements: Achievement[] = [];
    const completedLabs = this.getCompletedLabs(participantId);

    // Lab completion achievements
    if (completedLabs.length >= 1) {
      achievements.push({
        id: 'first-lab',
        name: 'First Steps',
        description: 'Completed your first lab',
        unlockedAt: new Date(),
      });
    }

    if (completedLabs.length >= 3) {
      achievements.push({
        id: 'all-labs',
        name: 'Lab Master',
        description: 'Completed all labs',
        unlockedAt: new Date(),
      });
    }

    return achievements;
  }

  /**
   * Check if gamification is enabled.
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Update gamification configuration.
   */
  updateConfig(config: Partial<WorkshopGamificationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Helper methods (bridge to existing localStorage-based system)

  private getCompletedLabs(participantId: string): number[] {
    const saved = localStorage.getItem('completedLabs');
    return saved ? JSON.parse(saved) : [];
  }

  private getTotalPoints(participantId: string): number {
    // This would ideally come from backend/leaderboard
    // For now, estimate from localStorage
    const saved = localStorage.getItem('currentScore');
    return saved ? parseInt(saved, 10) : 0;
  }

  private extractLabNumber(labId: string): number | null {
    const match = labId.match(/lab-?(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  }
}

/**
 * Factory for creating GamificationService instances.
 */
export function createGamificationService(
  config: WorkshopGamificationConfig
): GamificationService {
  return new GamificationService(config);
}
