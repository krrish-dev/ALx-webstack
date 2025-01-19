// Description: Handles all routes for messages
const express = require('express');
const Message = require('../models/Message');
const Room = require('../models/Room');
const User = require('../models/User');
const router = express.Router();

// Create a message
router.post('/', async (req, res) => {
  const { text, user, roomId } = req.body;

  try {
    const room = await Room.findById(roomId);
    const sender = await User.findById(user);

    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (!sender) return res.status(404).json({ message: 'User not found' });

    const message = new Message({ text, user, roomId });
    await message.save();

    res.status(201).json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ message: 'Error creating message', error });
  }
});

// Get all messages for a specific room
router.get('/:roomId', async (req, res) => {
  const { roomId } = req.params;

  try {
    const messages = await Message.find({ roomId })
      .populate('user', 'username profilePicture')
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages', error });
  }
});

// Delete a specific message
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const message = await Message.findByIdAndDelete(id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Error deleting message', error });
  }
});

module.exports = router;