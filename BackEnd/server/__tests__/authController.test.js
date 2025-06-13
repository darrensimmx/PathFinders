//Tests for Login and Authentication Features

const login = require('../controllers/authController').login;
const signUp = require('../controllers/authController').signUp;
// Login/sign up feature
/****************************************Unit Testing****************************************/

// Login button renders and works 
describe('Login with mocked data', () => {
  //return success if email & pw match mocked data
  it('should return success if email and password match mock data', async () => {
    const result = await login({
      email: 'abc@example.com',
      password: 'password123'
    });
    
    expect(result.status).toBe('success');
  })
  
  //return error if user not found
  it('should return error if user not found', async () => {
    const result = await login({
      email: 'notfound@example.com',
      password: 'password123'
    });

    expect(result.status).toBe('error');
    expect(result.message).toBe('User not found');
  })
  
  //return error if pw incorrect
  it('should return error if password is incorrect', async () => {
    const result = await login({
      email: 'abc@example.com',
      password: 'wrongPassword'
    });

    
    expect(result.status).toBe('error');
    expect(result.message).toBe('Incorrect Password');
  })

  //return error if missing email or password
  it('should return error if email or password is missing', async () => {
    const result = await login({
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
    const result = await signUp({
      email: 'new@gmail.com',
      password: 'new123'
    });
    
    expect(result.status).toBe('success');
  })
  
  // Sign up fails if email already taken: return "email already in use"
  it('should return error if email already taken', async () => {
    const result = await signUp({
      email: 'abc@example.com', //same as login email
      password: 'new123'
    })

    expect(result.status).toBe('error');
    expect(result.message).toBe('Email already in use');
  })
  
  // Sign up fails if email not in valid format
  it('should return error if email format is invalid', async () => {
    const result = await signUp({
      email: 'Invalid-format',
      password: 'new123'
    })

    expect(result.status).toBe('error');
    expect(result.message).toBe('Invalid email format');
  })
  
  // Sign up fail if either password or email missing 
  it('should return error if either password or email missing', async () => {
    const result = await signUp({
      email: '',
      password: ''
    })

    expect(result.status).toBe('error');
    expect(result.message).toBe('Missing credentials');
  })
})



// Password input is type "password" by default => Password censors by default, 

// Toggle visibility button works for password

// Remember me checkbox saves data to localStorage (for now)







/****************************************Integration Testing****************************************/

// Fill email, password and submit to see expected behavior

// Invalid credentials will show error message

// Succesful login will trigger redirection to routeGeneration











// Authentication feature
/****************************************Unit Testing****************************************/

// User model throws on missing fields

// User not found in database

// Password is hashed

// Same password, different hash using salt

// bcrypt.compare() works to validate password

// Invalid email format rejected (mongoose validator later, for now custom check)

// JWT token is generated with correct payload (jwt.sign() output)









/****************************************Integration Testing****************************************/

// /signup creates a new user

// /login returns token for valid credentials

// incorrect password returns 401

// token-based access to protected route