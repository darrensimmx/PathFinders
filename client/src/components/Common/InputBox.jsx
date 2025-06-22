// InputBox.js => reusable components
import React from 'react';

const InputBox = ({ type, placeholder, value, onChange, icon, rightIcon, onRightIconClick }) => (
  <div className="input-box">
    <input 
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
    />
    {icon && <span className="icon">{icon}</span>}
    {rightIcon && (
      <span 
        className="icon" 
        onClick={onRightIconClick} 
        style={{ cursor: 'pointer' }}
      >
        {rightIcon}
      </span>
    )}
  </div>
);

export default InputBox;
