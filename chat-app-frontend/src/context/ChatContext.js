import React, { createContext, useState, useEffect } from 'react';
import { getRooms, getMessages, getRoomUsers } from '../utils/api'; // Import getRoomUsers API
import { useSocket } from '../utils/socket';

export const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [usersOnline, setUsersOnline] = useState([]);
  const socket = useSocket();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const roomsData = await getRooms();
        setRooms(roomsData);
      } catch (err) {
        console.error('Error fetching rooms:', err);
      }
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    if (currentRoom) {
      const fetchRoomData = async () => {
        try {
          // Fetch messages
          const messagesData = await getMessages(currentRoom);
          setMessages(messagesData);

          // Fetch room users
          const usersData = await getRoomUsers(currentRoom);
          console.log('Fetched room users:', usersData); // Debugging log
          setUsersOnline(usersData);
        } catch (err) {
          console.error('Error fetching room data:', err);
        }
      };
      fetchRoomData();
    }
  }, [currentRoom]);

  const joinRoom = (roomId) => {
    setCurrentRoom(roomId);
    socket.emit('joinRoom', { room: roomId });
  };

  return (
    <ChatContext.Provider value={{ rooms, currentRoom, messages, usersOnline, joinRoom }}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;
