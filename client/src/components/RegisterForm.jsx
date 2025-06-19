import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../src/LoginForm.css';
import axios from 'axios';
import { FaUser, FaEye, FaEyeSlash } from "react-icons/fa";

const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:4000/api/signup', {
        email,
        password
      });
      console.log(response.data.status);
      if (response.data.status === 'success') {
        alert('Registered successfully! You can now log in.');
        navigate('/'); // go back to login page
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.log(error);
      alert('Server error');
    }
  };

  return (
    <div className='login-form-container'>
      <div className="wrapper">
        <form onSubmit={handleSubmit}>
          <h1>PathFinder</h1>
          
          <div className="input-box">
            <input 
              type="text" 
              placeholder='Email' 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FaUser className='icon'/>
          </div>

          <div className="input-box">
            <input 
              type={showPassword ? 'text' : 'password'}
              placeholder='Password' 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span 
              className="icon" 
              onClick={() => setShowPassword(!showPassword)}
              style={{ cursor: 'pointer' }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          
          <button type="submit" className="bg-blue-600 text-white py-2 rounded">Register</button>

          <div className="register-link">
            <p>Already have an account? <a href="/login">Login</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
