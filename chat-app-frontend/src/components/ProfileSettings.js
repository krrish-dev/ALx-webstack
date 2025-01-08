import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import ToastNotification from './ToastNotification';

const ProfileSettings = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    profilePicture: user?.profilePicture || '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser(formData); // Removed unnecessary `updatedUser`
      ToastNotification('Profile updated successfully!', 'success');
    } catch (error) {
      ToastNotification(error.message, 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <input
        type="text"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        placeholder="Username"
        className="p-2 w-full mb-4 border border-gray-300 rounded"
      />
      <textarea
        value={formData.bio}
        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
        placeholder="Bio"
        className="p-2 w-full mb-4 border border-gray-300 rounded"
      ></textarea>
      <input
        type="text"
        value={formData.profilePicture}
        onChange={(e) =>
          setFormData({ ...formData, profilePicture: e.target.value })
        }
        placeholder="Profile Picture URL"
        className="p-2 w-full mb-4 border border-gray-300 rounded"
      />
      <input
        type="password"
        value={formData.password}
        onChange={(e) =>
          setFormData({ ...formData, password: e.target.value })
        }
        placeholder="New Password (optional)"
        className="p-2 w-full mb-4 border border-gray-300 rounded"
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Update Profile
      </button>
    </form>
  );
};

export default ProfileSettings;
