const fs = require('fs');
const turf = require('@turf/turf');
const path = require('path');

const restrictedZones = JSON.parse(
  //read from restrictedZones geojson file that we manually drew the areas
  fs.readFileSync(path.join(__dirname, '../data/restrictedZones.geojson'), 'utf8')
);

// Check if any point is inside of any restricted polygon
// rtype point: {lat, lng}
// rtype of fn: boolean
function isPointInRestrictedArea(point) {
  //console.log(point)
  const turfPoint = turf.point([point.lng, point.lat]);
  // as long as some zone is in polygon, return false
  return restrictedZones.features.some(zone =>
    turf.booleanPointInPolygon(turfPoint, zone)
  );
}

function isRouteInRestrictedArea(coords) {
  //console.log("coords: ", coords) //debug
  return coords.some(([lng, lat]) =>
    isPointInRestrictedArea({ lng, lat })
  );
}

module.exports = {
  isPointInRestrictedArea,
  isRouteInRestrictedArea
};
