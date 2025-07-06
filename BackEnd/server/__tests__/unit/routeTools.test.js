/******************************************************* UNIT TEST*************************************************/ 

// First, declare and mock the inner helper
const mockSnapAndRouteRectangle = jest.fn(async () => ({
  coords: [[103.0, 1.0], [103.01, 1.01]],
  dist: 980,
  snappedCorners: [
    { lat: 1.0001, lng: 103.0001 },
    { lat: 1.0101, lng: 103.0001 },
    { lat: 1.0101, lng: 103.0101 },
    { lat: 1.0001, lng: 103.0101 }
  ]
}));

// Mocks BEFORE imports
jest.mock('../../utils/geoUtils', () => ({
  metreToDeg: jest.fn(() => ({ dLat: 0.001, dLng: 0.0012 })),
  rectangleCorners: jest.fn((origin, dh, dw, signH, signW) => ([
    origin,
    { lat: origin.lat + dh * signH, lng: origin.lng },
    { lat: origin.lat + dh * signH, lng: origin.lng + dw * signW },
    { lat: origin.lat, lng: origin.lng + dw * signW }
  ])),
  haversineDistance: jest.fn(() => 5)
}));

jest.mock('../../utils/googleRequest', () => ({
  snapToWalkingPath: jest.fn((lat, lng) => Promise.resolve({ lat: lat + 0.0001, lng: lng + 0.0001 })),
  getWalkingRoute: jest.fn(() => Promise.resolve({
    coords: [[103.0, 1.0], [103.01, 1.01]],
    dist: 980
  }))
}));

jest.mock('../../utils/landChecks', () => ({
  isOnLand: jest.fn(() => true)
}));

jest.mock('../../utils/restrictionChecks', () => ({
  isRouteInRestrictedArea: jest.fn(() => false)
}));

// Patch snapAndRouteRectangle directly onto the module
const routeTools = require('../../utils/routeTools');
routeTools.snapAndRouteRectangle = mockSnapAndRouteRectangle;

// Now import test targets
const { snapRectangleLoop } = routeTools;
const { snapToWalkingPath, getWalkingRoute } = require('../../utils/googleRequest');
const { metreToDeg, rectangleCorners, haversineDistance } = require('../../utils/geoUtils');
const { isOnLand } = require('../../utils/landChecks');

describe('snapRectangleLoop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Math, 'random').mockReturnValue(0.5); // deterministic h
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return best rectangle route when all paths succeed', async () => {
    const start = { lat: 1.0, lng: 103.0 };
    const totalM = 1000;

    const result = await snapRectangleLoop(start, totalM);

    expect(result).toHaveProperty('corners');
    expect(Array.isArray(result.corners)).toBe(true);
    expect(result.corners.length).toBe(4);

    expect(snapToWalkingPath).toHaveBeenCalledTimes(4 * 4);
    expect(getWalkingRoute).toHaveBeenCalledTimes(4);
  });

  it('should throw error if all orientations fail', async () => {
    // Make snap fail so that no orientation succeeds
    snapToWalkingPath.mockResolvedValue(null);

    const start = { lat: 1.0, lng: 103.0 };
    const totalM = 1000;

    await expect(snapRectangleLoop(start, totalM)).rejects.toThrow('No valid rectangle route found');
  });
});
