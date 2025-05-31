const turf = require('@turf/turf');
const fs = require('fs');
const path = require('path');

const landGeoJSON = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/sgland.geojson'))
);

function isOnLand(lat, lng) {
  const pt = turf.point([lng, lat]);
  return turf.booleanPointInPolygon(pt, landGeoJSON);
}

module.exports = { isOnLand };
