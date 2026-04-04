import { getTaxonomyHierarchy } from '../services/taxonomyService';
import './TaxonomyExplorer.css';

export default function TaxonomyExplorer({ taxonomy }) {
  if (!taxonomy) return null;
  
  const hierarchy = getTaxonomyHierarchy(taxonomy);
  
  const rankIcons = {
    Kingdom: '👑',
    Phylum: '🌿',
    Class: '🔬',
    Order: '📋',
    Family: '👨‍👩‍👧‍👦',
    Genus: '🧬',
    Species: '🌱'
  };

  return (
    <div className="taxonomy-explorer">
      <h4 className="taxonomy-title">📊 Taxonomic Classification</h4>
      <div className="taxonomy-tree">
        {hierarchy.map((item, i) => (
          <div key={item.rank} className="taxonomy-node" style={{ '--depth': i }}>
            <div className="taxonomy-connector">
              {i > 0 && <div className="taxonomy-line"></div>}
              <div className="taxonomy-dot"></div>
            </div>
            <div className="taxonomy-content">
              <span className="taxonomy-rank">
                {rankIcons[item.rank] || '📌'} {item.rank}
              </span>
              <span className="taxonomy-value">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
