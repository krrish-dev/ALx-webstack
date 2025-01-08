import React, { useState } from 'react';
import '../styles/Login.css'; // Ensure you create this CSS file

const Login = ({ setUser, toggle }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save user and token to localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        setUser(data.user);
      } else {
        setError(data.message || 'Failed to login');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Log in to your account</p>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="login-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />
        <button onClick={handleSubmit} className="login-button">
          Login
        </button>
        {error && <p className="login-error">{error}</p>}
        <p className="login-footer">
          Don't have an account?{' '}
          <span onClick={toggle} className="login-link">
            Register
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
