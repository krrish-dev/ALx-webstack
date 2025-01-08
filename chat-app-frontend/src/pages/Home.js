import React, { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';

const Home = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="home-container">
      {isLogin ? (
        <Login setUser={setUser} toggle={() => setIsLogin(false)} />
      ) : (
        <Register setUser={setUser} toggle={() => setIsLogin(true)} />
      )}
    </div>
  );
};

export default Home;
