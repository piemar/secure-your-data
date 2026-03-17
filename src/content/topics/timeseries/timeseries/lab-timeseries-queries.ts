import type { WorkshopLabDefinition } from '@/types';

/**
 * Lab 2: Timeseries Queries and Windowing
 *
 * Builds on Lab 1. Covers $match/$sort, $setWindowFields with $expMovingAvg and gap fill
 * ($linearFill/$locf), and $group summary. Uses the same sensors collection.
 */
export const labTimeseriesQueriesDefinition: WorkshopLabDefinition = {
  id: 'lab-timeseries-queries',
  topicId: 'timeseries',
  title: 'Lab 2: Timeseries Queries and Windowing',
  description:
    'Filter and sort time series data, compute rolling metrics with $setWindowFields, fill gaps, and summarize with $group.',
  difficulty: 'intermediate',
  estimatedTotalTimeMinutes: 40,
  tags: ['timeseries', 'aggregation', '$setWindowFields', '$expMovingAvg', '$linearFill', '$locf'],
  prerequisites: [
    'Complete Lab 1: Timeseries Fundamentals, or have a time series collection "sensors" with measurements (timestamp, sensorId, temperature) in database timeseries-<suffix>.',
    'mongosh installed; path configured in Workshop Settings so Run can execute mongosh blocks.',
  ],
  requiredPrereqIds: ['atlas', 'mongosh', 'node', 'npm'],
  keyConcepts: [
    { term: '$setWindowFields', explanation: 'Aggregation stage that computes window-based values (e.g. moving average) over ordered documents.' },
    { term: '$expMovingAvg', explanation: 'Window function that computes exponential moving average; recent values weighted more.' },
    { term: '$linearFill', explanation: 'Fills nulls in a field with linear interpolation between known values.' },
    { term: '$locf', explanation: 'Last observation carried forward: fills nulls with the last non-null value.' },
  ],
  whatYouWillBuild: [
    'A pipeline that filters by sensor and sorts by time',
    'Rolling exponential moving average with $expMovingAvg',
    'Gap-filled output with $linearFill',
    'Per-sensor summary with $group ($avg, $sum)',
  ],
  keyInsight:
    'Windowing and gap-fill operators let you run analytics directly on time series data without moving it to another system.',
  steps: [
    {
      id: 'lab-timeseries-queries-step-1',
      title: '$match and $sort',
      narrative:
        'Reduce the dataset to one sensor and sort by time so downstream stages see time-ordered documents. $match and $sort are standard aggregation stages.',
      instructions:
        'Complete the aggregation: first stage filters documents where sensorId is "sensor1"; second stage sorts by timestamp ascending (1). Use the correct stage names.',
      estimatedTimeMinutes: 5,
      points: 10,
      modes: ['lab', 'demo', 'challenge'],
      enhancementId: 'timeseries.match-sort',
      sourceProof: 'MongoDB Manual - Aggregation',
      sourceSection: '$match, $sort',
      hints: [
        'Stage to filter documents by a field value.',
        'Stage to order documents by a field (e.g. timestamp: 1).',
      ],
    },
    {
      id: 'lab-timeseries-queries-step-2',
      title: '$setWindowFields and $expMovingAvg',
      narrative:
        '$setWindowFields runs computations over a sliding or expanding window. $expMovingAvg computes an exponential moving average over a numeric field (e.g. temperature), weighting recent values more.',
      instructions:
        'Complete the pipeline: use $setWindowFields with sortBy { timestamp: 1 }, and in output add tempExpAvg using $expMovingAvg with input set to the temperature field and N: 5.',
      estimatedTimeMinutes: 10,
      points: 15,
      modes: ['lab', 'demo', 'challenge'],
      enhancementId: 'timeseries.window-exp-moving-avg',
      sourceProof: 'MongoDB Manual - $setWindowFields',
      sourceSection: '$expMovingAvg',
      hints: [
        'input in $expMovingAvg is the field path (e.g. "$temperature").',
        'N is the window size in number of documents.',
      ],
    },
    {
      id: 'lab-timeseries-queries-step-3',
      title: 'Gap fill with $linearFill',
      narrative:
        'When measurements have gaps (nulls), use $linearFill to interpolate between known values or $locf to carry the last observation forward.',
      instructions:
        'Complete the $setWindowFields output: add tempFilled using the gap-fill operator that does linear interpolation (fill in the operator name).',
      estimatedTimeMinutes: 8,
      points: 10,
      modes: ['lab', 'demo', 'challenge'],
      enhancementId: 'timeseries.window-gap-fill',
      sourceProof: 'MongoDB Manual - $setWindowFields',
      sourceSection: 'Gap fill',
      hints: [
        'Operator that fills nulls with linear interpolation between values.',
        'Alternative is $locf (last observation carried forward).',
      ],
    },
    {
      id: 'lab-timeseries-queries-step-4',
      title: '$group summary',
      narrative:
        'Summarize per sensor with $group: group by sensorId and use $avg for average temperature and $sum for count.',
      instructions:
        'Complete the $group stage: _id "$sensorId", avgTemp using $avg on temperature, and count using $sum: 1.',
      estimatedTimeMinutes: 7,
      points: 10,
      modes: ['lab', 'demo', 'challenge'],
      enhancementId: 'timeseries.group-summary',
      sourceProof: 'MongoDB Manual - $group',
      sourceSection: '$group',
      hints: [
        'Accumulator for average of a field is $avg.',
        'Use $sum: 1 to count documents per group.',
      ],
    },
    {
      id: 'lab-timeseries-queries-step-5',
      title: 'Recap: match, sort, window, group',
      narrative:
        'Combine the patterns: filter one sensor, sort by time, add a window field (e.g. exponential moving average), then $group by sensor. This is a typical analytics pipeline for time series.',
      instructions:
        'Run the full pipeline: $match (sensor1), $sort (timestamp: 1), $setWindowFields (tempExpAvg with $expMovingAvg on temperature), then $group by sensorId with $avg temperature. Use the same DB and collection as in Lab 1 (timeseries-<suffix>.sensors).',
      estimatedTimeMinutes: 10,
      points: 15,
      modes: ['lab', 'demo', 'challenge'],
      enhancementId: 'timeseries.summary',
      sourceProof: 'MongoDB Manual - Time Series, Aggregation',
      sourceSection: 'Windowing',
      hints: [
        'Metric field for $expMovingAvg is the same as in Step 2.',
        'Order: $match → $sort → $setWindowFields → $group.',
      ],
    },
  ],
};
