import React, { useState } from 'react';

const Register = ({ setUser, toggle }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    // Simulate registration API call
    const mockUser = { username };
    localStorage.setItem('user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  return (
    <div className="form-container">
      <h1>Register</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleSubmit}>Register</button>
      <p>
        Already have an account? <span onClick={toggle}>Login</span>
      </p>
    </div>
  );
};

export default Register;
