// AuthWrapper.js => reusable components
import React from 'react';

const AuthWrapper = ({ children }) => (
  <div className='login-form-container'>
    <div className="wrapper">
      {children}
    </div>
  </div>
);

export default AuthWrapper;
