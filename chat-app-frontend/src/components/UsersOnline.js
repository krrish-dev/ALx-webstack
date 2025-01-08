import React, { useContext } from 'react';
import { ChatContext } from '../context/ChatContext';

const UsersOnline = () => {
  const { usersOnline } = useContext(ChatContext);

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-2">Users Online</h3>
      {usersOnline.length > 0 ? (
        usersOnline.map((user) => (
          <div key={user._id} className="mb-2 flex items-center">
            <img
              src={user.profilePicture || '/default-avatar.png'}
              alt={user.username}
              className="w-8 h-8 rounded-full mr-2"
            />
            <span>{user.username}</span>
          </div>
        ))
      ) : (
        <p>No users online in this room.</p>
      )}
    </div>
  );
};

export default UsersOnline;
