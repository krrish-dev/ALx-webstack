import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const login = async (username, password) => {
  const response = await axios.post(`${API_URL}/auth/login`, { username, password });
  return response.data;
};

export const register = async (username, email, password) => {
  const response = await axios.post(`${API_URL}/auth/register`, { username, email, password });
  return response.data;
};

export const getUser = async (token) => {
  const response = await axios.get(`${API_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateProfile = async (token, updates) => {
  const response = await axios.put(`${API_URL}/auth/profile`, updates, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getRooms = async () => {
  const response = await axios.get(`${API_URL}/rooms`);
  return response.data;
};

export const getRoomUsers = async (roomId) => {
  const response = await axios.get(`${API_URL}/rooms/${roomId}/users`);
  return response.data;
};


export const getMessages = async (roomId) => {
  const response = await axios.get(`${API_URL}/messages/${roomId}`);
  return response.data;
};