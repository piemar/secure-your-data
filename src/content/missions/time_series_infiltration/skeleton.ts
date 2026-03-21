import { MissionSkeleton } from '@/lib/types';

export const skeleton: MissionSkeleton = {
    guided: `// MISSION: Time Series Infiltration
// Create and query time series collections for IoT sensor data

// Step 1: Create a time series collection
db.createCollection("sensor_readings", {
  timeseries: {
    timeField: "___BLANK___",
    metaField: "___BLANK___",
    granularity: "___BLANK___"
  }
});

// Step 2: Insert sensor readings
db.sensor_readings.insertMany([
  { timestamp: new Date(), metadata: { deviceId: "___BLANK___", type: "temperature" }, value: 22.5 },
  { timestamp: new Date(), metadata: { deviceId: "sensor-001", type: "___BLANK___" }, value: 1013.25 },
  { timestamp: new Date(), metadata: { deviceId: "sensor-002", type: "temperature" }, value: ___BLANK___ }
]);

// Step 3: Windowed aggregation with $dateTrunc
db.sensor_readings.aggregate([
  { $group: {
    _id: {
      device: "$metadata.deviceId",
      bucket: { $dateTrunc: { date: "$___BLANK___", unit: "___BLANK___" } }
    },
    avgValue: { $___BLANK___: "$value" },
    count: { $sum: 1 }
  }},
  { $sort: { "_id.bucket": 1 } }
]);

// Step 4: Anomaly detection — find readings above threshold
db.sensor_readings.aggregate([
  { $match: { value: { $___BLANK___: ___BLANK___ } } },
  { $project: { timestamp: 1, "metadata.deviceId": 1, value: 1, _id: 0 } }
]);
`,
    challenge: `// MISSION: Time Series Infiltration
// Work with time series collections for IoT data

// Create a time series collection with timeField, metaField, and granularity
// YOUR CODE HERE

// Insert at least 3 timestamped sensor readings with metadata
// YOUR CODE HERE

// Build a windowed aggregation grouping by device and time bucket
// YOUR CODE HERE

// Find anomalous readings above a threshold
// YOUR CODE HERE
`,
    expert: `// MISSION: Time Series Infiltration
// Create time series collections, insert IoT sensor data,
// run windowed aggregations with $dateTrunc, and detect anomalies.
`,
    hints: {
      guided: [
        { line: 7, blankText: '___BLANK___', hint: 'The field containing timestamps', answer: 'timestamp', xpPenalty: 20 },
        { line: 8, blankText: '___BLANK___', hint: 'The field containing device metadata', answer: 'metadata', xpPenalty: 20 },
        { line: 9, blankText: '___BLANK___', hint: 'Granularity: "seconds", "minutes", or "hours"', answer: 'minutes', xpPenalty: 20 },
        { line: 14, blankText: '___BLANK___', hint: 'Device identifier, e.g. "sensor-001"', answer: 'sensor-001', xpPenalty: 15 },
        { line: 15, blankText: '___BLANK___', hint: 'Sensor type: "pressure", "humidity", etc.', answer: 'pressure', xpPenalty: 15 },
        { line: 16, blankText: '___BLANK___', hint: 'A temperature value as a number', answer: '25.1', xpPenalty: 15 },
        { line: 24, blankText: '___BLANK___', hint: 'Date field name for $dateTrunc', answer: 'timestamp', xpPenalty: 20 },
        { line: 24, blankText: '___BLANK___', hint: 'Time bucket unit: "hour", "minute", "day"', answer: 'hour', xpPenalty: 20 },
        { line: 26, blankText: '___BLANK___', hint: 'Accumulator for average', answer: 'avg', xpPenalty: 20 },
        { line: 33, blankText: '___BLANK___', hint: 'Comparison operator for "greater than"', answer: 'gt', xpPenalty: 20 },
        { line: 33, blankText: '___BLANK___', hint: 'Threshold value, e.g. 30', answer: '30', xpPenalty: 15 },
      ],
      challenge: [
        { line: 4, blankText: '', hint: 'db.createCollection("name", { timeseries: { timeField: "...", metaField: "...", granularity: "..." } })', answer: '', xpPenalty: 30 },
        { line: 10, blankText: '', hint: 'Use $dateTrunc: { date: "$field", unit: "hour" } inside $group._id', answer: '', xpPenalty: 35 },
      ],
    },
  };
