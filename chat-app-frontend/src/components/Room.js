import React from 'react';

const Room = ({ room, isSelected, onSelect }) => {
  return (
    <div
      className={`p-2 cursor-pointer ${isSelected ? 'bg-blue-200' : ''}`}
      onClick={() => onSelect(room._id)}
    >
      {room.name}
    </div>
  );
};

export default Room;