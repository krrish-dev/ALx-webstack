const express = require('express');
const Room = require('../models/Room');
const router = express.Router();

// Create Room
router.post('/', async (req, res) => {
  const { name, description, createdBy } = req.body;

  try {
    // Check if room with the same name already exists
    const existingRoom = await Room.findOne({ name });
    if (existingRoom) {
      return res.status(400).json({ message: 'Room name already exists' });
    }

    // Check if createdBy is a valid user
    const creator = await User.findById(createdBy);
    if (!creator) {
      return res.status(400).json({ message: 'Invalid createdBy user ID' });
    }

    const room = new Room({ name, description, createdBy });
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ message: 'Error creating room', error });
  }
});

// Get All Rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find().populate('createdBy', 'username');
    res.status(200).json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Error fetching rooms', error });
  }
});

// Get Room by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const room = await Room.findById(id).populate('createdBy', 'username');
    if (!room) return res.status(404).json({ message: 'Room not found' });

    res.status(200).json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ message: 'Error fetching room', error });
  }
});

// Update Room
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    // Check if room with the same name already exists
    const existingRoom = await Room.findOne({ name, _id: { $ne: id } });
    if (existingRoom) {
      return res.status(400).json({ message: 'Room name already exists' });
    }

    const room = await Room.findByIdAndUpdate(id, { name, description }, { new: true }).populate('createdBy', 'username');
    if (!room) return res.status(404).json({ message: 'Room not found' });

    res.status(200).json(room);
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ message: 'Error updating room', error });
  }
});

// Delete Room
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const room = await Room.findByIdAndDelete(id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ message: 'Error deleting room', error });
  }
});


// Get users in a room with details
router.get('/:id/users', async (req, res) => {
  const { id } = req.params;

  try {
    const room = await Room.findById(id).populate({
      path: 'users',
      select: 'username profilePicture bio', // Include only necessary fields
    });

    if (!room) return res.status(404).json({ message: 'Room not found' });

    res.status(200).json(room.users || []); // Return the populated users array
  } catch (error) {
    console.error('Error fetching room users:', error);
    res.status(500).json({ message: 'Error fetching room users', error });
  }
});

module.exports = router;