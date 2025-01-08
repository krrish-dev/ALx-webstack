const Navbar = () => {
    const handleLogout = () => {
      localStorage.removeItem('token');
      alert('Logged out successfully!');
    };
  
    return (
      <nav>
        <button onClick={handleLogout}>Logout</button>
      </nav>
    );
  };
  
  export default Navbar;
  