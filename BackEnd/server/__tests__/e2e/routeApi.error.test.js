const request = require('supertest');
const app = require('../../app'); // Express app

//Missing Distance Field
it('should return 400 if start is missing', async () => {
  const res = await request(app).post('/api/route').send({
    distance: 2,
    routeType: 'loop'
  });

  expect(res.status).toBe(400);
  expect(res.body.message).toMatch(/starting location/i);
});

//Invalid routeType
it('should return 400 if distance is negative', async () => {
  const res = await request(app).post('/api/route').send({
    start: { lat: 1.3, lng: 103.8 },
    distance: -5,
    routeType: 'loop'
  });

  expect(res.status).toBe(400);
  expect(res.body.message).toMatch(/positive number/i);
});

//Missing end point for direct route
it('should return 400 if start.lat is not a number', async () => {
  const res = await request(app).post('/api/route').send({
    start: { lat: "not-a-number", lng: 103.8 },
    distance: 2,
    routeType: 'loop'
  });

  expect(res.status).toBe(400);
});

jest.mock('../../utils/googleRequest', () => ({
  getWalkingRoute: jest.fn(() => {
    throw new Error("Google API error");
  })
}));

//Malformed end point
it('should return 500 if Google API fails', async () => {
  const res = await request(app).post('/api/route').send({
    start: { lat: 1.3, lng: 103.8 },
    end: { lat: 1.305, lng: 103.805 },
    distance: 1,
    routeType: 'direct'
  });

  expect(res.status).toBe(500);
  expect(res.body.message).toMatch(/Google API/i);
});
