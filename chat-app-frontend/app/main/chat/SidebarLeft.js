'use client';
// rooms area for chat page
import React from 'react';
import styles from './chat.module.css';

const SidebarLeft = ({ rooms, currentRoom, handleRoomChange }) => {
  return (
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
  );
};

export default SidebarLeft;