'use client';

import React from 'react';
import styles from './chat.module.css';

const ChatArea = ({ messages, newMessage, setNewMessage, sendMessage }) => {
  return (
    <main className={styles.chatArea}>
      <div className={styles.messages}>
        {messages.map((msg, index) => (
          <div key={index} className={styles.message}>
            <div className={styles.messageContent}>
              <strong>{msg.user.username}</strong>
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className={styles.messageForm}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          required
        />
        <button type="submit">Send</button>
      </form>
    </main>
  );
};

export default ChatArea;