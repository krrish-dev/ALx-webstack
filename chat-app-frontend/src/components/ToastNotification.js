import React, { useState, useEffect } from 'react';

const ToastNotification = ({ message, type }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded shadow-lg ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
    >
      {message}
    </div>
  );
};

export default ToastNotification;