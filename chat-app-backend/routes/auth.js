const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Room = require('../models/Room');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const router = express.Router();
const SECRET_KEY = 'your-secret-key'; // Replace with environment variable in production

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
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const defaultRoom = await Room.findOne({ name: 'General' }) || await new Room({ name: 'General', description: 'Default room' }).save();

    const user = new User({ username, email, password, bio, profilePicture, currentRoom: defaultRoom._id });
    await user.save();

    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '365d' });

    res.status(201).json({
      token,
      user: { id: user._id, username: user.username, email: user.email, bio, profilePicture, currentRoom: user.currentRoom },
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
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.currentRoom) {
      const defaultRoom = await Room.findOne({ name: 'General' }) || await new Room({ name: 'General', description: 'Default room' }).save();
      user.currentRoom = defaultRoom._id;
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '365d' });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePicture: user.profilePicture,
        currentRoom: user.currentRoom,
      },
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Fetch user details (protected route)
router.get('/profile/:id', authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select('-password').populate('currentRoom');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

// Update user profile (protected route)
router.put('/profile/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { username, bio, profilePicture, password } = req.body;

  try {
    const updates = { username, bio, profilePicture };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
      .select('-password')
      .populate('currentRoom');

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Update current room (new route)
router.put('/currentRoom/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { roomId } = req.body;

  try {
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const user = await User.findByIdAndUpdate(id, { currentRoom: roomId }, { new: true })
      .select('-password')
      .populate('currentRoom');

    res.status(200).json({ message: 'Room updated successfully', user });
  } catch (err) {
    console.error('Error updating current room:', err);
    res.status(500).json({ message: 'Error updating current room' });
  }
});

// Upload avatar (new route)
router.post('/upload-avatar/:id', authenticate, upload.single('avatar'), async (req, res) => {
  const { id } = req.params;
  const filePath = req.file.path; // Save the file path or process as needed

  try {
    const user = await User.findByIdAndUpdate(id, { profilePicture: filePath }, { new: true });
    res.status(200).json(user);
  } catch (err) {
    console.error('Error uploading avatar:', err);
    res.status(500).json({ message: 'Error uploading avatar' });
  }
});

module.exports = router;