// __tests__/e2e/routesave.e2e.test.js
require('dotenv').config();
const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');

jest.setTimeout(20000);

const testUser = {
  name: 'E2E RouteUser',
  email: 'e2e.routeuser@example.com',
  password: 'password123'
};

let accessToken;
let savedRouteId;

const routeData = {
  name: 'E2E Route',
  distance: 1200,
  coordinates: [[1.3, 103.8], [1.31, 103.81]], // Must be an array of [lat, lng] pairs
  startPoint: { type: 'Point', coordinates: [1.3, 103.8] },
  endPoint: { type: 'Point', coordinates: [1.31, 103.81] }
};

beforeAll(async () => {
  // Ensure connection to test DB
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }

  // Clean previous user (optional)
  await mongoose.connection.db.collection('users').deleteMany({ email: testUser.email });

  // Register test user
  await request(app).post('/api/signup').send(testUser);

  // Login to get token
  const loginRes = await request(app).post('/api/login').send({
    email: testUser.email,
    password: testUser.password
  });

  expect(loginRes.statusCode).toBe(200);
  accessToken = loginRes.body.accessToken;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('[E2E] Route Saving Flow', () => {
  it('should save a route', async () => {
    const res = await request(app)
      .post('/api/saved-routes/save')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ route: routeData });

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBeDefined();
    savedRouteId = res.body._id;
  });

  it('should fetch all saved routes', async () => {
    const res = await request(app)
      .get('/api/saved-routes')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.routes)).toBe(true);
    expect(res.body.routes.length).toBeGreaterThan(0);
  });

  it('should fetch the specific saved route', async () => {
    const res = await request(app)
      .get(`/api/saved-routes/${savedRouteId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(routeData.name);
  });

  it('should delete the saved route', async () => {
    const res = await request(app)
      .delete(`/api/saved-routes/${savedRouteId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Route Deleted');
  });
});
