import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../LoginForm.css';
import axios from 'axios';
import { FaUser } from "react-icons/fa";
import { RiMailAddFill } from "react-icons/ri";
import InputBox from '../Common/InputBox';
import PasswordInput from '../Common/PasswordInput';
import AuthWrapper from '../Common/AuthWrapper';

const RegisterForm = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:4000/api/signup', {
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
          
          <button type="submit" className="bg-blue-600 text-white py-2 rounded">Register</button>

          <div className="register-link">
            <p>Already have an account? <a href="/">Login</a></p>
          </div>
        </form>
    </AuthWrapper>    
  );
};

export default RegisterForm;
