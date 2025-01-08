import React, { useState, useEffect } from 'react';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [editRoomId, setEditRoomId] = useState(null);
  const [editRoomName, setEditRoomName] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  // Fetch all rooms
  const fetchRooms = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/rooms');
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  // Create a new room
  const handleCreateRoom = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRoomName }),
      });

      if (response.ok) {
        setNewRoomName('');
        fetchRooms();
      } else {
        console.error('Error creating room');
      }
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  // Update a room
  const handleUpdateRoom = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/rooms/${editRoomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editRoomName }),
      });

      if (response.ok) {
        setEditRoomId(null);
        setEditRoomName('');
        fetchRooms();
      } else {
        console.error('Error updating room');
      }
    } catch (error) {
      console.error('Error updating room:', error);
    }
  };

  // Delete a room
  const handleDeleteRoom = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/rooms/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchRooms();
      } else {
        console.error('Error deleting room');
      }
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  return (
    <div className="room-management">
      <h1>Room Management</h1>

      {/* Create Room */}
      <div>
        <input
          type="text"
          placeholder="New Room Name"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
        />
        <button onClick={handleCreateRoom}>Create Room</button>
      </div>

      {/* Room List */}
      <ul>
        {rooms.map((room) => (
          <li key={room._id}>
            {editRoomId === room._id ? (
              <>
                <input
                  type="text"
                  value={editRoomName}
                  onChange={(e) => setEditRoomName(e.target.value)}
                />
                <button onClick={handleUpdateRoom}>Save</button>
                <button onClick={() => setEditRoomId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <span>{room.name}</span>
                <button onClick={() => {
                  setEditRoomId(room._id);
                  setEditRoomName(room.name);
                }}>Edit</button>
                <button onClick={() => handleDeleteRoom(room._id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomManagement;
