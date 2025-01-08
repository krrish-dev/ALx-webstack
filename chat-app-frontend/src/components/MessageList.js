import React, { useContext } from 'react';
import { ChatContext } from '../context/ChatContext';

const MessageList = () => {
  const { messages } = useContext(ChatContext);

  if (!messages) {
    console.error('messages is undefined'); // Debugging log
    return <p>Loading messages...</p>;
  }

  return (
    <div className="p-4 bg-white flex-1">
      <h3 className="text-lg font-bold mb-2">Messages</h3>
      {messages.length > 0 ? (
        messages.map((message) => (
          <div key={message._id} className="mb-2">
            <strong>{message.user.username}:</strong> {message.text}
          </div>
        ))
      ) : (
        <p>No messages yet in this room.</p>
      )}
    </div>
  );
};

export default MessageList;
