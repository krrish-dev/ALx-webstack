'use client';

import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const socketRef = useRef();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      console.log('Token:', token); // Ensure token is present
      if (!token) {
        console.error('No token found');
        return;
      }
      socketRef.current = io('http://localhost:5000', { auth: { token: token } });

      socketRef.current.on('connect', () => {
        console.log('Connected to server');
      });

      socketRef.current.on('chat message', (msg) => {
        setMessages(prevMessages => [...prevMessages, msg]);
      });

      socketRef.current.on('error', (err) => {
        console.error('Socket error:', err);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, []);

  const sendMessage = () => {
    if (socketRef.current) {
      socketRef.current.emit('chat message', message);
      setMessage('');
    }
  };

  return (
    <div>
      <h1>Chat</h1>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}