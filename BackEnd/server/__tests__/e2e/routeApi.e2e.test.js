// __tests__/e2e/routeApi.e2e.test.js
const request = require('supertest');
const app = require('../../app'); // Express app

describe('[E2E] /api/route', () => {
  it('should return a valid loop route response', async () => {
    const response = await request(app).post('/api/route').send({
      routeType: 'loop',
      start: { lat: 1.3008, lng: 103.8725 },
      distance: 1 // 1km
    });

    console.log('[Loop Response]', response.body);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('type', 'rect-loop');
    expect(response.body).toHaveProperty('geojson');
    expect(response.body.geojson.type).toBe('LineString');
    expect(response.body.routeCoords.length).toBeGreaterThan(1);
  });

  it('should return a valid direct route response', async () => {
    const response = await request(app).post('/api/route').send({
      routeType: 'direct',
      start: { lat: 1.3008, lng: 103.8725 },
      end:   { lat: 1.2992, lng: 103.8739 },
      distance: 1
    });

    console.log('[Direct Response]', response.body);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('type', 'custom-direct');
    expect(response.body.geojson.type).toBe('LineString');
    expect(response.body.routeCoords.length).toBeGreaterThan(1);
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

  it('should handle coordinate waypoints in direct routes', async () => {
    const response = await request(app).post('/api/route').send({
      routeType: 'direct',
      start: { lat: 1.3008, lng: 103.8725 },
      waypoints: [
        { lat: 1.3010, lng: 103.8730 },
        { lat: 1.3015, lng: 103.8735 }
      ],
      end: { lat: 1.2992, lng: 103.8739 },
      distance: 2
    });

    console.log('[Waypoint Response]', response.body);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('type', 'direct-with-waypoints');
    expect(response.body).toHaveProperty('geojson');
    expect(response.body.geojson.type).toBe('LineString');
    expect(response.body.routeCoords.length).toBeGreaterThan(1);
  });

  it('should return 400 for invalid waypoint coordinates', async () => {
    const response = await request(app).post('/api/route').send({
      routeType: 'direct',
      start: { lat: 1.3008, lng: 103.8725 },
      waypoints: [
        { lat: 1.3010, lng: 103.8730 },
        { lat: 200, lng: 103.8735 } // Invalid latitude
      ],
      end: { lat: 1.2992, lng: 103.8739 },
      distance: 2
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'InvalidWaypoint');
  });
});
