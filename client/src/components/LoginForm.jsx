//Page for Login 
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../src/LoginForm.css'
//Link to backend
import axios from 'axios'

//icons for login
import { FaUser, FaEye, FaEyeSlash } from "react-icons/fa";


const LoginForm = () =>  {
  //track the current states of email and pw
  console.log("LoginForm Rendered")
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); //by default pw typed is censored
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response =  await axios.post('http://localhost:4000/api/login', {
        email,
        password
      });
      console.log(response.data.status)
      if (response.data.status === 'success') {
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
              onChange={(e) => setEmail(e.target.value)}/>
            <FaUser className='icon'/>
          </div>

          <div className="input-box">
            <input 
            type={showPassword ? 'text' : 'password'} // toggle logic
            placeholder='Password' 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}/>
            <span className="icon" onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer' }}>
              {showPassword ? <FaEyeSlash /> : <FaEye/>}
            </span>
          </div>

          <div className="remember-forgot">
            <label><input type="checkbox" />Remember me</label>
            <a href="/forgot-password">Forgot password?</a>
          </div>
          
          <button type="submit" className="bg-blue-600 text-white py-2 rounded">Login</button>

          <div className="register-link">
            <p>Don't have an account? <a href="/register">Register</a></p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginForm;