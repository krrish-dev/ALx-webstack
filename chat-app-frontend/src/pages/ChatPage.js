import React, { useEffect, useContext } from 'react';
import { ChatContext } from '../context/ChatContext';
import MessageList from '../components/MessageList';
import ChatInput from '../components/ChatInput';
import Sidebar from '../components/Sidebar';
import UsersOnline from '../components/UsersOnline'; // Ensure it's used only once

const ChatPage = () => {
  const { currentRoom, rooms, joinRoom } = useContext(ChatContext);

  useEffect(() => {
    if (rooms.length > 0 && !currentRoom) {
      joinRoom(rooms[0]._id); // Automatically join the first room if no room is selected
    }
  }, [rooms, currentRoom, joinRoom]);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-4 bg-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            Chat Room: {currentRoom ? currentRoom : 'Select a room'}
          </h2>
        </div>
        <MessageList />
        <ChatInput />
      </div>
      {/* Users Online is rendered only once here */}
      <div className="w-64 bg-white p-4">
        <UsersOnline />
      </div>
    </div>
  );
};

export default ChatPage;
