const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Message = require('./models/Message');
const Room = require('./models/Room');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/room');
const messageRoutes = require('./routes/messages');
const connectDB = require('./config/database');

const SECRET_KEY = 'your-secret-key'; // Replace with environment variable in production

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/messages', messageRoutes);

// Middleware for WebSocket authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));

    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(decoded.id);

    if (!user) return next(new Error('Authentication error'));

    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

const roomUsers = {};

io.on('connection', (socket) => {
  const user = socket.user;
  console.log(`${user.username} connected:`, socket.id);

  // Join room
  socket.on('joinRoom', async ({ room }) => {
    if (socket.currentRoom === room) return;
  
    if (socket.currentRoom) {
      socket.leave(socket.currentRoom);
    }
  
    socket.join(room);
    socket.currentRoom = room;
  
    try {
      // Fetch or create the room
      let roomData = await Room.findOne({ _id: room }).populate('users', 'username profilePicture');
      if (!roomData) {
        roomData = new Room({ _id: room, users: [user._id], createdBy: user._id });
        await roomData.save();
      } else {
        // Add the user to the room if not already present
        if (!roomData.users.some((u) => u._id.toString() === user._id.toString())) {
          roomData.users.push(user._id);
          await roomData.save();
        }
      }
  
      // Debugging: Log room users
      console.log(`Room "${room}" Users:`, roomData.users);
  
      // Emit the updated list of users to the room
      io.to(room).emit('roomUsersUpdate', roomData.users);
  
      // Notify others in the room
      socket.to(room).emit('message', {
        username: 'System',
        text: `${user.username} has joined the room.`,
      });
    } catch (err) {
      console.error('Error in joinRoom handler:', err);
    }
  });
  
  
  
  
  

  // Leave room
  socket.on('leaveRoom', async ({ room }) => {
    if (socket.currentRoom === room) {
      socket.leave(room);
      socket.currentRoom = null;
  
      try {
        let roomData = await Room.findOne({ _id: room });
        if (roomData) {
          roomData.users = roomData.users.filter((u) => u.toString() !== user._id.toString());
          await roomData.save();
  
          // Debugging: Log updated room data
          console.log('Updated Room Data (after leave):', roomData);
  
          // Emit updated users to the room
          const usersInRoom = await Room.findOne({ _id: room }).populate('users', 'username profilePicture');
          io.to(room).emit('roomUsersUpdate', usersInRoom.users);
  
          socket.to(room).emit('message', {
            username: 'System',
            text: `${user.username} has left the room.`,
          });
        }
      } catch (err) {
        console.error('Error in leaveRoom handler:', err);
      }
    }
  });
  

  // Send message
  socket.on('chatMessage', async ({ room, text }) => {
    if (!room || !text) return;
    const message = new Message({ text, user: user._id, roomId: room });
    await message.save();
    socket.to(room).emit('message', { user, text });
  });

  // User disconnects
  socket.on('disconnect', async () => {
    if (socket.currentRoom) {
      try {
        const roomData = await Room.findOne({ _id: socket.currentRoom });
        if (roomData) {
          roomData.users = roomData.users.filter((u) => u.toString() !== user._id.toString());
          await roomData.save();
  
          // Debugging: Log updated room data
          console.log('Updated Room Data (after disconnect):', roomData);
  
          const usersInRoom = await Room.findOne({ _id: socket.currentRoom }).populate('users', 'username profilePicture');
          io.to(socket.currentRoom).emit('roomUsersUpdate', usersInRoom.users);
  
          socket.to(socket.currentRoom).emit('message', {
            username: 'System',
            text: `${user.username} has disconnected.`,
          });
        }
      } catch (err) {
        console.error('Error in disconnect handler:', err);
      }
    }
    console.log(`${user.username} disconnected:`, socket.id);
  });
  

});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});