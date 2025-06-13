//Controller for Authentication feature: handles login & signups

async function login({ email, password }) {
  //TODO: replace mocked data with actual data
  const mockUser = {
    email: "abc@example.com",
    password: "password123"
  };

  //all mock data to be changed to real data
  if (!email || !password) {
    return { status: 'error', message: 'Missing credentials'}
  }

  if (email !== mockUser.email) {
    return { status: 'error', message: 'User not found'}
  }

  if (password !== mockUser.password) {
    return { status: 'error', message: 'Incorrect Password'}
  }

  return { status: 'success'}
}

async function signUp({ email, password}) {
  //TODO: replace mocked data with actual data
  const mockUser = {
    email: 'new@gmail.com',
    password: 'new123'
  };

  const mockExistingUser = {
    email: "abc@example.com",
    password: "password123"
  };

  if (!email || !password) {
    return { status: 'error', message: 'Missing credentials'}
  }

  if (email == mockExistingUser.email) {
    return { status: 'error', message: 'Email already in use'};
  }

  const emailRegexFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegexFormat.test(email)) {
    return { status: 'error', message: 'Invalid email format'}
  }

  return { status: 'success' }
}

module.exports = { login, signUp }