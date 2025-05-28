//utils/geoUtils.js to store fns for geographic distance calculator

//metre to degree
// Convert metres to degrees latitude/longitude at a given latitude
function metreToDeg(m, lat) {
  const latConv = 111132.92 - 559.82 * Math.cos(2 * lat * Math.PI / 180);
  const lngConv = 111412.84 * Math.cos(lat * Math.PI / 180);
  return { dLat: m / latConv, dLng: m / lngConv };
}

//rectangle corners
// Build rectangle corners for given h, w, and sign offsets
function rectangleCorners(origin, dh, dw, signH, signW) {
  const A = { ...origin };
  const B = { lat: origin.lat + dh * signH, lng: origin.lng };
  const C = { lat: B.lat,           lng: origin.lng + dw * signW };
  const D = { lat: origin.lat,      lng: origin.lng + dw * signW };
  return [A, B, C, D];
}

//haversineDistance
//calculate distance between 2 points
function haversineDistance(a, b) {
  const R = 6371000; // Earth radius in meters
  const toRad = deg => deg * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const aVal = Math.sin(dLat/2) ** 2 +
               Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng/2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
  return R * c;
}

module.exports = {
    metreToDeg,
    rectangleCorners,
    haversineDistance
}