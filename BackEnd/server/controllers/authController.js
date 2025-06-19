//Controller for Authentication feature: handles login & signups

const User = require("../models/userModel");
const bcrypt = require('bcrypt')

// Mocked fn with mock data
async function signUp({email, password}) {
  //mongoose data
  if (!email || !password) {
    return { status: 'error', message: 'Missing credentials'}
  }

  const existing = await User.findOne({email});
  if (existing) {
    return { status: 'error', message: 'Email already in use'};
  }

  const salt = await bcrypt.genSalt() 
  const hashedPassword = await bcrypt.hash(password, salt) //use bcrypt to hash
  const newUser = new User({email, password: hashedPassword});
  await newUser.save(); // save to mongodb
  return { status: 'success'}
}

async function login({ email, password}) {
  //mongoose data
  if (!email || !password) {
    return { status: 'error', message: 'Missing credentials' };
  }

  const user = await User.findOne({ email });
  if (!user) {
    return { status: 'error', message: 'User not found' };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return { status: 'error', message: 'Incorrect password' };
  }

  return { status: 'success' };
}

// Mocked fn with mock data
async function loginMock({email, password}) {
  //TODO: replace mocked data with actual data
  // console.log(email)
  // console.log(password)

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

async function signUpMock({ email, password}) {
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

module.exports = { loginMock, signUpMock, 
                    login, signUp }