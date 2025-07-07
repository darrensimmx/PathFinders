/******************************************************* UNIT TEST*************************************************/ 

const generateLoopRoute = require('../../controllers/looproute');
const { snapRectangleLoop } = require('../../utils/routeTools');

// Mock snapRectangleLoop
jest.mock('../../utils/routeTools', () => ({
  snapRectangleLoop: jest.fn()
}));

describe('generateLoopRoute', () => {
  const start = { lat: 1.0, lng: 103.0 };
  const mockCorners = [
    { lat: 1.0001, lng: 103.0001 },
    { lat: 1.0002, lng: 103.0002 },
    { lat: 1.0003, lng: 103.0003 },
    { lat: 1.0004, lng: 103.0004 },
  ];

  const mockRoute = {
    coords: [[103.0001, 1.0001], [103.0002, 1.0002]],
    dist: 995
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return correct loop route with corners if valid', async () => {
    snapRectangleLoop.mockResolvedValue({ route: mockRoute, corners: mockCorners });

    const result = await generateLoopRoute(start, 1, { returnCorners: true });

    expect(result).toEqual({
      type: 'rect-loop',
      geojson: { type: 'LineString', coordinates: mockRoute.coords },
      actualDist: mockRoute.dist,
      corners: {
        A: mockCorners[0],
        B: mockCorners[1],
        C: mockCorners[2],
        D: mockCorners[3]
      }
    });

    expect(snapRectangleLoop).toHaveBeenCalledWith(start, 1000);
  });

  it('should throw error if any corner is missing or invalid', async () => {
    const badCorners = [null, undefined, { lat: NaN, lng: 103 }, { lat: 1, lng: NaN }];
    snapRectangleLoop.mockResolvedValue({ route: mockRoute, corners: badCorners });

    await expect(generateLoopRoute(start, 1)).rejects.toThrow('generateLoopRoute failed: Invalid corners');
  });

  it('should throw error if route is malformed', async () => {
    snapRectangleLoop.mockResolvedValue({ route: { coords: null, dist: null }, corners: mockCorners });

    await expect(generateLoopRoute(start, 1)).rejects.toThrow('generateLoopRoute failed: Invalid route');
  });
});
