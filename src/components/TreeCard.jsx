import { Link } from 'react-router-dom';
import ConfidenceBadge from './ConfidenceBadge';
import { getCategoryColor, truncateText } from '../utils/helpers';
import './TreeCard.css';

export default function TreeCard({ tree, compact = false }) {
  return (
    <Link to={`/tree/${tree.slug}`} className={`tree-card glass-card ${compact ? 'compact' : ''}`}>
      <div className="tree-card-image-wrap">
        <img 
          src={tree.image} 
          alt={tree.commonName} 
          className="tree-card-image"
          loading="lazy"
          onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect fill="%231e293b" width="200" height="200"/><text x="100" y="100" text-anchor="middle" fill="%2364748b" font-size="60">🌳</text></svg>'; }}
        />
        <div className="tree-card-overlay">
          <ConfidenceBadge score={tree.confidence} />
        </div>
      </div>
      <div className="tree-card-body">
        <h3 className="tree-card-name">{tree.commonName}</h3>
        <p className="tree-card-scientific">{tree.scientificName}</p>
        {!compact && (
          <>
            <div className="tree-card-categories">
              {(tree.categories || []).slice(0, 3).map(cat => (
                <span 
                  key={cat} 
                  className="tree-card-tag"
                  style={{ borderColor: getCategoryColor(cat), color: getCategoryColor(cat) }}
                >
                  {cat}
                </span>
              ))}
            </div>
            <div className="tree-card-meta">
              <span className="tree-card-location">📍 {tree.location || 'Unknown'}</span>
              <span className="tree-card-family">{tree.taxonomy?.family}</span>
            </div>
          </>
        )}
      </div>
    </Link>
  );
}
