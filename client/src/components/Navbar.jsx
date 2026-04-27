import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Image, Database, Globe } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar glass">
      <div className="nav-brand">
        <Home className="brand-icon" />
        <h2>{t('hotel_name')}</h2>
      </div>
      <div className="nav-links">
        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
          <Home size={18} />
          <span>{t('nav_home')}</span>
        </Link>
        <Link to="/search" className={`nav-link ${isActive('/search') ? 'active' : ''}`}>
          <Search size={18} />
          <span>{t('nav_search')}</span>
        </Link>
        <Link to="/gallery" className={`nav-link ${isActive('/gallery') ? 'active' : ''}`}>
          <Image size={18} />
          <span>{t('nav_gallery')}</span>
        </Link>
        <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
          <Database size={18} />
          <span>{t('nav_admin')}</span>
        </Link>
      </div>
      <div className="nav-lang">
        <Globe size={18} className="lang-icon" />
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          className="lang-select"
        >
          <option value="en">English</option>
          <option value="ta">தமிழ் (Tamil)</option>
          <option value="hi">हिन्दी (Hindi)</option>
        </select>
      </div>
    </nav>
  );
};

export default Navbar;
