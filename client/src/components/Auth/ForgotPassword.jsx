import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../LoginForm.css'; // reuse same styling
import axios from 'axios';
// load API base URL from env
const API_URL = import.meta.env.VITE_API_URL;
import { FaUser } from "react-icons/fa";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API_URL}/api/forgot-password`, {
        email
      });
      if (response.data.status === 'success') {
        setMessage('Check your email for the reset link!');
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error(error);
      setMessage('Server error. Please try again.');
    }
  };

  return (
    <div className='login-form-container'>
      <div className="wrapper">
        <form onSubmit={handleSubmit}>
          <h1>Forgot Password</h1>
          
          <div className="input-box">
            <input 
              type="email" 
              placeholder='Email' 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FaUser className='icon'/>
          </div>

          <button type="submit" className="bg-blue-600 text-white py-2 rounded">
            Send Reset Link
          </button>

          {message && <p style={{ marginTop: '10px' }}>{message}</p>}

          <div className="register-link">
            <p>Remember your password? <a href="/">Back to Login</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
