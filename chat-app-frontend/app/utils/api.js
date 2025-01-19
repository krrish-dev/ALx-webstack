import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Helper function to get the token
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Create an axios instance with default headers
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to dynamically set the Authorization header
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login user
export const login = async (username, password) => {
  try {
    const res = await api.post('/auth/login', { username, password });

    // Log the user data after a successful login
    console.log('User Data After Login:', res.data.user);

    return { success: true, token: res.data.token, user: res.data.user };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Login failed' };
  }
};

// Register user
export const register = async (username, email, password) => {
  try {
    const res = await api.post('/auth/register', { username, email, password });
    return { success: true, user: res.data.user };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Registration failed' };
  }
};

// Get user profile
export const getUser = async () => {
  try {
    console.log('Fetching user profile with token:', getToken()); // Log the token
    const res = await api.get('/auth/profile');
    console.log('User profile response:', res.data); // Log the response
    return res.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (userId, data) => {
  try {
    const res = await api.put(`/auth/profile/${userId}`, data);
    return res.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
};


// Upload profile picture
export const uploadProfilePicture = async (userId, file) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file); // Ensure the field name is 'avatar'

    console.log('Uploading file:', file); // Log the file being uploaded

    const res = await api.post(`/auth/upload-avatar/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Ensure the correct content type
      },
    });

    console.log('Upload response:', res.data); // Log the response from the server
    return res.data;
  } catch (error) {
    console.error('Error uploading profile picture:', {
      error: error.response ? error.response.data : error.message,
    });
    return null;
  }
};

// Update current room
export const updateCurrentRoom = async (userId, roomId) => {
  try {
    const res = await api.put(`/auth/currentRoom/${userId}`, { roomId });
    return res.data;
  } catch (error) {
    console.error('Error updating current room:', error);
    return null;
  }
};

// Get all rooms
export const getRooms = async () => {
  try {
    const res = await api.get('/rooms');
    return res.data;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }
};

// Get room by ID
export const getRoomById = async (roomId) => {
  try {
    const res = await api.get(`/rooms/${roomId}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching room:', error);
    return null;
  }
};

// Create a room
export const createRoom = async (name, description, createdBy) => {
  try {
    const res = await api.post('/rooms', { name, description, createdBy });
    return res.data;
  } catch (error) {
    console.error('Error creating room:', error);
    return null;
  }
};

// Update a room
export const updateRoom = async (roomId, name, description) => {
  try {
    const res = await api.put(`/rooms/${roomId}`, { name, description });
    return res.data;
  } catch (error) {
    console.error('Error updating room:', error);
    return null;
  }
};

// Delete a room
export const deleteRoom = async (roomId) => {
  try {
    const res = await api.delete(`/rooms/${roomId}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting room:', error);
    return null;
  }
};

// Get users in a room
export const getRoomUsers = async (roomId) => {
  try {
    const res = await api.get(`/rooms/${roomId}/users`);
    return res.data; // This should be an array of user objects with username, profilePicture, etc.
  } catch (error) {
    console.error('Error fetching room users:', error);
    return [];
  }
};

// Create a message
export const createMessage = async (text, userId, roomId) => {
  try {
    const res = await api.post('/messages', { text, user: userId, roomId });
    return res.data;
  } catch (error) {
    console.error('Error creating message:', error);
    return null;
  }
};

// Get messages in a room
export const getMessages = async (roomId) => {
  try {
    const res = await api.get(`/messages/${roomId}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

// Delete a message
export const deleteMessage = async (messageId) => {
  try {
    const res = await api.delete(`/messages/${messageId}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting message:', error);
    return null;
  }
};

export default api;