// PasswordInput.js => reusable component
import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";

const PasswordInput = ({ value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="input-box">
      <input
        type={showPassword ? 'text' : 'password'}
        placeholder="Password"
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
