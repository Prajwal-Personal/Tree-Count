import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home', icon: '🏠' },
    { to: '/upload', label: 'Upload', icon: '📤' },
    { to: '/explore', label: 'Explore', icon: '🗺️' },
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/admin', label: 'Admin', icon: '🔒' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          <span className="navbar-logo">🌱</span>
          <span className="navbar-title">TreeVault</span>
        </NavLink>

        <button 
          className={`navbar-toggle ${mobileOpen ? 'active' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="navbar-link-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
