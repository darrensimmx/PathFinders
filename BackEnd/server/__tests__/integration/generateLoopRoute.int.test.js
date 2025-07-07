const generateLoopRoute = require('../../controllers/looproute');

jest.mock('../../utils/googleRequest', () => ({
  getWalkingRoute: jest.fn(() => Promise.resolve({
    coords: [
      [103.0001, 1.0001],
      [103.0101, 1.0001],
      [103.0101, 1.0101],
      [103.0001, 1.0101],
      [103.0001, 1.0001]
    ],
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

describe('[INTEGRATION] generateLoopRoute', () => {
  it('returns a valid rectangle loop route with corners', async () => {
    const start = { lat: 1.0, lng: 103.0 };
    const dist = 1; // km

    const result = await generateLoopRoute(start, dist, { returnCorners: true });

    expect(result).toHaveProperty('type', 'rect-loop');
    expect(result).toHaveProperty('geojson');
    expect(result.geojson.type).toBe('LineString');
    expect(Array.isArray(result.geojson.coordinates)).toBe(true);
    expect(result).toHaveProperty('actualDist');
    expect(typeof result.actualDist).toBe('number');
    expect(result.actualDist).toBeGreaterThan(0);
    expect(result).toHaveProperty('corners');
    expect(Object.keys(result.corners)).toEqual(['A', 'B', 'C', 'D']);
  });
});
