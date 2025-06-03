//BackEnd/server/utils/landChecks
//Here are the functions to check if the route is on land. Placed here to make code neater 
const turf = require('@turf/turf');
const fs = require('fs');
const path = require('path');

const landGeoJSON = JSON.parse(
  //got from official website the land geojson data to cross check to
  fs.readFileSync(path.join(__dirname, '../data/sgland.geojson'))
);

function isOnLand(lat, lng) {
  const pt = turf.point([lng, lat]);
  return turf.booleanPointInPolygon(pt, landGeoJSON);
}

module.exports = { isOnLand };
