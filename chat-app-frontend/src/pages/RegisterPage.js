import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login: authLogin, showNotification } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showNotification('Passwords do not match.', 'error');
      return;
    }
    try {
      const user = await register(username, email, password);
      authLogin(user);
      navigate('/chat');
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleSubmit} className="w-96 p-4 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        {/* form fields */}
      </form>
    </div>
  );
};

export default RegisterPage;