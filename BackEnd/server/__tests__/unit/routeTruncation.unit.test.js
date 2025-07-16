// Unit tests for route truncation logic
const request = require('supertest');

// Mock external dependencies
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

const { haversineDistance } = require('../../utils/geoUtils');
const { getWalkingRoute } = require('../../utils/googleRequest');
const generateLoopRoute = require('../../controllers/looproute');

const app = require('../../app');

describe('[UNIT] Route Truncation Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    
    // Mock distance calculation - return actual distances for realistic testing
    haversineDistance.mockImplementation((coord1, coord2) => {
      // Simple distance calculation for testing
      const dLat = coord2.lat - coord1.lat;
      const dLng = coord2.lng - coord1.lng;
      return Math.sqrt(dLat * dLat + dLng * dLng) * 111000; // Rough meters
    });
    
    generateLoopRoute.mockResolvedValue({
      type: 'rect-loop',
      geojson: { 
        type: 'LineString', 
        coordinates: [[103.8730, 1.3010], [103.8735, 1.3012]]
      },
      actualDist: 500 // 0.5 km
    });
  });

  it('should truncate route when segments exceed target distance', async () => {
    // Mock segments that would exceed target distance
    getWalkingRoute
      .mockResolvedValueOnce({
        coords: [[103.8725, 1.3008], [103.8730, 1.3010]], // ~556m
        dist: 556
      })
      .mockResolvedValueOnce({
        coords: [[103.8730, 1.3010], [103.8740, 1.3020]], // ~1112m  
        dist: 1112
      })
      .mockResolvedValueOnce({
        coords: [[103.8740, 1.3020], [103.8750, 1.3030]], // ~1112m
        dist: 1112
      });

    const response = await request(app)
      .post('/api/route')
      .send({
        routeType: 'direct',
        start: { lat: 1.3008, lng: 103.8725 },
        waypoints: [
          { lat: 1.3010, lng: 103.8730 },
          { lat: 1.3020, lng: 103.8740 }
        ],
        end: { lat: 1.3030, lng: 103.8750 },
        distance: 1 // 1km = 1000m, should truncate after first two segments
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    
    // Check that the total distance is close to target (1000m)
    expect(response.body.actualDist).toBeLessThanOrEqual(1000);
    
    // Should have called getWalkingRoute at least twice but maybe not the third time due to truncation
    expect(getWalkingRoute).toHaveBeenCalledTimes(2);
    
    console.log('Truncation test actualDist:', response.body.actualDist);
  });

  it('should extend with loop when segments are under target distance', async () => {
    // Mock segments that are under target distance
    getWalkingRoute
      .mockResolvedValueOnce({
        coords: [[103.8725, 1.3008], [103.8730, 1.3010]],
        dist: 200 // 200m
      })
      .mockResolvedValueOnce({
        coords: [[103.8730, 1.3010], [103.8735, 1.3015]],
        dist: 300 // 300m
      });

    const response = await request(app)
      .post('/api/route')
      .send({
        routeType: 'direct',
        start: { lat: 1.3008, lng: 103.8725 },
        waypoints: [
          { lat: 1.3010, lng: 103.8730 }
        ],
        end: { lat: 1.3015, lng: 103.8735 },
        distance: 1 // 1km = 1000m, should extend with loop for remaining 500m
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    
    // Verify that loop extension was called for the remaining distance
    expect(generateLoopRoute).toHaveBeenCalledWith(
      { lat: 1.3015, lng: 103.8735 },
      0.5 // remaining 500m = 0.5km
    );
    
    // Verify final distance is correct
    expect(response.body.actualDist).toBe(1000);
    
    console.log('Extension test actualDist:', response.body.actualDist);
    console.log('Extension test calls:', getWalkingRoute.mock.calls.length);
  });

  it('should handle exact distance match without truncation or extension', async () => {
    // Mock segments that exactly match target distance
    getWalkingRoute
      .mockResolvedValueOnce({
        coords: [[103.8725, 1.3008], [103.8730, 1.3010]],
        dist: 400 // 400m
      })
      .mockResolvedValueOnce({
        coords: [[103.8730, 1.3010], [103.8735, 1.3015]],
        dist: 600 // 600m, total = 1000m exactly
      });

    const response = await request(app)
      .post('/api/route')
      .send({
        routeType: 'direct',
        start: { lat: 1.3008, lng: 103.8725 },
        waypoints: [
          { lat: 1.3010, lng: 103.8730 }
        ],
        end: { lat: 1.3015, lng: 103.8735 },
        distance: 1 // 1km = 1000m, exactly matches
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.actualDist).toBe(1000);
    
    // Should not call generateLoopRoute for extension since distance matches exactly
    expect(generateLoopRoute).not.toHaveBeenCalled();
    
    console.log('Exact match test actualDist:', response.body.actualDist);
    console.log('Exact match test calls:', getWalkingRoute.mock.calls.length);
  });
});