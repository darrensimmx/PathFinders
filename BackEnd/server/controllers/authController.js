//Controller for Authentication feature: handles login & signups

async function login(req, res) {
  //TODO: replace mocked data with actual data
  const {email, password} = req.body;
  // console.log(email)
  // console.log(password)

  const mockUser = {
    email: "abc@example.com",
    password: "password123"
  };

  //all mock data to be changed to real data
  if (!email || !password) {
    return res.json({ status: 'error', message: 'Missing credentials'})
  }

  if (email !== mockUser.email) {
    return res.json({ status: 'error', message: 'User not found'})
  }

  if (password !== mockUser.password) {
    return res.json({ status: 'error', message: 'Incorrect Password'})
  }

  return res.json({ status: 'success'})
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