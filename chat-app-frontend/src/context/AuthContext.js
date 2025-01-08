import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, getUser } from '../utils/api';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      const user = await getUser(token);
      setUser(user);
    } catch {
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const handleLogin = async (username, password) => {
    try {
      const response = await login(username, password);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      navigate('/chat');
    } catch (error) {
      console.error('Login failed:', error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login: handleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
