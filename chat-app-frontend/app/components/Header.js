import React from 'react';
import Link from 'next/link';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function Header() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header>
      <div>
        <img src={user?.profilePicture} alt={user?.username} />
        <span>{user?.username}</span>
      </div>
      <nav>
        <Link href="/dashboard/chat">Chat</Link>
        <Link href="/dashboard/profile">Profile</Link>
        <button onClick={logout}>Logout</button>
      </nav>
    </header>
  );
}

// export default Header;