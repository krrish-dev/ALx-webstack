'use client';
// main chat page running on chat app
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../../context/AuthContext';
import io from 'socket.io-client';
import { getRooms, updateCurrentRoom, getMessages, getUser } from '../../utils/api';
import styles from './chat.module.css';
import EditProfileModal from './EditProfileModal';
import UserDetailsModal from './UserDetailsModal';
import ChatArea from './ChatArea';
import SidebarLeft from './SidebarLeft';
import SidebarRight from './SidebarRight';

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

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    socketRef.current = io('http://localhost:5000', {
      auth: { token },
    });

    // Listen for socket events
    socketRef.current.on('connect', () => {
      console.log('Connected to server');
    });

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

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Join room when currentRoom changes
  useEffect(() => {
    if (socketRef.current && currentRoom) {
      socketRef.current.emit('joinRoom', { room: currentRoom });
    }
  }, [currentRoom]);

  // Fetch rooms and set current room
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

  // Handle user click to show user details modal
  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
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
        <SidebarLeft rooms={rooms} currentRoom={currentRoom} handleRoomChange={handleRoomChange} />
        <ChatArea messages={messages} newMessage={newMessage} setNewMessage={setNewMessage} sendMessage={sendMessage} />
        <SidebarRight onlineUsers={onlineUsers} handleUserClick={handleUserClick} />
      </div>
      {showModal && (
        <EditProfileModal
          user={user}
          updateUser={updateUser}
          setShowModal={setShowModal}
          socketRef={socketRef}
        />
      )}
      {showUserModal && (
        <UserDetailsModal
          selectedUser={selectedUser}
          setShowUserModal={setShowUserModal}
        />
      )}
    </div>
  );
}