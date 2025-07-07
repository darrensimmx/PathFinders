const request = require('supertest');
const app = require('../../app');

describe('[E2E] /api/route (error cases)', () => {
  it('should return 400 if start is missing', async () => {
    const res = await request(app).post('/api/route').send({
      routeType: 'direct',
      end: { lat: 1.3521, lng: 103.8198 },
      distance: 1
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'InvalidStartLocation');
    expect(res.body.message).toMatch(/starting location/i);
  });

  it('should return 400 if direct route is missing end', async () => {
    const res = await request(app).post('/api/route').send({
      routeType: 'direct',
      start: { lat: 1.3008, lng: 103.8725 },
      distance: 1
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/end location is required/i);
  });

  it('should return 400 for non-existent start location (geocoding fails)', async () => {
    const res = await request(app).post('/api/route').send({
      routeType: 'loop',
      start: 'asdlkjasdljkqweqwe', // gibberish string
      distance: 1
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/couldn't find.*start/i);
  });

  it('should return 400 for non-existent end location (geocoding fails)', async () => {
    const res = await request(app).post('/api/route').send({
      routeType: 'direct',
      start: { lat: 1.354, lng: 103.821 },
      end: 'qwueiqwueiqwueiqwe', // gibberish string
      distance: 2
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/end location.*please try again/i);
  });

  it('should return 400 for negative distance', async () => {
    const res = await request(app).post('/api/route').send({
      routeType: 'loop',
      start: { lat: 1.3008, lng: 103.8725 },
      distance: -5
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/distance must be.*positive/i);
  });
});
