import React from 'react';

const Message = ({ message }) => {
  return (
    <div className="p-2 bg-gray-100 rounded mb-2">
      <strong>{message.user.username}</strong>: {message.text}
    </div>
  );
};

export default Message;