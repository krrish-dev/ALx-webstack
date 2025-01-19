'use client';

import React, { useState, useEffect, useContext, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../../context/AuthContext';
import io from 'socket.io-client';
import { getRooms, updateCurrentRoom, getMessages, getUser, updateUserProfile, uploadProfilePicture } from '../../utils/api';
import styles from './chat.module.css';

export default function Chat() {
  const router = useRouter();
  const { user, logout, updateUser, loading } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const socketRef = useRef();

  if (loading) {
    return <div>Loading...</div>;
  }
  // Initialize socket connection and listen for events
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }
  
    // Initialize socket only if it doesn't already exist
    if (!socketRef.current) {
      socketRef.current = io('http://localhost:5000', {
        auth: { token },
      });
  
      socketRef.current.on('connect', () => {
        console.log('Connected to server');
      });
  
      // Listen for events
      socketRef.current.on('roomUsersUpdate', (users) => {
        console.log('Received online users:', users);
        setOnlineUsers(users);
      });
  
      socketRef.current.on('newMessage', (msg) => {
        setMessages((prevMessages) => [...prevMessages, msg]);
      });
  
      socketRef.current.on('userProfileUpdated', (updatedUser) => {
        setOnlineUsers((prevOnlineUsers) =>
          prevOnlineUsers.map((user) =>
            user._id === updatedUser._id ? updatedUser : user
          )
        );
      });
    }
  
    // Cleanup socket connection on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null; // Reset socketRef to allow reconnection
      }
    };
  }, [user]);
  
  // Fetch rooms and set current room only if not already set
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    getRooms().then((roomsData) => {
      setRooms(roomsData);
      if (!currentRoom && roomsData.length > 0) {
        setCurrentRoom(roomsData[0]._id);
      }
    });
  }, [user, router]);

  // Join the room when currentRoom changes
  useEffect(() => {
    if (socketRef.current && currentRoom) {
      socketRef.current.emit('joinRoom', { room: currentRoom });
    }
  }, [currentRoom, socketRef]);



  // Fetch messages when currentRoom changes
  useEffect(() => {
    if (currentRoom) {
      getMessages(currentRoom).then((messages) => {
        setMessages(messages);
      });
    }
  }, [currentRoom]);

  // Handle room change
  const handleRoomChange = async (roomId) => {
    if (!user) return;

    let userId = user._id;
    if (!userId) {
      try {
        const userData = await getUser();
        userId = userData._id;
      } catch (error) {
        console.error('Error fetching user data:', error.message);
        return;
      }
    }

    try {
      await updateCurrentRoom(userId, roomId);
      setCurrentRoom(roomId);

      // Refetch online users for the new room
      if (socketRef.current) {
        socketRef.current.emit('joinRoom', { room: roomId });
      }
    } catch (error) {
      console.error('Error updating current room:', error.message);
    }
  };

  // Send a new message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current || !user) return;

    let userId = user._id;
    if (!userId) {
      try {
        const userData = await getUser();
        userId = userData._id;
      } catch (error) {
        console.error('Error fetching user data:', error.message);
        return;
      }
    }

    const messageData = {
      text: newMessage,
      user: userId,
      roomId: currentRoom,
    };

    socketRef.current.emit('chat message', messageData);
    setNewMessage('');
  };

  const EditProfileModal = () => {
    const [username, setUsername] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // Add loading state
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true); // Start loading
  
      try {
        if (!user?._id) {
          console.error('User ID is undefined');
          return;
        }
  
        // Update user profile data
        const updatedUser = await updateUserProfile(user._id, { username, email, bio });
  
        if (updatedUser) {
          let updatedUserData = { ...user, username, email, bio };
  
          // Handle profile picture upload if a file is selected
          if (file) {
            const profilePictureResponse = await uploadProfilePicture(user._id, file);
  
            if (profilePictureResponse) {
              updatedUserData = {
                ...updatedUserData,
                profilePicture: profilePictureResponse.profilePicture,
              };
            }
          }
  
          // Update the global user state
          updateUser(updatedUserData);
  
          // Emit the updated user information to the WebSocket server
          if (socketRef.current) {
            socketRef.current.emit('updateProfile', updatedUserData);
          }
        }
  
        setShowModal(false); // Close the modal
      } catch (error) {
        console.error('Error updating profile:', error);
      } finally {
        setIsLoading(false); // Stop loading
      }
    };
  
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <h2>Edit Profile</h2>
          <form onSubmit={handleSubmit} className={styles.modalForm}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Bio"
            />
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              accept="image/*" // Restrict to image files
            />
            <div className={styles.modalButtons}>
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => setShowModal(false)} disabled={isLoading}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Handle user click to show user details modal
  const handleUserClick = (user) => {
    console.log('Clicked User:', user);
    setSelectedUser(user);
    setShowUserModal(true);
  };

  // User details modal component
  const UserDetailsModal = () => {
    if (!selectedUser) return null;

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <h2>{selectedUser.username}</h2>
          <p>{selectedUser.bio || 'No bio available.'}</p>
          <button onClick={() => setShowUserModal(false)} className={styles.closeButton}>
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Chat App</h1>
        <div className={styles.userInfo}>
          <img
            src={user?.profilePicture ? (
              user.profilePicture.startsWith('http')
                ? user.profilePicture
                : `http://localhost:5000${user.profilePicture}`
            ) : '/uploads/default-avatar.png'}
            alt={user?.username || 'User'}
            className={styles.avatar}
          />
          <span>{user?.username || 'Unknown User'}</span>
          <button onClick={() => setShowModal(true)} className={styles.editButton}>
            Edit Profile
          </button>
          <button onClick={logout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>
      <div className={styles.main}>
        <aside className={styles.sidebarLeft}>
          <h2>Rooms</h2>
          <ul>
            {rooms.map((room) => (
              <li
                key={room._id}
                className={currentRoom === room._id ? styles.activeRoom : ''}
                onClick={() => handleRoomChange(room._id)}
              >
                {room.name}
              </li>
            ))}
          </ul>
        </aside>
        <main className={styles.chatArea}>
          <div className={styles.messages}>
            {messages.map((msg, index) => (
              <div key={index} className={styles.message}>
                <div className={styles.messageContent}>
                  <strong>{msg.user.username}</strong>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={sendMessage} className={styles.messageForm}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              required
            />
            <button type="submit">Send</button>
          </form>
        </main>
        <aside className={styles.sidebarRight}>
          <h2>Online Users</h2>
          <ul>
            {onlineUsers && onlineUsers.length > 0 ? (
              onlineUsers.map((user) => (
                <li
                  key={user._id}
                  className={styles.onlineUser}
                  onClick={() => handleUserClick(user)}
                >
                  <img
                    src={user.profilePicture ? (user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:5000${user.profilePicture}`) : '/uploads/default-avatar.png'}
                    alt={user.username || 'User'}
                    className={styles.avatar}
                  />
                  <span>{user.username || 'Unknown User'}</span>
                </li>
              ))
            ) : (
              <li>No online users.</li>
            )}
          </ul>
        </aside>
      </div>
      {showModal && <EditProfileModal />}
      {showUserModal && <UserDetailsModal />}
    </div>
  );
}