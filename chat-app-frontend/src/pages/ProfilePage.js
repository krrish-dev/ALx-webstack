import React,{ useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import ProfileSettings from '../components/ProfileSettings';


const ProfilePage = () => {
  const { user, fetchUser, updateProfile } = useContext(AuthContext);

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-4 bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>
      <ProfileSettings />
    </div>
  );
};


export default ProfilePage;