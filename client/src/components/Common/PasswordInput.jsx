// PasswordInput.js => reusable component
import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";

const PasswordInput = ({ value, onChange, placeholder="Password" }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="input-box">
      <input
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
      />
      <span 
        className="icon"
        onClick={() => setShowPassword(!showPassword)}
        style={{ cursor: 'pointer' }}
      >
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </span>
    </div>
  );
};

export default PasswordInput;
