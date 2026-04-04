import { useParams, Link } from 'react-router-dom';
import { getTreeBySlug } from '../services/treeStore';
import TaxonomyExplorer from '../components/TaxonomyExplorer';
import ConfidenceBadge from '../components/ConfidenceBadge';
import MapPicker from '../components/MapPicker';
import { formatDate, formatCoords, getCategoryColor } from '../utils/helpers';
import './TreeProfile.css';

export default function TreeProfile() {
  const { slug } = useParams();
  const tree = getTreeBySlug(slug);

  if (!tree) {
    return (
      <div className="page container">
        <div className="empty-state">
          <div className="empty-state-icon">🌳</div>
          <h2>Tree Not Found</h2>
          <p>The tree you're looking for doesn't exist.</p>
          <Link to="/explore" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            ← Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page container">
      <div className="tree-profile">
        <Link to="/explore" className="tree-profile-back">← Back to Explore</Link>

        <div className="tree-profile-header">
          <div className="tree-profile-image-wrap">
            <img src={tree.image} alt={tree.commonName} className="tree-profile-image" />
            <div className="tree-profile-image-overlay">
              <ConfidenceBadge score={tree.confidence} showLabel />
              {tree.status === 'pending_review' && (
                <span className="badge badge-warning">🔄 Under Review</span>
              )}
            </div>
          </div>

          <div className="tree-profile-info">
            <h1 className="tree-profile-name">{tree.commonName}</h1>
            <p className="tree-profile-scientific">{tree.scientificName}</p>

            <div className="tree-profile-categories">
              {(tree.categories || []).map(cat => (
                <span
                  key={cat}
                  className="tree-profile-tag"
                  style={{ borderColor: getCategoryColor(cat), color: getCategoryColor(cat) }}
                >
                  {cat}
                </span>
              ))}
            </div>

            <div className="tree-profile-details">
              <div className="tree-profile-detail">
                <span className="tree-profile-detail-label">📍 Location</span>
                <span>{tree.location}</span>
              </div>
              <div className="tree-profile-detail">
                <span className="tree-profile-detail-label">🌐 Coordinates</span>
                <span>{formatCoords(tree.coordinates.lat, tree.coordinates.lng)}</span>
              </div>
              <div className="tree-profile-detail">
                <span className="tree-profile-detail-label">👨‍👩‍👧 Family</span>
                <span>{tree.taxonomy?.family || 'Unknown'}</span>
              </div>
              <div className="tree-profile-detail">
                <span className="tree-profile-detail-label">📅 Added</span>
                <span>{formatDate(tree.uploadedAt)}</span>
              </div>
              {tree.nativeRegion && (
                <div className="tree-profile-detail">
                  <span className="tree-profile-detail-label">🌍 Native Region</span>
                  <span>{tree.nativeRegion}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="tree-profile-body">
          <div className="tree-profile-col">
            <div className="glass-card">
              <TaxonomyExplorer taxonomy={tree.taxonomy} />
            </div>

            {tree.taxonomy?.description && (
              <div className="glass-card">
                <h3 className="tree-profile-section-title">📖 Description</h3>
                <p className="tree-profile-description">{tree.taxonomy.description}</p>
              </div>
            )}

            {tree.ecologicalInfo && (
              <div className="glass-card">
                <h3 className="tree-profile-section-title">🌍 Ecological Information</h3>
                <p className="tree-profile-description">{tree.ecologicalInfo}</p>
              </div>
            )}
          </div>

          <div className="tree-profile-col">
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <h3 className="tree-profile-section-title" style={{ padding: 'var(--space-lg) var(--space-lg) var(--space-sm)' }}>
                📍 Location on Map
              </h3>
              <MapPicker
                position={tree.coordinates}
                interactive={false}
                height="300px"
              />
            </div>

            <div className="glass-card">
              <h3 className="tree-profile-section-title">🤖 AI Analysis</h3>
              <div className="tree-profile-ai-info">
                <div className="tree-profile-detail">
                  <span className="tree-profile-detail-label">Confidence</span>
                  <ConfidenceBadge score={tree.confidence} showLabel />
                </div>
                <div className="tree-profile-detail">
                  <span className="tree-profile-detail-label">Status</span>
                  <span className={`badge badge-${tree.status === 'approved' ? 'success' : 'warning'}`}>
                    {tree.status === 'approved' ? '✅ Approved' : '🔄 Under Review'}
                  </span>
                </div>
                <div className="tree-profile-detail">
                  <span className="tree-profile-detail-label">Uploaded By</span>
                  <span className="badge badge-neutral">{tree.uploadedBy}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
