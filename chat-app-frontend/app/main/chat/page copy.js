'use client';

import React, { useState, useEffect, useContext, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../../context/AuthContext';
import io from 'socket.io-client';
import { getRooms, updateCurrentRoom, getMessages, getUser } from '../../utils/api';
import styles from './chat.module.css';

export default function Chat() {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    getRooms().then((roomsData) => {
      setRooms(roomsData);
      if (roomsData.length > 0) {
        setCurrentRoom(roomsData[0]._id);
      }
    });
  }, [user, router]);

  useEffect(() => {
    if (socketRef.current && currentRoom) {
      socketRef.current.emit('joinRoom', { room: currentRoom });
    }
  }, [currentRoom, socketRef]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    socketRef.current = io('http://localhost:5000', {
      auth: { token },
    });

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

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (currentRoom) {
      getMessages(currentRoom).then((messages) => {
        setMessages(messages);
      });
    }
  }, [currentRoom]);

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
                <li key={user._id} className={styles.onlineUser}>
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
    </div>
  );
}