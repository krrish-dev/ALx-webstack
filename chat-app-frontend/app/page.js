"use client"; // Mark this component as a Client Component

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This code runs only on the client side
    setIsClient(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">
        Welcome to My chat App!
      </h1>

      {/* Conditionally render client-only content */}
      {isClient && (
        <p className="text-lg text-gray-700">
          This content is only rendered on the client.
        </p>
      )}

      {/* Static content that matches server and client */}
      <p className="text-lg text-gray-700 mt-4">
        Static content that is the same on both server and client.
      </p>
    </div>
  );
}
