import React, { useState, useContext } from 'react';
import { ChatContext } from '../context/ChatContext';

const UserDetailsModal = () => {
  const { selectedUser } = React.useContext(ChatContext);

  if (!selectedUser) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded">
        <h3 className="text-xl font-bold mb-2">{selectedUser.username}</h3>
        <p>{selectedUser.bio}</p>
      </div>
    </div>
  );
};

export default UserDetailsModal;