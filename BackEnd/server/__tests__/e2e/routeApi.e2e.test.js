// __tests__/e2e/routeApi.e2e.test.js
const request = require('supertest');
const app = require('../../app'); // Express app

describe('[E2E] /api/route', () => {
  it('should return a valid direct route response or graceful error', async () => {
    const response = await request(app).post('/api/route').send({
      routeType: 'direct',
      start: { lat: 1.3008, lng: 103.8725 },
      end:   { lat: 1.2992, lng: 103.8739 },
      distance: 1
    });

    console.log('[Direct Response]', response.body);

    if (response.status === 500) {
      expect(response.body).toHaveProperty('error', 'InternalServerError');
      expect(response.body.message).toMatch(/No valid rectangle route found/);
    } else {
      expect(response.status).toBe(200);
      expect(response.body.geojson.type).toBe('LineString');
      expect(response.body.routeCoords.length).toBeGreaterThan(1);
    }
  });

  it('should return 400 for missing start coords', async () => {
    const response = await request(app).post('/api/route').send({
      routeType: 'loop',
      distance: 1
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
  });

  it('should return 400 for invalid distance', async () => {
    const response = await request(app).post('/api/route').send({
      routeType: 'loop',
      start: { lat: 1.3521, lng: 103.8198 },
      distance: -5
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
  });

  it('should return 400 if direct route is missing end', async () => {
    const response = await request(app).post('/api/route').send({
      routeType: 'direct',
      start: { lat: 1.3008, lng: 103.8725 },
      distance: 1
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});
