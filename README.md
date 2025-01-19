# ALx-webstack Chat Application
Webstack - Portfolio Project 

## Overview
This project is a real-time chat application that allows users to join different chat rooms and exchange messages in real-time. The application is built using a modern tech stack, including React for the frontend, Node.js for the backend, and WebSocket for real-time communication. The application also includes features like user authentication, chat history storage, and the ability for users to upload profile pictures and add bios.

---

## Tech Stack

### Frontend
- **React**: A JavaScript library for building user interfaces.
- **Next.js**: A React framework for server-side rendering and static site generation.
- **React Context API**: For state management across the application.
- **Axios**: For making HTTP requests to the backend API.
- **Socket.IO Client**: For real-time communication with the backend via WebSocket.
- **Tailwind CSS**: For styling the application.

### Backend
- **Node.js**: A JavaScript runtime for building the backend server.
- **Express.js**: A web framework for Node.js to handle API requests.
- **MongoDB**: A NoSQL database for storing user data, chat rooms, and messages.
- **Mongoose**: An ODM (Object Data Modeling) library for MongoDB.
- **Socket.IO**: For real-time, bidirectional communication between the client and server.
- **JWT (JSON Web Tokens)**: For user authentication and authorization.
- **Multer**: For handling file uploads (e.g., profile pictures).
- **Bcrypt**: For hashing user passwords.

---

## Real-Time Communication
- **WebSocket**: Used via Socket.IO to enable real-time messaging between users in the same chat room.

---

## Features

### User Authentication
- Users can register and log in using a username and password.
- JWT tokens are used to authenticate users and manage sessions.

### Real-Time Chat
- Users can join different chat rooms and send/receive messages in real-time.
- Messages are stored in the database for chat history.

### Profile Management
- Users can upload profile pictures and add a bio.
- Users can view the bios and profile pictures of other users in the same chat room.

### Responsive Design
- The application is designed to be responsive and works well on both desktop and mobile devices.

### Chat History
- All messages are stored in the database, allowing users to view past conversations when they rejoin a room.

---

## API Endpoints

### Auth Endpoints
- **POST /api/auth/register**: Register a new user.
  - **Request Body**: `{ username, email, password }`
  - **Response**: `{ token, user }`
- **POST /api/auth/login**: Log in an existing user.
  - **Request Body**: `{ username, password }`
  - **Response**: `{ token, user }`
- **GET /api/auth/profile**: Fetch the authenticated user's profile.
  - **Response**: `{ user }`
- **PUT /api/auth/profile/:id**: Update the authenticated user's profile.
  - **Request Body**: `{ username, email, bio }`
  - **Response**: `{ user }`
- **POST /api/auth/upload-avatar/:id**: Upload a profile picture for the authenticated user.
  - **Request Body**: `{ file }`
  - **Response**: `{ profilePicture }`
- **PUT /api/auth/currentRoom/:id**: Update the user's current room.
  - **Request Body**: `{ roomId }`
  - **Response**: `{ user }`

### Room Endpoints
- **POST /api/rooms**: Create a new chat room.
  - **Request Body**: `{ name, description, createdBy }`
  - **Response**: `{ room }`
- **GET /api/rooms**: Fetch all chat rooms.
  - **Response**: `[ { room } ]`
- **GET /api/rooms/:id**: Fetch a specific chat room by ID.
  - **Response**: `{ room }`
- **PUT /api/rooms/:id**: Update a chat room.
  - **Request Body**: `{ name, description }`
  - **Response**: `{ room }`
- **DELETE /api/rooms/:id**: Delete a chat room.
  - **Response**: `{ message }`
- **GET /api/rooms/:id/users**: Fetch all users in a specific chat room.
  - **Response**: `[ { user } ]`

### Message Endpoints
- **POST /api/messages**: Create a new message in a chat room.
  - **Request Body**: `{ text, user, roomId }`
  - **Response**: `{ message }`
- **GET /api/messages/:roomId**: Fetch all messages in a specific chat room.
  - **Response**: `[ { message } ]`
- **DELETE /api/messages/:id**: Delete a specific message.
  - **Response**: `{ message }`

---

## WebSocket Events

### Client-to-Server
- **joinRoom**: Join a specific chat room.
  - **Data**: `{ room }`
- **chat message**: Send a new message to the current room.
  - **Data**: `{ text, user, roomId }`
- **updateProfile**: Update the user's profile and broadcast the changes to the room.
  - **Data**: `{ updatedUser }`

### Server-to-Client
- **roomUsersUpdate**: Broadcast the updated list of users in the room.
  - **Data**: `[ { user } ]`
- **newMessage**: Broadcast a new message to all users in the room.
  - **Data**: `{ text, user }`
- **userProfileUpdated**: Broadcast the updated user profile to all users in the room.
  - **Data**: `{ updatedUser }`

---

## Milestones

1. **Implement Authentication**
   - Users can register, log in, and log out.
   - JWT tokens are used to manage user sessions.
2. **Store User Chat History**
   - All messages are stored in the database, allowing users to view past conversations.
3. **Make Application Responsive**
   - The application is designed to work seamlessly on both desktop and mobile devices.
4. **Bonus: Profile Pictures and Bios**
   - Users can upload profile pictures and add bios.
   - Users can view the bios and profile pictures of other users in the same chat room.
5. **Bonus: View Bios of Other Users**
   - Users can click on other users in the chat room to view their bios and profile pictures.

---

## How to Run the Project

### Clone the Repository
```bash
git clone https://github.com/your-username/chat-app.git
cd chat-app
```

### Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Set Up Environment Variables
Create a `.env` file in the backend directory with the following variables:

```env
SECRET_KEY=your-secret-key
MONGODB_URI=your-mongodb-connection-string
PORT=5000
```

### Run the Backend Server
```bash
cd backend
npm start
```

### Run the Frontend Server
```bash
cd frontend
npm run dev
```

### Access the Application
Open your browser and navigate to `http://localhost:3000`.

---

## Conclusion
This chat application is a great example of how to build a real-time communication platform using modern web technologies. It demonstrates the use of WebSocket for real-time messaging, JWT for authentication, and MongoDB for data storage. The project also includes advanced features like profile management and responsive design, making it a comprehensive learning experience for developers.
