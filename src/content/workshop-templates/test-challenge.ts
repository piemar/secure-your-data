import { WorkshopTemplate } from '@/types';

/**
 * Test Challenge Challenge Template
 * 
 * Description of this challenge scenario.
 */
export const templatetestchallenge: WorkshopTemplate = {
  id: 'template-test-challenge',
  name: 'Test Challenge',
  description: 'Description of this challenge scenario',
  industry: 'retail', // 'retail' | 'financial' | 'healthcare' | 'general'
  topicIds: [
    'encryption'
  ],
  labIds: [
    'lab-test-lab'
  ],
  questIds: [
    'quest-test-quest'
  ],
  defaultMode: 'challenge',
  allowedModes: ['challenge', 'lab'],
  gamification: {
    enabled: true,
    basePointsPerStep: 10,
    bonusPointsPerFlag: 25,
    bonusPointsPerQuest: 50,
    achievements: [
      {
        id: 'achievement-example',
        name: 'Example Achievement',
        description: 'Description of achievement',
        icon: '🏆'
      }
    ]
  },
  storyIntro: `# Test Challenge

## The Challenge

Describe the scenario, situation, and stakes here.

### Your Mission

What participants need to accomplish.`,
  storyOutro: `# Challenge Complete! 🎉

Congratulations! You've successfully completed the challenge.

## What You Accomplished

- Achievement 1
- Achievement 2
- Achievement 3

## Impact

Describe the impact and next steps.`
};
