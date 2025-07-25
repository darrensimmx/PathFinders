//Controller for Authentication feature: handles login & signups

const User = require("../models/userModel");
const bcrypt = require('bcrypt')
const crypto = require('crypto');
//const { UNSAFE_useRouteId } = require("react-router-dom");
//for rememberme fn
const jwt = require('jsonwebtoken');
const { SECRET } = require('../config');

//For forget password
const nodemailer = require('nodemailer');

async function signUp({name, email, password}) {
  //mongoose data
  if (!name || !email || !password) {
    return { status: 'error', message: 'Missing credentials'}
  }

  const existing = await User.findOne({email});
  if (existing) {
    return { status: 'error', message: 'Email already in use'};
  }

  const salt = await bcrypt.genSalt() 
  const hashedPassword = await bcrypt.hash(password, salt) //use bcrypt to hash
  const newUser = new User({name, email, password: hashedPassword});
  await newUser.save(); // save to mongodb
  const accessToken = jwt.sign({ id: newUser._id }, SECRET, { expiresIn: '1h' });

  // Return token along with user info
  return {
    status: 'success',
    accessToken,
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email
    }
  }
}

async function login({ email, password, rememberMe}) {
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

  //Issue short lived access token
  const accessToken = jwt.sign({id: user._id}, SECRET, {expiresIn: '15m'});

  let refreshToken = null;

  if (rememberMe) {
    refreshToken = jwt.sign({id: user._id}, SECRET, {expiresIn: '7d'});
  }

  return {
    status: 'success',
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      bio: user.bio,
      profileImage: user.profileImage
    }
  };
}

//Forget Password
async function forgotPassword({ email }) {
  if (!email) {
    return { status: 'error', message: 'Email is required' };
  }

  const user = await User.findOne({ email });
  if (!user) {
    return { status: 'error', message: 'User not found' };
  }

  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 1000 * 60 * 15; // 15 mins
  await user.save();

  const resetLink = `http://localhost:5173/reset-password?token=${token}`;

  // Set up transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, 
      pass: process.env.GMAIL_PASS, 
    }
  });

  const mailOptions = {
    from: 'PathFinders <no-reply@pathfinders.com>',
    to: email,
    subject: 'Password Reset Request',
    html: `
      <p>Hello,</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link will expire in 15 minutes.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { status: 'success', message: 'Password reset link sent to email', resetLink };
  } catch (err) {
    console.error('Email error:', err);
    return { status: 'error', message: 'Failed to send email' };
  }
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
                    login, signUp,
                  forgotPassword }