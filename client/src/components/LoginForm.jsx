//Page for Login 
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../src/LoginForm.css'

//icons for login
import { FaUser, FaEye, FaEyeSlash } from "react-icons/fa";


const LoginForm = () =>  {
  //track the current states of email and pw
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); //by default pw typed is censored
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    //TODO: Replace below mock data with call to backend
    if (email === 'abc@gmail.com' && password === 'password123') {
      navigate('/route-generator');
    } else {
      alert('Invalid login credentials')
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
            <a href="#">Forgot password?</a>
          </div>
          
          <button type="submit" className="bg-blue-600 text-white py-2 rounded">Login</button>

          <div className="register-link">
            <p>Don't have an account? <a href="#">Register</a></p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginForm;