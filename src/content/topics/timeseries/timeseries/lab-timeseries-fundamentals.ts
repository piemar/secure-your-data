import type { WorkshopLabDefinition } from '@/types';

/**
 * Lab 1: Timeseries Fundamentals
 *
 * Create a time series collection, insert measurements, query by time range and metadata,
 * and run a basic $group aggregation. Builds the foundation for Lab 2 (windowing).
 */
export const labTimeseriesFundamentalsDefinition: WorkshopLabDefinition = {
  id: 'lab-timeseries-fundamentals',
  topicId: 'timeseries',
  title: 'Lab 1: Timeseries Fundamentals',
  description:
    'Create time series collections, insert sensor-style measurements, and query and aggregate time series data.',
  difficulty: 'beginner',
  estimatedTotalTimeMinutes: 35,
  tags: ['timeseries', 'sensors', 'createCollection', 'queries', 'aggregation'],
  prerequisites: [
    'MongoDB Atlas M10+ or local MongoDB 5.0+',
    'mongosh installed; path configured in Workshop Settings so Run can execute mongosh blocks',
    'Node.js 18+ and optional .NET SDK for C# tab',
  ],
  requiredPrereqIds: ['atlas', 'mongosh', 'node', 'npm'],
  keyConcepts: [
    {
      term: 'Time series collection',
      explanation:
        'A collection created with createCollection and a timeseries option; data is stored in a columnar format for efficient time-ordered reads.',
    },
    {
      term: 'timeField',
      explanation: 'Required option: the document field that contains the date/timestamp for each measurement.',
    },
    {
      term: 'metaField',
      explanation:
        'Optional option: a field (e.g. sensorId) that identifies the source; used for metadata indexing and filtering.',
    },
    {
      term: 'granularity',
      explanation: 'Optional option (seconds, minutes, hours) that matches ingestion interval for storage optimization.',
    },
  ],
  whatYouWillBuild: [
    'A time series collection with timeField, metaField, and granularity',
    'Insert 200+ measurement documents with timestamp, sensorId, and temperature',
    'Query by time range and by metadata (sensorId)',
    'Run a $group aggregation to average temperature per sensor',
  ],
  keyInsight:
    'Time series collections are optimized for high-volume, time-ordered data and support efficient range and metadata queries plus aggregation.',
  steps: [
    {
      id: 'lab-timeseries-fundamentals-step-1',
      title: 'Create a time series collection',
      narrative:
        'Time series collections are created with db.createCollection() and a timeseries option. You must specify timeField (the field containing the date). Optionally specify metaField for metadata (e.g. sensorId) and granularity to match your ingestion interval. MongoDB creates a compound index on metaField + timeField automatically.',
      instructions:
        'Run the script to create a time series collection named "sensors" in the timeseries database. Use timeField "timestamp", metaField "sensorId", and granularity "seconds". Use the database name that includes the lab suffix (timeseries-YOUR_SUFFIX). Use Run all or Run selection to execute.',
      estimatedTimeMinutes: 5,
      points: 10,
      modes: ['lab', 'demo', 'challenge'],
      enhancementId: 'timeseries.create-collection',
      sourceProof: 'MongoDB Manual - Time Series',
      sourceSection: 'Create',
      hints: [
        'createCollection second argument is an options object with a timeseries key.',
        'timeseries must include timeField (string); metaField and granularity are optional.',
        'Use the DB_NAME constant so the suffix is applied.',
      ],
    },
    {
      id: 'lab-timeseries-fundamentals-step-2',
      title: 'Insert measurements',
      narrative:
        'Insert documents that match the time series schema: each document must have the timeField (timestamp) and can include the metaField (sensorId) and measurement fields. The lab drops the collection first, then inserts 200 documents so re-runs start clean.',
      instructions:
        'Complete the script to drop the collection (so re-runs are clean), then insert 200 measurement documents. Each document has timestamp, sensorId (sensor1/sensor2/sensor3), and temperature. Use the method that inserts many documents at once.',
      estimatedTimeMinutes: 5,
      points: 10,
      modes: ['lab', 'demo', 'challenge'],
      enhancementId: 'timeseries.insert-measurements',
      sourceProof: 'MongoDB Manual - Time Series',
      sourceSection: 'Insert',
      hints: [
        'Drop the collection before inserting so multiple runs do not duplicate data.',
        'Use the bulk insert method for arrays of documents.',
      ],
    },
    {
      id: 'lab-timeseries-fundamentals-step-3',
      title: 'Query by time range',
      narrative:
        'Query time series data by the timeField to retrieve measurements in a date range. Use a filter on the timestamp field with $gte and $lte (or $gt/$lt) for efficient range scans.',
      instructions:
        'Complete the find query to return documents where timestamp is between start and end (inclusive). Use the timeField name in the filter. Run the script and inspect the returned documents.',
      estimatedTimeMinutes: 5,
      points: 10,
      modes: ['lab', 'demo', 'challenge'],
      enhancementId: 'timeseries.query-range',
      sourceProof: 'MongoDB Manual - Time Series',
      sourceSection: 'Query',
      hints: [
        'Filter on the timeField (timestamp) with $gte and $lte.',
        'start and end are Date objects; use them in the query filter.',
      ],
    },
    {
      id: 'lab-timeseries-fundamentals-step-4',
      title: 'Query by metadata',
      narrative:
        'Filter by the metaField (e.g. sensorId) to get one sensor’s series. Combining metadata filters with time range improves efficiency.',
      instructions:
        'Complete the find query to return documents for a single sensor. Use the metaField name as the filter key and "sensor1" as the value.',
      estimatedTimeMinutes: 5,
      points: 10,
      modes: ['lab', 'demo', 'challenge'],
      enhancementId: 'timeseries.query-meta',
      sourceProof: 'MongoDB Manual - Time Series',
      sourceSection: 'Query',
      hints: [
        'The metaField you used when creating the collection is the key to filter on.',
        'Use the string "sensor1" as the value.',
      ],
    },
    {
      id: 'lab-timeseries-fundamentals-step-5',
      title: '$group by sensor',
      narrative:
        'Use an aggregation pipeline with $group to compute per-sensor metrics. Group by the metaField (e.g. _id: "$sensorId") and use $avg to average the temperature field.',
      instructions:
        'Complete the aggregation: $group with _id set to the sensor field (use $sensorId) and avgTemp using the $avg accumulator on the temperature field. Run and print the result.',
      estimatedTimeMinutes: 10,
      points: 15,
      modes: ['lab', 'demo', 'challenge'],
      enhancementId: 'timeseries.aggregate-basics',
      sourceProof: 'MongoDB Manual - Aggregation',
      sourceSection: '$group',
      hints: [
        '$group _id is the grouping key; use the metaField with $ prefix.',
        'Use $avg accumulator for the temperature field.',
      ],
    },
  ],
};
