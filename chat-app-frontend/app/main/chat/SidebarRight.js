'use client';
// Users online area for chat page
import React from 'react';
import styles from './chat.module.css';

const SidebarRight = ({ onlineUsers, handleUserClick }) => {
  return (
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
  );
};

export default SidebarRight;