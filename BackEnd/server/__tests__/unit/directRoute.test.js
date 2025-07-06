/******************************************************* UNIT TEST*************************************************/ 


const generateDirectRoute = require('../../controllers/directRoute');
const generateLoopRoute = require('../../controllers/looproute');
const { getWalkingRoute } = require('../../utils/googleRequest');

jest.mock('../../controllers/looproute');
jest.mock('../../utils/googleRequest');

describe('generateDirectRoute', () => {
  const start = { lat: 1.0, lng: 103.0 };
  const end = { lat: 1.002, lng: 103.002 };

  const mockLoopCorners = {
    A: { lat: 1.0, lng: 103.0 },
    B: { lat: 1.001, lng: 103.0 },
    C: { lat: 1.001, lng: 103.001 },
    D: { lat: 1.0, lng: 103.001 }
  };

  beforeEach(() => {
    jest.clearAllMocks();

    getWalkingRoute.mockImplementation((from, to, waypoints = []) => {
      // Handle shortest route call
      if (!waypoints.length && from.lat === start.lat && to.lat === end.lat) {
        return Promise.resolve({
          coords: [[103.0, 1.0], [103.002, 1.002]],
          dist: 280 // meters
        });
      }

      // Handle D -> A segment
      if (!waypoints.length && from.lat === mockLoopCorners.D.lat && to.lat === mockLoopCorners.A.lat) {
        return Promise.resolve({
          coords: [[103.001, 1.0], [103.0, 1.0]],
          dist: 100
        });
      }

      // Final ABC -> End route
      if (waypoints.length === 2) {
        return Promise.resolve({
          coords: [[103.0, 1.0], [103.0, 1.001], [103.001, 1.001], [103.002, 1.002]],
          dist: 990
        });
      }

      return Promise.resolve({
        coords: [[103.0, 1.0], [103.002, 1.002]],
        dist: 1000
      });
    });

    generateLoopRoute.mockResolvedValue({
      type: 'rect-loop',
      geojson: {},
      actualDist: 1000,
      corners: mockLoopCorners
    });
  });

  it('returns shortest route when baseM is shorter than Google minimum', async () => {
    getWalkingRoute.mockResolvedValueOnce({
      coords: [[103.0, 1.0], [103.002, 1.002]],
      dist: 300
    });

    const result = await generateDirectRoute(start, end, 0.2); // target = 200m < 300m

    expect(result.type).toBe('shortest');
    expect(result.geojson.coordinates).toBeDefined();
    expect(result.warning).toContain('Minimum possible walking route');
  });

  it('returns a valid custom-direct route when all steps succeed', async () => {
    const result = await generateDirectRoute(start, end, 1.0);

    expect(result.type).toBe('custom-direct');
    expect(result.geojson).toBeDefined();
    expect(result.actualDist).toBeGreaterThan(0);
    expect(result.corners).toHaveProperty('A');
    expect(result.corners).toHaveProperty('B');
    expect(result.corners).toHaveProperty('C');
    expect(result.corners).toHaveProperty('end');
  });

  it('throws if Google returns invalid shortest route', async () => {
    getWalkingRoute.mockResolvedValueOnce(null);

    await expect(generateDirectRoute(start, end, 1.0)).rejects.toThrow(
      'Google API failed to return a valid shortest route'
    );
  });

  it('throws if D-A segment fails', async () => {
    getWalkingRoute
      .mockResolvedValueOnce({ coords: [[103, 1], [103.002, 1.002]], dist: 800 }) // shortest
      .mockResolvedValueOnce(null); // D-A

    await expect(generateDirectRoute(start, end, 1.0)).rejects.toThrow('Failed to calculate D - A distance');
  });

  it('throws if ABC-end route fails', async () => {
    getWalkingRoute
      .mockResolvedValueOnce({ coords: [[103, 1], [103.002, 1.002]], dist: 800 }) // shortest
      .mockResolvedValueOnce({ coords: [], dist: 100 }) // D-A
      .mockResolvedValueOnce({ coords: [], dist: 0, error: true }); // ABC-End

    await expect(generateDirectRoute(start, end, 1.0)).rejects.toThrow('Failed to generate adjusted A - B - C - End route');
  });
});