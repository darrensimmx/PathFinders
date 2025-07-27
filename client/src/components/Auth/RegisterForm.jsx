import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../LoginForm.css';
import axios from 'axios';
// load API base URL from env
const API_URL = import.meta.env.VITE_API_URL;
import { FaUser } from "react-icons/fa";
import { RiMailAddFill } from "react-icons/ri";
import InputBox from '../Common/InputBox';
import PasswordInput from '../Common/PasswordInput';
import AuthWrapper from '../Common/AuthWrapper';

const RegisterForm = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    // Basic email check
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }
    //Check if password matches
    if (confirmPassword !== password) {
      alert("Passwords do not match.");
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/api/signup`, {
        name, 
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
    <AuthWrapper>
      <form onSubmit={handleSubmit}>
          <h1>PathFinder</h1>
          <InputBox
            type="text"
            placeholder="Username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={<FaUser />}
          />

          <InputBox
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<RiMailAddFill />}
          />

          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <PasswordInput
            value={confirmPassword}
            placeholder="Confirm Password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button type="submit" className="bg-blue-600 text-white py-2 rounded">Register</button>

          <div className="register-link">
            <p>Already have an account? <Link to="/">Login</Link></p>
          </div>
        </form>
    </AuthWrapper>    
  );
};

export default RegisterForm;
