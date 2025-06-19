//Tests for Login and Authentication Features

const { default: mongoose } = require('mongoose');
const request = require('supertest') // for Mongoose testing
const { MongoMemoryServer } = require('mongodb-memory-server')

// Note to self: describe is used with multiple it(..) to test a fn w multiple test cases
// For just a specific standalone case, can use test(..) instead

const loginMock = require('../controllers/authController').loginMock;
const signUpMock = require('../controllers/authController').signUpMock;
const app = require('../app');
//console.log('typeof app:', typeof app);

// Login/sign up feature
/****************************************Unit Testing****************************************/

// Login button renders and works 
describe('Login with mocked data', () => {
  //return success if email & pw match mocked data
  it('should return success if email and password match mock data', async () => {
    const result = await loginMock({
      email: 'abc@example.com',
      password: 'password123'
    });
    
    expect(result.status).toBe('success');
  })
  
  //return error if user not found
  it('should return error if user not found', async () => {
    const result = await loginMock({
      email: 'notfound@example.com',
      password: 'password123'
    });

    expect(result.status).toBe('error');
    expect(result.message).toBe('User not found');
  })
  
  //return error if pw incorrect
  it('should return error if password is incorrect', async () => {
    const result = await loginMock({
      email: 'abc@example.com',
      password: 'wrongPassword'
    });

    
    expect(result.status).toBe('error');
    expect(result.message).toBe('Incorrect Password');
  })

  //return error if missing email or password
  it('should return error if email or password is missing', async () => {
    const result = await loginMock({
      email: '',
      password: ''
    });

    expect(result.status).toBe('error');
    expect(result.message).toBe('Missing credentials');
  })
})

// Sign up fn 
describe('Signed up with mocked data', () => {
  // Sign up returns success if valid username and password
  it('should return success if valid username and password', async () => {
    const result = await signUpMock({
      email: 'new@gmail.com',
      password: 'new123'
    });
    
    expect(result.status).toBe('success');
  })
  
  // Sign up fails if email already taken: return "email already in use"
  it('should return error if email already taken', async () => {
    const result = await signUpMock({
      email: 'abc@example.com', //same as login email
      password: 'new123'
    })

    expect(result.status).toBe('error');
    expect(result.message).toBe('Email already in use');
  })
  
  // Sign up fails if email not in valid format
  it('should return error if email format is invalid', async () => {
    const result = await signUpMock({
      email: 'Invalid-format',
      password: 'new123'
    })

    expect(result.status).toBe('error');
    expect(result.message).toBe('Invalid email format');
  })
  
  // Sign up fail if either password or email missing 
  it('should return error if either password or email missing', async () => {
    const result = await signUpMock({
      email: '',
      password: ''
    })

    expect(result.status).toBe('error');
    expect(result.message).toBe('Missing credentials');
  })
})







/****************************************Integration Testing****************************************/
let mongoServer;

beforeAll(async () => {
  // spin up in-memory DB
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  await mongoose.connect(uri)
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

afterEach(async () => {
  //clear users after each test to isolate
  await mongoose.connection.db.collection('users').deleteMany({})
})

// Fill email, password and submit to see expected behavior in Mongoose
describe('Auth API Integration', () => {

  //email and password should store in db when entered correctly
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/signup')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');

    // DB actually has user
    const user = await mongoose.connection.db.collection('users').findOne({ email: 'test@example.com' });
    expect(user).toBeTruthy();
    expect(user.password).not.toBe('password123'); // Should be hashed
  });

  // invalid email should not be in db and throw error
  it('should not register duplicate email', async () => {
    // Register first
    await request(app)
      .post('/api/signup')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    // Try again
    const res = await request(app)
      .post('/api/signup')
      .send({
        email: 'test@example.com',
        password: 'another123'
      });

    expect(res.statusCode).toBe(200); 
    expect(res.body.status).toBe('error');
    expect(res.body.message).toMatch(/already/i);
  });

  // login works with an actual data from db
  it('should login with correct credentials', async () => {
    // Register first
    await request(app)
      .post('/api/signup')
      .send({
        email: 'login@example.com',
        password: 'password123'
      });

    // Then login
    const res = await request(app)
      .post('/api/login')
      .send({
        email: 'login@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
  });

  // login should fail with wrong password
  it('should fail login with wrong password', async () => {
    // Register first
    await request(app)
      .post('/api/signup')
      .send({
        email: 'wrongpass@example.com',
        password: 'correctpass'
      });

    // Try wrong password
    const res = await request(app)
      .post('/api/login')
      .send({
        email: 'wrongpass@example.com',
        password: 'wrongpass'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toMatch(/incorrect/i);
  });

});










// Authentication feature
/****************************************Unit Testing****************************************/

// Password is hashed

// Same password, different hash using salt

// JWT token is generated with correct payload (jwt.sign() output)









/****************************************Integration Testing****************************************/

// /signup creates a new user

// /login returns token for valid credentials

// incorrect password returns 401

// token-based access to protected route

