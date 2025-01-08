const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/room');
const messageRoutes = require('./routes/messages');
const connectDB = require('./config/database');
const User = require('./models/User');
const Message = require('./models/Message');

const SECRET_KEY = 'your-secret-key'; // Replace with an environment variable in production

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Allow requests from your frontend
    methods: ['GET', 'POST'],
  },
});

// Middleware for REST API
app.use(cors());
app.use(express.json());

// REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/messages', messageRoutes);

// Active users tracking
const activeUsers = {};

// Middleware for WebSocket authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token; // Token sent during WebSocket handshake
    if (!token) return next(new Error('Authentication error'));

    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(decoded.id);

    if (!user) return next(new Error('Authentication error'));

    // Attach the authenticated user to the socket object
    socket.user = user;
    next();
  } catch (err) {
    console.error('WebSocket authentication error:', err);
    next(new Error('Authentication error'));
  }
});

// WebSocket connection
io.on('connection', (socket) => {
  const user = socket.user;
  console.log(`${user.username} connected:`, socket.id);

  // Add the user to the active users list
  activeUsers[socket.id] = {
    id: user._id,
    username: user.username,
    role: user.role,
    currentRoom: user.currentRoom,
    profilePicture: user.profilePicture || 'images/default-avatar.png',
  };

  // Notify all clients of the updated active users list
  io.emit('update_users', Object.values(activeUsers));

  // Handle a user joining a room
  socket.on('joinRoom', async ({ room }) => {
    try {
      // Update user's current room in the database
      await User.findByIdAndUpdate(user._id, { currentRoom: room }, { new: true });
      socket.join(room);
      activeUsers[socket.id].currentRoom = room;

      console.log(`${user.username} joined room ${room}`);

      // Notify everyone in the room
      io.to(room).emit('message', {
        username: 'System',
        text: `${user.username} has joined the room.`,
      });

      // Update users in the room
      const usersInRoom = Object.values(activeUsers).filter((u) => u.currentRoom === room);
      io.to(room).emit('roomUsers', usersInRoom);
    } catch (err) {
      console.error('Error joining room:', err);
    }
  });

  // Handle sending a chat message
  socket.on('chatMessage', async ({ room, text }) => {
    try {
      // Save the message to the database
      const savedMessage = await Message.create({
        text,
        user: user._id,
        roomId: room,
        createdAt: new Date(),
      });

      // Broadcast the message to everyone in the room
      io.to(room).emit('message', {
        text: savedMessage.text,
        user: {
          id: user._id,
          username: user.username,
          profilePicture: user.profilePicture || 'images/default-avatar.png',
        },
        roomId: savedMessage.roomId,
        createdAt: savedMessage.createdAt,
      });

      console.log(`Message sent to room ${room} by ${user.username}:`, text);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  });

  // Handle a user leaving a room
  socket.on('leaveRoom', ({ room }) => {
    socket.leave(room);
    activeUsers[socket.id].currentRoom = null;

    console.log(`${user.username} left room ${room}`);

    // Notify the room
    io.to(room).emit('message', {
      username: 'System',
      text: `${user.username} has left the room.`,
    });

    // Update users in the room
    const usersInRoom = Object.values(activeUsers).filter((u) => u.currentRoom === room);
    io.to(room).emit('roomUsers', usersInRoom);
  });

  // Handle WebSocket disconnection
  socket.on('disconnect', async () => {
    const disconnectedUser = activeUsers[socket.id];
    if (disconnectedUser?.currentRoom) {
      const { currentRoom } = disconnectedUser;

      // Notify everyone in the room that a user has disconnected
      io.to(currentRoom).emit('message', {
        username: 'System',
        text: `${user.username} has left the room.`,
      });

      // Send the updated list of users in the room
      const usersInRoom = Object.values(activeUsers).filter((u) => u.currentRoom === currentRoom);
      io.to(currentRoom).emit('roomUsers', usersInRoom);
    }

    // Clear the user's current room in the database
    await User.findByIdAndUpdate(user._id, { currentRoom: null });

    // Remove the user from active users
    delete activeUsers[socket.id];
    console.log(`${user.username} disconnected:`, socket.id);
  });
});

// Server listening
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
