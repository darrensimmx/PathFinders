import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../LoginForm.css';
import axios from 'axios';
import PasswordInput from '../Common/PasswordInput';
import AuthWrapper from '../Common/AuthWrapper';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const urlToken = query.get('token');
    if (urlToken) setToken(urlToken);
    else alert('Invalid or missing token');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      alert('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/reset-password`, {
        token,
        newPassword
      });

      if (response.data.status === 'success') {
        alert('Password reset successfully! Please log in.');
        navigate('/');
      } else {
        alert(response.data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error(error);
      alert('Server error');
    }
  };

  return (
    <AuthWrapper>
      <form onSubmit={handleSubmit}>
        <h1>Reset Password</h1>

        <PasswordInput
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New Password"
        />

        <PasswordInput
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm New Password"
        />

        <button type="submit" className="bg-blue-600 text-white py-2 rounded">Reset Password</button>

        <div className="register-link">
          <p>Remembered your password? <Link to="/">Back to Login</Link></p>
        </div>
      </form>
    </AuthWrapper>
  );
};

export default ResetPassword;
