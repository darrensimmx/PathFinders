//Page for Login 
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../LoginForm.css'
//Link to backend
import axios from 'axios';
// load API base URL from env, fallback to current origin
const API_URL = import.meta.env.VITE_API_URL || window.location.origin;

//icons for login
import { FaUser } from "react-icons/fa";

//reusable components
import AuthWrapper from '../Common/AuthWrapper';
import InputBox from '../Common/InputBox';
import PasswordInput from '../Common/PasswordInput';


const LoginForm = () =>  {
  //track the current states of email and pw
  console.log("LoginForm Rendered")
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic frontend validation
    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    // Basic email check
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    try {
      const response =  await axios.post(`${API_URL}/api/login`, {
        email,
        password
      });
      console.log(response.data.status)
      if (response.data.status === 'success') {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/route-generator');
      } else {
        alert(response.data.message); // show alert on frontpage
      } 
    }
    catch (error) {
      console.log(error)
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message)
      } else {
        alert('Server error')
      }
    }

  }
  return (
    <AuthWrapper> 
      <form onSubmit={handleSubmit}>
          <h1>PathFinder</h1>
          
          <InputBox 
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<FaUser />}
          />

          <PasswordInput 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="remember-forgot">
            <label><input type="checkbox" />Remember me</label>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          
          <button type="submit" className="bg-blue-600 text-white py-2 rounded">Login</button>

          <div className="register-link">
            <p>Don't have an account? <Link to="/register">Register</Link></p>
          </div>
        </form>
    </AuthWrapper>   
  )
}

export default LoginForm;