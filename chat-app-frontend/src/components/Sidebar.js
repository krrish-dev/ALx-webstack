import React, { useContext } from 'react';
import { ChatContext } from '../context/ChatContext';

const Sidebar = () => {
  const { rooms, joinRoom } = useContext(ChatContext);

  if (!rooms) {
    console.error('rooms is undefined'); // Debugging log
    return <p>Loading rooms...</p>;
  }

  return (
    <div className="p-4 bg-white w-64">
      <h3 className="text-lg font-bold mb-2">Rooms</h3>
      <ul>
        {rooms.map((room) => (
          <li
            key={room._id}
            onClick={() => joinRoom(room._id)}
            className="cursor-pointer p-2 hover:bg-gray-100"
          >
            {room.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
