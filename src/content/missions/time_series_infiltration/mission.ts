import { Mission } from '@/lib/types';

export const mission: Mission = {
    id: 'mission-18',
    title: 'Time Series Infiltration',
    codename: 'TIMESERIES',
    tier: 'infiltration',
    description: 'Create time series collections for IoT sensor data, insert timestamped documents, and run windowed aggregations.',
    briefing: `TEMPORAL INTELLIGENCE\n\nSensor data is flooding in from 10,000 IoT devices — temperature, pressure, humidity. Each reading is timestamped and tagged with a device ID. Your mission: create a time series collection with proper metadata and granularity, insert sensor readings, then build windowed aggregations to detect anomalies across time buckets.\n\nTime waits for no agent.`,
    objectives: [
      { id: 'obj-18-1', text: 'Create a time series collection with timeField and metaField', completed: false },
      { id: 'obj-18-2', text: 'Insert timestamped sensor readings', completed: false },
      { id: 'obj-18-3', text: 'Build windowed aggregation with $dateTrunc', completed: false },
      { id: 'obj-18-4', text: 'Detect anomalies using $avg and threshold comparison', completed: false },
    ],
    timeLimit: 600,
    xpReward: 800,
    difficulty: 3,
    topic: 'analytics',
    povCapabilities: ['TIME-SERIES'],
    chaosEvents: [
      { id: 'chaos-18-1', title: '📡 SENSOR FLOOD', description: 'Data ingestion rate tripled! Collection growing faster than expected.', triggerAt: 200, penalty: 150, duration: 60 },
    ],
  };
