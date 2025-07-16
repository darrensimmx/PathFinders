// Unit tests for waypoint validation and processing logic
const request = require('supertest');

// Mock external dependencies that require network access
jest.mock('../../utils/googleRequest', () => ({
  getWalkingRoute: jest.fn()
}));

jest.mock('../../controllers/looproute', () => jest.fn());

jest.mock('../../utils/geoUtils', () => ({
  geocodePlace: jest.fn(),
  haversineDistance: jest.fn()
}));

jest.mock('../../utils/weatherCheck', () => ({
  sampleEvery2km: jest.fn(() => []),
  getWeatherWarnings: jest.fn(() => [])
}));

const { geocodePlace, haversineDistance } = require('../../utils/geoUtils');
const { getWalkingRoute } = require('../../utils/googleRequest');
const generateLoopRoute = require('../../controllers/looproute');

// Import the app
const app = require('../../app');

describe('[UNIT] Waypoint Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    haversineDistance.mockReturnValue(100); // 100 meters
    geocodePlace.mockResolvedValue({ lat: 1.3010, lng: 103.8730 });
    getWalkingRoute.mockResolvedValue({
      coords: [[103.8725, 1.3008], [103.8730, 1.3010]],
      dist: 100
    });
    generateLoopRoute.mockResolvedValue({
      type: 'rect-loop',
      geojson: { 
        type: 'LineString', 
        coordinates: [
          [103.8725, 1.3008],
          [103.8730, 1.3010],
          [103.8735, 1.3012],
          [103.8725, 1.3008]
        ] 
      },
      actualDist: 1000
    });
  });

  it('should accept coordinate waypoints', async () => {
    const response = await request(app)
      .post('/api/route')
      .send({
        routeType: 'direct',
        start: { lat: 1.3008, lng: 103.8725 },
        waypoints: [
          { lat: 1.3010, lng: 103.8730 },
          { lat: 1.3015, lng: 103.8735 }
        ],
        end: { lat: 1.2992, lng: 103.8739 },
        distance: 2
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(getWalkingRoute).toHaveBeenCalled();
  });

  it('should geocode string waypoints', async () => {
    const response = await request(app)
      .post('/api/route')
      .send({
        routeType: 'direct',
        start: { lat: 1.3008, lng: 103.8725 },
        waypoints: [
          'Marina Bay Sands',
          'Gardens by the Bay'
        ],
        end: { lat: 1.2992, lng: 103.8739 },
        distance: 2
      });

    expect(response.status).toBe(200);
    expect(geocodePlace).toHaveBeenCalledWith('Marina Bay Sands');
    expect(geocodePlace).toHaveBeenCalledWith('Gardens by the Bay');
  });

  it('should reject invalid coordinate ranges', async () => {
    const response = await request(app)
      .post('/api/route')
      .send({
        routeType: 'direct',
        start: { lat: 1.3008, lng: 103.8725 },
        waypoints: [
          { lat: 200, lng: 103.8730 } // Invalid latitude > 90
        ],
        end: { lat: 1.2992, lng: 103.8739 },
        distance: 2
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('InvalidWaypoint');
    expect(response.body.message).toContain('out-of-range coordinates');
  });

  it('should reject fallback CBD coordinates', async () => {
    // Mock geocoding to return fallback CBD coordinates
    geocodePlace.mockResolvedValue({ lat: 1.3521, lng: 103.8198 });

    const response = await request(app)
      .post('/api/route')
      .send({
        routeType: 'direct',
        start: { lat: 1.3008, lng: 103.8725 },
        waypoints: ['Unknown Location'],
        end: { lat: 1.2992, lng: 103.8739 },
        distance: 2
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('InvalidWaypoint');
    expect(response.body.message).toContain('Could not locate waypoint');
  });

  it('should handle geocoding failures', async () => {
    // Mock geocoding to return undefined (failed)
    geocodePlace.mockResolvedValue(undefined);

    const response = await request(app)
      .post('/api/route')
      .send({
        routeType: 'direct',
        start: { lat: 1.3008, lng: 103.8725 },
        waypoints: ['Unknown Location'],
        end: { lat: 1.2992, lng: 103.8739 },
        distance: 2
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('InvalidWaypoint');
    expect(response.body.message).toContain('Could not resolve waypoint');
  });

  it('should preserve loop route functionality', async () => {
    const response = await request(app)
      .post('/api/route')
      .send({
        routeType: 'loop',
        start: { lat: 1.3008, lng: 103.8725 },
        distance: 1
      });

    console.log('Loop response:', response.status, response.body);
    expect(response.status).toBe(200);
    expect(generateLoopRoute).toHaveBeenCalledWith({ lat: 1.3008, lng: 103.8725 }, 1);
    // Should not call getWalkingRoute for loop routes
    expect(getWalkingRoute).not.toHaveBeenCalled();
  });
});