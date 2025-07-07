// __tests__/e2e/auth.e2e.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app'); // your Express app
const User = require('../../models/userModel');

jest.setTimeout(20000); 

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

const testUser = {
  name: 'E2E User',
  email: 'e2e@example.com',
  password: 'securePassword123'
};

describe('[E2E] Auth Flow', () => {
  it('should register a user and return a token', async () => {
    const res = await request(app).post('/api/signup').send(testUser);
    console.log(res.body);
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  it('should login a user and return a token', async () => {
    await request(app).post('/api/signup').send(testUser);
    const res = await request(app).post('/api/login').send({
      email: testUser.email,
      password: testUser.password
    });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  it('should reject login with invalid password', async () => {
    await request(app).post('/api/signup').send(testUser);
    const res = await request(app).post('/api/login').send({
      email: testUser.email,
      password: 'wrongpassword'
    });
    expect(res.status).toBe(401);
  });

  it('should reject access to protected route without token', async () => {
    const res = await request(app).get('/api/saved-routes');
    expect(res.status).toBe(401); // or 403 depending on your middleware
  });
});
