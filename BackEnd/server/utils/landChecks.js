// routeGeneration Feature
//BackEnd/server/utils/landChecks
//Here are the functions to check if the route is on land. Placed here to make code neater 
const turf = require('@turf/turf');
const fs = require('fs');
const path = require('path');

let landGeoJSON;

try {
  landGeoJSON = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/sgland.geojson'))
  );
} catch (err) {
  landGeoJSON = null; // for test override
}

function isOnLand(lat, lng, geoJSONOverride = null) { // for testing we add another param, set to null on actual usage
  const geo = geoJSONOverride || landGeoJSON;
  if (!geo) throw new Error('GeoJSON data not loaded');

  const pt = turf.point([lng, lat]);
  return turf.booleanPointInPolygon(pt, geo);
}

module.exports = { isOnLand };
