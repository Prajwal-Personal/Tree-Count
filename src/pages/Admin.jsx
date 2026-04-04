import { useState, useEffect } from 'react';
import { getPendingTrees, updateTree, deleteTree, getAllTrees } from '../services/treeStore';
import ConfidenceBadge from '../components/ConfidenceBadge';
import { formatDate } from '../utils/helpers';
import './Admin.css';

export default function Admin() {
  const [pendingTrees, setPendingTrees] = useState([]);
  const [allTrees, setAllTrees] = useState([]);
  const [selectedTree, setSelectedTree] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [tab, setTab] = useState('pending');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setPendingTrees(getPendingTrees());
    setAllTrees(getAllTrees());
  };

  const handleApprove = (id) => {
    updateTree(id, { status: 'approved' });
    refreshData();
    setSelectedTree(null);
  };

  const handleReject = (id) => {
    deleteTree(id);
    refreshData();
    setSelectedTree(null);
  };

  const handleEdit = (tree) => {
    setSelectedTree(tree);
    setEditData({
      commonName: tree.commonName,
      scientificName: tree.scientificName,
      family: tree.taxonomy?.family || '',
    });
    setEditMode(true);
  };

  const handleSaveEdit = () => {
    if (selectedTree) {
      updateTree(selectedTree.id, {
        commonName: editData.commonName,
        scientificName: editData.scientificName,
        taxonomy: { ...selectedTree.taxonomy, family: editData.family },
      });
      refreshData();
      setEditMode(false);
      setSelectedTree(null);
    }
  };

  const displayTrees = tab === 'pending' ? pendingTrees : allTrees;

  return (
    <div className="page container">
      <h1 className="section-title">🔒 Admin Panel</h1>
      <p className="section-subtitle">Review AI predictions, edit taxonomy, and manage the tree database</p>

      {/* Stats */}
      <div className="admin-stats">
        <div className="glass-card stat-card">
          <div className="stat-value" style={{ color: '#fbbf24' }}>{pendingTrees.length}</div>
          <div className="stat-label">Pending Review</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-value">{allTrees.filter(t => t.status === 'approved').length}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-value">{allTrees.length}</div>
          <div className="stat-label">Total</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${tab === 'pending' ? 'active' : ''}`}
          onClick={() => setTab('pending')}
        >
          🔄 Pending Review ({pendingTrees.length})
        </button>
        <button
          className={`admin-tab ${tab === 'all' ? 'active' : ''}`}
          onClick={() => setTab('all')}
        >
          📋 All Trees ({allTrees.length})
        </button>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Species</th>
                <th>Confidence</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayTrees.map(tree => (
                <tr key={tree.id}>
                  <td>
                    <img
                      src={tree.image}
                      alt={tree.commonName}
                      className="admin-tree-thumb"
                      onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%231e293b" width="40" height="40"/><text x="20" y="24" text-anchor="middle" font-size="16">🌳</text></svg>'; }}
                    />
                  </td>
                  <td><strong>{tree.commonName}</strong></td>
                  <td style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>{tree.scientificName}</td>
                  <td><ConfidenceBadge score={tree.confidence} /></td>
                  <td>
                    <span className={`badge badge-${tree.status === 'approved' ? 'success' : 'warning'}`}>
                      {tree.status === 'approved' ? '✅ Approved' : '🔄 Review'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{formatDate(tree.uploadedAt)}</td>
                  <td>
                    <div className="admin-actions">
                      {tree.status === 'pending_review' && (
                        <button className="btn btn-primary btn-sm" onClick={() => handleApprove(tree.id)}>
                          ✅ Approve
                        </button>
                      )}
                      <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(tree)}>
                        ✏️ Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleReject(tree.id)}>
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {displayTrees.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    {tab === 'pending' ? '🎉 No pending reviews!' : 'No trees found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editMode && selectedTree && (
        <div className="admin-modal-overlay" onClick={() => setEditMode(false)}>
          <div className="admin-modal glass-card" onClick={e => e.stopPropagation()}>
            <h3>✏️ Edit Tree: {selectedTree.commonName}</h3>
            <div className="form-group">
              <label className="form-label">Common Name</label>
              <input
                type="text"
                className="form-input"
                value={editData.commonName}
                onChange={e => setEditData({ ...editData, commonName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Scientific Name</label>
              <input
                type="text"
                className="form-input"
                value={editData.scientificName}
                onChange={e => setEditData({ ...editData, scientificName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Family</label>
              <input
                type="text"
                className="form-input"
                value={editData.family}
                onChange={e => setEditData({ ...editData, family: e.target.value })}
              />
            </div>
            <div className="admin-modal-actions">
              <button className="btn btn-primary" onClick={handleSaveEdit}>💾 Save Changes</button>
              <button className="btn btn-secondary" onClick={() => setEditMode(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
