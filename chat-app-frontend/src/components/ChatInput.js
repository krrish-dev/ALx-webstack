import React, { useState } from 'react';
import { ChatContext } from '../context/ChatContext';
import ToastNotification from './ToastNotification';
import { useSocket } from '../utils/socket';

const ChatInput = () => {
  const [message, setMessage] = useState('');
  const { currentRoom } = React.useContext(ChatContext);
  const socket = useSocket();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    if (!currentRoom) {
      ToastNotification('Please join a room to send messages.', 'error');
      return;
    }
    socket.emit('chatMessage', { room: currentRoom, text: message });
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="p-2 flex-1 rounded-l-md border border-gray-300"
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded-r-md">
        Send
      </button>
    </form>
  );
};

export default ChatInput;