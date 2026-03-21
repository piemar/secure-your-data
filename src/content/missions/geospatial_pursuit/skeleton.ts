import { MissionSkeleton } from '@/lib/types';

export const skeleton: MissionSkeleton = {
    guided: `// MISSION: Geospatial Pursuit
// Collection: assets — track operatives with GPS coordinates

// Step 1: Create a 2dsphere index
db.assets.createIndex({ ___BLANK___: "___BLANK___" });

// Step 2: Find assets within 5km of target point
db.assets.aggregate([
  { $geoNear: {
    near: { type: "Point", coordinates: [___BLANK___, ___BLANK___] },
    distanceField: "___BLANK___",
    maxDistance: ___BLANK___,
    spherical: true
  }}
]);

// Step 3: Find all assets within a polygon zone
db.assets.find({
  location: {
    $geoWithin: {
      $geometry: {
        type: "___BLANK___",
        coordinates: [[
          [___BLANK___, ___BLANK___],
          [___BLANK___, ___BLANK___],
          [___BLANK___, ___BLANK___],
          [___BLANK___, ___BLANK___]
        ]]
      }
    }
  }
});

// Step 4: Combine geo + regular filters
db.assets.find({
  location: { $geoWithin: { $centerSphere: [[___BLANK___, ___BLANK___], ___BLANK___] } },
  status: "___BLANK___"
});
`,
    challenge: `// MISSION: Geospatial Pursuit
// Collection: assets with location field (GeoJSON Point)

// Create a 2dsphere index on the location field
// YOUR CODE HERE

// Use $geoNear in an aggregation to find assets within 5km of a point
// YOUR CODE HERE

// Use $geoWithin with a $geometry Polygon to find assets in a zone
// YOUR CODE HERE

// Combine geo query with a status filter
// YOUR CODE HERE
`,
    expert: `// MISSION: Geospatial Pursuit
// Demonstrate 2dsphere indexing, $geoNear, $geoWithin with Polygon,
// and combined geo + non-geo queries on the assets collection.
`,
    hints: {
      guided: [
        { line: 5, blankText: '___BLANK___', hint: 'The field containing GeoJSON data', answer: 'location', xpPenalty: 20 },
        { line: 5, blankText: '___BLANK___', hint: 'Index type for geographic data', answer: '2dsphere', xpPenalty: 25 },
        { line: 10, blankText: '___BLANK___', hint: 'Longitude, Latitude — e.g. -73.97, 40.77 (NYC)', answer: '-73.97, 40.77', xpPenalty: 20 },
        { line: 11, blankText: '___BLANK___', hint: 'Field name to store calculated distance', answer: 'dist.calculated', xpPenalty: 20 },
        { line: 12, blankText: '___BLANK___', hint: '5km in meters = 5000', answer: '5000', xpPenalty: 15 },
        { line: 23, blankText: '___BLANK___', hint: 'GeoJSON shape type for an area', answer: 'Polygon', xpPenalty: 25 },
      ],
      challenge: [
        { line: 7, blankText: '', hint: '$geoNear: { near: { type: "Point", coordinates: [lng, lat] }, distanceField: "...", maxDistance: N }', answer: '', xpPenalty: 35 },
      ],
    },
  };
