const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://chat-app-websocket:s3NVhqEqsoJMdEvd@cluster0.wqzjh.mongodb.net/chat-app-db?retryWrites=true&w=majority'
    );
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Exit the process with failure
  }
};

module.exports = connectDB;
