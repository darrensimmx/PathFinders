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
        name: 'Test User',
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
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

    // Try again
    const res = await request(app)
      .post('/api/signup')
      .send({
        name: 'Test User',
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
        name: 'Test User',
        email: 'login@example.com',
        password: 'password123'
      });

    // Then login
    const res = await request(app)
      .post('/api/login')
      .send({
        name: 'Test User',
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
        name: 'Test User',
        email: 'wrongpass@example.com',
        password: 'correctpass'
      });

    // Try wrong password
    const res = await request(app)
      .post('/api/login')
      .send({
        name: 'Test User',
        email: 'wrongpass@example.com',
        password: 'wrongpass'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toMatch(/incorrect/i);
  });

  //Forget password token 
  it('should generate reset token for forgot password', async () => {
    await request(app)
          .post('/api/signup')
          .send({
            name: 'Test User',
            email: 'reset@gmail.com',
            password: 'password123'
          })
    //call forget password
    const res = await request(app)
                      .post('/api/forgot-password')
                      .send({email: 'reset@gmail.com'})
    
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.resetLink).toMatch(/reset-password\?token=/);

    //Verify DB still exist
    const user = await mongoose.connection.db.collection('users').findOne({email : 'reset@gmail.com'})
    expect(user.resetPasswordToken).toBeTruthy();
    expect(new Date(user.resetPasswordExpires).getTime()).toBeGreaterThan(Date.now());
  })

  // Forgot password shud fail if non existing email entered
  it('should return error for forgot password with unknown email', async () => {
    const res = await request(app)
                      .post('/api/forgot-password')
                      .send({ email: 'nonexisting@gmail.com'});

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toMatch(/not found/i);            
  })

  // Forgot password shud fail when missing email
  it('should return error if forgot password email is missing', async () => {
    const res = await request(app)
                      .post('/api/forgot-password')
                      .send({ }); // send nth in

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toMatch(/email/i);     
  })
});










// Remember Me function
/****************************************Unit Testing****************************************/



describe('remember me flow', () => {
  // issue refresh token cookie when checked
  it('should issue refreshToken cookie when rememberMe is true', async () => {
    await request(app)
    .post('/api/signup')
    .send({
      name: 'Test User',
      email: 'rememberme@gmail.com',
      password: 'password123'
    })
    
    const res = await request(app)
    .post('/api/login')
    .send({
      name: 'Test User',
      email: 'rememberme@gmail.com',
      password: 'password123',
      rememberMe: true
    });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
    
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.join(';')).toMatch(/refreshToken=/);
  })
  
  // does not issue refresh token cookie when unchecked
  
  it('should NOT issue refreshToken cookie when rememberMe is false', async () => {
    // Register another user
    await request(app)
    .post('/api/signup')
    .send({
      name: 'Test User',
      email: 'noremember@example.com',
      password: 'password123'
    });
    
    // Login without rememberMe
    const res = await request(app)
    .post('/api/login')
    .send({
      email: 'noremember@example.com',
      password: 'password123',
      rememberMe: false
    });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
    // Should NOT have a Set-Cookie header
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeUndefined();
  });
  
  // should refresh token using refreshToken cookie
  it('should refresh token using refreshToken cookie', async () => {
    // Register & login with rememberMe
    await request(app)
      .post('/api/signup')
      .send({
        name: 'Test User',
        email: 'refresh@example.com',
        password: 'password123'
      });

    const loginRes = await request(app)
      .post('/api/login')
      .send({
        name: 'Test User',
        email: 'refresh@example.com',
        password: 'password123',
        rememberMe: true
      });

    const cookies = loginRes.headers['set-cookie'];

    // Call refresh-token with cookie attached
    const refreshRes = await request(app)
      .post('/api/refresh-token')
      .set('Cookie', cookies)
      .send();

    expect(refreshRes.statusCode).toBe(200);
    expect(refreshRes.body.accessToken).toBeTruthy();
  });
})

// Authentication feature
test('should access protected route with valid accessToken', async () => {
  // Ensure test@example.com exists
  await request(app)
    .post('/api/signup')
    .send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

  // Login to get fresh token
  const loginRes = await request(app)
    .post('/api/login')
    .send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      rememberMe: true
    });

  const accessToken = loginRes.body.accessToken;
  console.log('AccessToken:', accessToken);

  const res = await request(app)
    .get('/api/protected')
    .set('Authorization', `Bearer ${accessToken}`);

  console.log('Protected status:', res.statusCode, res.body);

  expect(res.statusCode).toBe(200);
  expect(res.body.message).toMatch(/protected/);
});








