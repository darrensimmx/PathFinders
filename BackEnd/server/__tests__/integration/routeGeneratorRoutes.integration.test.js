// routeGeneratorRoutes.integration.test.js

const request = require('supertest');
const express = require('express');
const routeRouter = require('../../routes/routeGeneratorRoutes');

// Mock external dependencies
jest.mock('../../utils/googleRequest', () => ({
  getWalkingRoute: jest.fn((start, end) => {
    return Promise.resolve({
      coords: [
        [103.8, 1.3],
        [103.81, 1.31]
      ],
      dist: 300
    });
  })
}));

jest.mock('../../controllers/looproute', () => jest.fn(() => {
  return Promise.resolve({
    geojson: {
      type: 'LineString',
      coordinates: [
        [103.81, 1.31],
        [103.82, 1.32]
      ]
    },
    actualDist: 500
  });
}));

const app = express();
app.use(express.json());
app.use('/api/route', routeRouter);

describe('Integration Test - Waypoint Filtering', () => {
  it('should return a valid route with ordered waypoints', async () => {
    const res = await request(app)
      .post('/api/route')
      .send({
        start: { lat: 1.300, lng: 103.800 },
        end: { lat: 1.310, lng: 103.810 },
        distance: 2,
        routeType: 'direct',
        waypoints: [
          { lat: 1.305, lng: 103.805 },
          { lat: 1.307, lng: 103.807 }
        ]
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.geojson).toBeDefined();
    expect(res.body.routeCoords.length).toBeGreaterThan(1);
  });

  it('should reject waypoint with missing lat/lng', async () => {
    const res = await request(app)
      .post('/api/route')
      .send({
        start: { lat: 1.3, lng: 103.8 },
        end: { lat: 1.31, lng: 103.81 },
        distance: 1,
        routeType: 'direct',
        waypoints: [{ bad: 'format' }]
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('InvalidWaypoint');
  });

  it('should reject waypoint outside Singapore', async () => {
    const res = await request(app)
      .post('/api/route')
      .send({
        start: { lat: 1.3, lng: 103.8 },
        end: { lat: 1.31, lng: 103.81 },
        distance: 1,
        routeType: 'direct',
        waypoints: [{ lat: 2.0, lng: 105.0 }]
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('OutsideBoundary');
  });
});
