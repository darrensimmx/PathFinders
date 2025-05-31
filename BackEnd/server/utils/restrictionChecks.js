const fs = require('fs');
const turf = require('@turf/turf');
const path = require('path');

const restrictedZones = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/restrictedZones.geojson'), 'utf8')
);

/**
 * Check if a single point is inside any restricted polygon
 * @param {{ lat: number, lng: number }} point
 * @returns {boolean}
 */
function isPointInRestrictedArea(point) {
  const turfPoint = turf.point([point.lng, point.lat]);
  return restrictedZones.features.some(zone =>
    turf.booleanPointInPolygon(turfPoint, zone)
  );
}

/**
 * Check if any point in a route intersects a restricted area
 * @param {Array<[number, number]>} coords - Array of [lng, lat] pairs
 * @returns {boolean}
 */
function isRouteInRestrictedArea(coords) {
  //console.log("coords: ", coords)
  return coords.some(([lng, lat]) =>
    isPointInRestrictedArea({ lng, lat })
  );
}

module.exports = {
  isPointInRestrictedArea,
  isRouteInRestrictedArea
};
