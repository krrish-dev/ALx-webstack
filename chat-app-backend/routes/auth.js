require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Room = require('../models/Room');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, uniqueSuffix + fileExtension);
  },
});

const upload = multer({ storage: storage });
const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

// Middleware for authenticating users
const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(404).json({ message: 'User not found.' });
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

// Register a new user
router.post('/register', async (req, res) => {
  const { username, email, password, bio, profilePicture } = req.body;

  try {
    // Check if the username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Create a new user (password will be hashed by the User model's pre-save middleware)
    const user = new User({
      username,
      email,
      password, // Save the plain text password (it will be hashed automatically)
      bio,
      profilePicture,
    });
    await user.save();

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '365d' });

    // Respond with the token and user details
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Login an existing user
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Compare the input password with the stored hashed password
    const isPasswordValid = await user.comparePassword(password);
    console.log('Input Password:', password); // Debugging
    console.log('Stored Hashed Password:', user.password); // Debugging
    console.log('Password Comparison Result:', isPasswordValid); // Debugging

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '365d' });

    // Respond with the token and user details
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Fetch user details (protected route)
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('currentRoom');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

// Update user profile
router.put('/profile/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { username, email, bio } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { username, email, bio },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ message: 'Error updating user profile' });
  }
});

// Upload avatar
router.post('/upload-avatar/:id', authenticate, upload.single('avatar'), async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const filePath = `/uploads/${req.file.filename}`;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.profilePicture && user.profilePicture !== '/uploads/default-avatar.png') {
      const oldFilePath = path.join(__dirname, '..', user.profilePicture);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { profilePicture: filePath },
      { new: true }
    );

    res.status(200).json({ profilePicture: filePath });
  } catch (err) {
    console.error('Error uploading avatar:', err);
    res.status(500).json({ message: 'Error uploading avatar' });
  }
});

// Update current room for the user
router.put('/currentRoom/:id', authenticate, async (req, res) => {
  const { id } = req.params; // User ID
  const { roomId } = req.body; // New room ID

  try {
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const user = await User.findByIdAndUpdate(
      id,
      { currentRoom: roomId },
      { new: true }
    ).populate('currentRoom'); // Include the updated room in the response

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'Current room updated successfully', user });
  } catch (error) {
    console.error('Error updating current room:', error.message);
    res.status(500).json({ message: 'Error updating current room' });
  }
});

module.exports = router;