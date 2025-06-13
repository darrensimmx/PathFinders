// routeGeneration Feature
//utils/geoUtils.js to store fns for geographic distance calculator

// Convert metres to degrees latitude/longitude at a given latitude, formula is derived from 
// WGS-84 standard for radius approximations
function metreToDeg(m, lat) {
  const latConv = 111132.92 - 559.82 * Math.cos(2 * lat * Math.PI / 180);
  const lngConv = 111412.84 * Math.cos(lat * Math.PI / 180);
  return { dLat: m / latConv, dLng: m / lngConv };
}


// Build rectangle corners for given height (dh), width (dw), and sign offsets (signH & signW)
function rectangleCorners(origin, dh, dw, signH, signW) { //To Be Improved in the future
  // A starting point
  const A = { ...origin };
  // B offset of A vertically by scale of dh and direction of signH
  const B = { lat: origin.lat + dh * signH, lng: origin.lng };
  // C offset of B horizontally by scale of dw and direction of signW
  const C = { lat: B.lat, lng: origin.lng + dw * signW };
  // D connects back to A horizontally by scale of dw and direction of signW
  const D = { lat: origin.lat, lng: origin.lng + dw * signW };
  return [A, B, C, D];
}

//calculate distance between 2 points on earth spheriphically, not straight line A - B
function haversineDistance(a, b) {
  // Haversine Formula
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