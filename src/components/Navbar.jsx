import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { logoutUser } from '../api/auth';
import { useState, useRef, useEffect } from 'react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logoutUser();
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  // Close on outside click or Escape key
  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <nav className="fixed-navbar">
      <div className="nav-center">
        <Link to="/">Homepage</Link>
        <Link to="/map">Jobs Map</Link>
      </div>
      <div className="auth-links">
        {user ? (
          <div className="user-menu" ref={menuRef}>
            <button
              className="user-button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
            >
              Hello{user.email ? `, ${user.email}` : ''}
            </button>
            {menuOpen && (
              <div className="dropdown" role="menu">
                <button onClick={handleLogout} role="menuitem" className="dropdown-logout">
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}