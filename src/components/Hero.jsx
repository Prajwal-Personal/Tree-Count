import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTreeStats } from '../services/treeStore';
import './Hero.css';

export default function Hero() {
  const [stats, setStats] = useState({ total: 0, species: 0, families: 0 });

  useEffect(() => {
    const s = getTreeStats();
    setStats(s);
  }, []);

  return (
    <section className="hero">
      <div className="hero-particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={i} className="hero-particle" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
            fontSize: `${12 + Math.random() * 16}px`,
            opacity: 0.15 + Math.random() * 0.2
          }}>
            {['🌿', '🍃', '🌱', '🍂', '🌳', '🌲'][Math.floor(Math.random() * 6)]}
          </span>
        ))}
      </div>

      <div className="hero-content animate-fade-in-up">
        <div className="hero-badge">
          <span className="hero-badge-dot"></span>
          Ecological Intelligence System
        </div>
        
        <h1 className="hero-title">
          Smart Tree <span className="hero-gradient">Intelligence</span>
          <br />Upload & Auto-Processing
        </h1>
        
        <p className="hero-subtitle">
          Upload tree images, auto-identify species with AI, explore taxonomy data, 
          and visualize biodiversity on interactive maps. Transform raw observations 
          into structured scientific knowledge.
        </p>

        <div className="hero-actions">
          <Link to="/upload" className="btn btn-primary btn-lg">
            📤 Upload a Tree
          </Link>
          <Link to="/explore" className="btn btn-secondary btn-lg">
            🗺️ Explore Map
          </Link>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-value">{stats.total}</span>
            <span className="hero-stat-label">Trees Cataloged</span>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <span className="hero-stat-value">{stats.species}</span>
            <span className="hero-stat-label">Species Identified</span>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <span className="hero-stat-value">{stats.families}</span>
            <span className="hero-stat-label">Plant Families</span>
          </div>
        </div>
      </div>

      <div className="hero-glow"></div>
    </section>
  );
}
