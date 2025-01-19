'use client';
// edit profile modal for chat page
import React, { useState } from 'react';
import {updateUserProfile, uploadProfilePicture } from '../../utils/api';
import styles from './chat.module.css';

const EditProfileModal = ({ user, updateUser, setShowModal, socketRef }) => {
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user?._id) {
        console.error('User ID is undefined');
        return;
      }

      // Update user profile data
      const updatedUser = await updateUserProfile(user._id, { username, email, bio });

      if (updatedUser) {
        let updatedUserData = { ...user, username, email, bio };

        // Handle profile picture upload if a file is selected
        if (file) {
          const profilePictureResponse = await uploadProfilePicture(user._id, file);

          if (profilePictureResponse) {
            updatedUserData = {
              ...updatedUserData,
              profilePicture: profilePictureResponse.profilePicture,
            };
          }
        }

        // Update the global user state
        updateUser(updatedUserData);

        // Emit the updated user information to the WebSocket server
        if (socketRef.current) {
          socketRef.current.emit('updateProfile', updatedUserData);
        }
      }

      setShowModal(false); // Close the modal
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Edit Profile</h2>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Bio"
          />
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            accept="image/*"
          />
          <div className={styles.modalButtons}>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => setShowModal(false)} disabled={isLoading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;