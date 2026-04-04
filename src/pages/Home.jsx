import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import TreeCard from '../components/TreeCard';
import { getApprovedTrees, getTreeStats } from '../services/treeStore';
import './Home.css';

export default function Home() {
  const [recentTrees, setRecentTrees] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    const trees = getApprovedTrees();
    setRecentTrees(trees.slice(0, 6));
    setStats(getTreeStats());
  }, []);

  const features = [
    { icon: '📸', title: 'Smart Upload', desc: 'Drag & drop tree images with GPS auto-detection' },
    { icon: '🤖', title: 'AI Identification', desc: 'Auto-identify species with confidence scores' },
    { icon: '🧬', title: 'Auto Taxonomy', desc: 'Full classification from Kingdom to Species' },
    { icon: '🗺️', title: 'Interactive Maps', desc: 'Visualize trees with clustering & filtering' },
    { icon: '📊', title: 'Smart Categories', desc: 'Auto-classify: medicinal, native, flowering...' },
    { icon: '🔒', title: 'Admin Review', desc: 'Validate AI predictions before publishing' },
  ];

  return (
    <div className="home-page">
      <Hero />

      {/* Features Section */}
      <section className="home-section container">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">
          From raw upload to structured scientific knowledge — fully automated
        </p>
        <div className="grid grid-3">
          {features.map((f, i) => (
            <div key={i} className="feature-card glass-card animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="feature-icon">{f.icon}</span>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pipeline Section */}
      <section className="home-section container">
        <h2 className="section-title">End-to-End Pipeline</h2>
        <p className="section-subtitle">Fully automated data flow from upload to publication</p>
        <div className="pipeline">
          {['Upload', 'Image Stored', 'AI Identify', 'Taxonomy Fetch', 'DB Store', 'GeoJSON', 'Frontend Update', 'Page Created'].map((step, i) => (
            <div key={i} className="pipeline-step">
              <div className="pipeline-node">{i + 1}</div>
              <span className="pipeline-label">{step}</span>
              {i < 7 && <div className="pipeline-arrow">→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Recent Trees */}
      <section className="home-section container">
        <div className="home-section-header">
          <div>
            <h2 className="section-title">Recently Cataloged</h2>
            <p className="section-subtitle">Latest trees added to our database</p>
          </div>
          <Link to="/explore" className="btn btn-secondary">
            View All →
          </Link>
        </div>
        <div className="grid grid-3">
          {recentTrees.map(tree => (
            <TreeCard key={tree.id} tree={tree} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="home-cta container">
        <div className="home-cta-card glass-card">
          <h2>Ready to contribute?</h2>
          <p>Upload a tree image and let our AI do the rest. Build the world's biodiversity database, one tree at a time.</p>
          <Link to="/upload" className="btn btn-primary btn-lg">
            🌱 Start Uploading
          </Link>
        </div>
      </section>
    </div>
  );
}
