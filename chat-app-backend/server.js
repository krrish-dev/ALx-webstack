require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Room = require('./models/Room');
const Message = require('./models/Message');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/room');
const messageRoutes = require('./routes/messages');
const path = require('path');
const connectDB = require('./config/database');

const SECRET_KEY = process.env.SECRET_KEY;

if (!SECRET_KEY) {
  throw new Error('SECRET_KEY is not defined in the environment variables.');
}

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/messages', messageRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Default route for root URL
// app.get('/', (req, res) => {
//   res.send('Socket.IO server is running.');
// });

// Middleware for WebSocket authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new Error('Authentication error'));
    }
    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.username} (${socket.user._id})`);


  socket.on('joinRoom', async ({ room }) => {
    try {
      console.log('User joining room:', room);
  
      // If the user is already in a room, leave it
      if (socket.currentRoom) {
        console.log('Leaving current room:', socket.currentRoom);
  
        // Find the old room and remove the user from its users list
        const oldRoom = await Room.findById(socket.currentRoom);
        if (oldRoom) {
          oldRoom.users = oldRoom.users.filter(user => user.toString() !== socket.user._id.toString());
          await oldRoom.save();
        }
        socket.leave(socket.currentRoom);
  
        // Broadcast the user's departure to the old room
        io.to(socket.currentRoom).emit('userLeft', socket.user._id);
      }
  
      // Join the new room
      socket.join(room);
      socket.currentRoom = room; // Set the current room
      console.log('User joined room:', room);
      console.log('socket.currentRoom set to:', socket.currentRoom);
  
      // Find the new room and add the user to its users list
      const roomData = await Room.findById(room).populate('users', 'username profilePicture bio');
      if (!roomData.users.some(u => u._id.toString() === socket.user._id.toString())) {
        roomData.users.push(socket.user);
        await roomData.save();
      }
  
      // Broadcast the updated list of users in the new room
      const users = roomData.users.map(u => u.toObject());
      console.log('Broadcasting roomUsersUpdate:', users);
      io.to(room).emit('roomUsersUpdate', users);
  
      console.log(`User ${socket.user.username} joined room: ${room}`);
    } catch (err) {
      console.error('Error in joinRoom:', err);
    }
  });

  socket.on('updateProfile', async (updatedUser) => {
    try {
      // Update socket.user with the latest data
      socket.user = updatedUser;
  
      if (socket.currentRoom) {
        // Broadcast the updated user information to all clients in the same room
        io.to(socket.currentRoom).emit('userProfileUpdated', updatedUser);
  
        // Update the room's users list with the latest user data
        const room = await Room.findById(socket.currentRoom);
        if (room) {
          room.users = room.users.map(user => {
            if (user._id.toString() === updatedUser._id.toString()) {
              return { ...user, ...updatedUser };
            }
            return user;
          });
          await room.save();
  
          // Emit 'roomUsersUpdate' to update clients' onlineUsers state
          const updatedRoom = await Room.findById(socket.currentRoom).populate('users', 'username profilePicture bio');
          io.to(socket.currentRoom).emit('roomUsersUpdate', updatedRoom.users);
        }
      }
    } catch (err) {
      console.error('Error broadcasting profile update:', err);
    }
  });

  // // Handle room changes
  // socket.on('joinRoom', async ({ room }) => {
  //   try {
  //     // If the user is already in a room, leave it
  //     if (socket.currentRoom) {
  //       // Find the old room and remove the user from its users list
  //       const oldRoom = await Room.findById(socket.currentRoom);
  //       if (oldRoom) {
  //         oldRoom.users = oldRoom.users.filter(user => user.toString() !== socket.user._id.toString());
  //         await oldRoom.save();
  //       }
  //       socket.leave(socket.currentRoom);

  //       // Broadcast the user's departure to the old room
  //       io.to(socket.currentRoom).emit('userLeft', socket.user._id);
  //     }

  //     // Join the new room
  //     socket.join(room);
  //     socket.currentRoom = room;

  //     // Find the new room and add the user to its users list
  //     const roomData = await Room.findById(room).populate('users', 'username profilePicture bio');
  //     if (!roomData.users.some(u => u._id.toString() === socket.user._id.toString())) {
  //       roomData.users.push(socket.user);
  //       await roomData.save();
  //     }

  //     // Broadcast the updated list of users in the new room
  //     const users = roomData.users.map(u => u.toObject());
  //     console.log('Broadcasting roomUsersUpdate:', users); // Log the data being sent
  //     io.to(room).emit('roomUsersUpdate', users);

  //     console.log(`User ${socket.user.username} joined room: ${room}`);
  //   } catch (err) {
  //     console.error('Error in joinRoom:', err);
  //   }
  // });

  // Handle chat messages
  socket.on('chat message', async (msg) => {
    try {
      // Destructure the message object
      const { text, user, roomId } = msg;

      // Validate required fields
      if (!text || !user || !roomId) {
        console.error('Missing required fields:', { text, user, roomId });
        return;
      }

      // Create and save the message
      const message = new Message({
        text, // Use the 'text' field from the message object
        user, // Use the 'user' field from the message object
        roomId, // Use the 'roomId' field from the message object
      });
      await message.save();

      // Broadcast the message to all users in the room
      io.to(roomId).emit('newMessage', {
        text,
        user: {
          _id: socket.user._id,
          username: socket.user.username,
          profilePicture: socket.user.profilePicture,
        },
      });

      console.log(`Message from ${socket.user.username}: ${text}`);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('disconnect', async () => {
    console.log(`User disconnected: ${socket.user.username} (${socket.user._id})`);
    try {
      if (socket.currentRoom) {
        const room = await Room.findById(socket.currentRoom);
        if (room) {
          console.log('Removing user from room:', room.name);
          room.users = room.users.filter((userId) => userId.toString() !== socket.user._id.toString());
          await room.save();
  
          // Emit the updated list of users in the room
          const updatedRoom = await Room.findById(socket.currentRoom).populate('users', 'username profilePicture');
          console.log('Updated room users after disconnect:', updatedRoom.users);
          io.to(socket.currentRoom).emit('roomUsersUpdate', updatedRoom.users);
        }
      }
    } catch (err) {
      console.error('Error during disconnect:', err);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
