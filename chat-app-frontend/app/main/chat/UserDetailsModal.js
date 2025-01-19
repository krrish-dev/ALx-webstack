'use client';

import React from 'react';
import styles from './chat.module.css';

const UserDetailsModal = ({ selectedUser, setShowUserModal }) => {
  if (!selectedUser) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>{selectedUser.username}</h2>
        <p>{selectedUser.bio || 'No bio available.'}</p>
        <button onClick={() => setShowUserModal(false)} className={styles.closeButton}>
          Close
        </button>
      </div>
    </div>
  );
};

export default UserDetailsModal;