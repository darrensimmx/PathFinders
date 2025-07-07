const generateDirectRoute = require('../../controllers/directRoute');

jest.mock('../../utils/googleRequest', () => ({
  getWalkingRoute: jest.fn((start, end, waypoints = []) => Promise.resolve({
    coords: [start, ...waypoints, end],
    dist: 1000
  })),
  snapToWalkingPath: jest.fn((lat, lng) => Promise.resolve({ lat: lat + 0.0001, lng: lng + 0.0001 }))
}));

jest.mock('../../utils/geoUtils', () => ({
  metreToDeg: jest.fn(() => ({ dLat: 0.001, dLng: 0.0012 })),
  rectangleCorners: jest.fn((origin, dh, dw, signH, signW) => [
    origin,
    { lat: origin.lat + dh * signH, lng: origin.lng },
    { lat: origin.lat + dh * signH, lng: origin.lng + dw * signW },
    { lat: origin.lat, lng: origin.lng + dw * signW }
  ]),
  haversineDistance: jest.fn(() => 5)
}));

jest.mock('../../utils/landChecks', () => ({
  isOnLand: jest.fn(() => true)
}));

jest.mock('../../utils/restrictionChecks', () => ({
  isRouteInRestrictedArea: jest.fn(() => false)
}));

describe('Integration: generateDirectRoute', () => {
  it('generates a valid direct route with fallback loop', async () => {
    const start = { lat: 1.0, lng: 103.0 };
    const end = { lat: 1.005, lng: 103.005 };

    const result = await generateDirectRoute(start, end, 1); // 1km

    expect(result).toHaveProperty('geojson');
    expect(result.geojson.type).toBe('LineString');
    expect(Array.isArray(result.geojson.coordinates)).toBe(true);
    expect(result.actualDist).toBeGreaterThan(0);
  });
});
