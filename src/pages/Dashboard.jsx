import { useState, useEffect } from 'react';
import { getTreeStats, getAllTrees } from '../services/treeStore';
import { getCategoryColor } from '../utils/helpers';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [familyDistribution, setFamilyDistribution] = useState([]);

  useEffect(() => {
    const s = getTreeStats();
    setStats(s);

    // Calculate family distribution
    const trees = getAllTrees();
    const familyCounts = {};
    trees.forEach(t => {
      const fam = t.taxonomy?.family || 'Unknown';
      familyCounts[fam] = (familyCounts[fam] || 0) + 1;
    });
    setFamilyDistribution(
      Object.entries(familyCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
    );
  }, []);

  if (!stats) return <div className="page container"><div className="spinner" style={{ margin: '4rem auto' }}></div></div>;

  const categoryEntries = Object.entries(stats.categoryCounts).sort((a, b) => b[1] - a[1]);
  const maxCatCount = Math.max(...categoryEntries.map(([, v]) => v), 1);

  return (
    <div className="page container">
      <h1 className="section-title">📊 Dashboard</h1>
      <p className="section-subtitle">Overview of your biodiversity database</p>

      {/* Stats Grid */}
      <div className="grid grid-4 dashboard-stats">
        <div className="glass-card stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Trees</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-value">{stats.approved}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending Review</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-value">{stats.species}</div>
          <div className="stat-label">Unique Species</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Category Distribution */}
        <div className="glass-card">
          <h3 className="dashboard-card-title">🏷️ Category Distribution</h3>
          <div className="dashboard-bars">
            {categoryEntries.map(([cat, count]) => (
              <div key={cat} className="dashboard-bar-row">
                <span className="dashboard-bar-label" style={{ color: getCategoryColor(cat) }}>
                  {cat}
                </span>
                <div className="dashboard-bar-track">
                  <div
                    className="dashboard-bar-fill"
                    style={{
                      width: `${(count / maxCatCount) * 100}%`,
                      background: getCategoryColor(cat)
                    }}
                  ></div>
                </div>
                <span className="dashboard-bar-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Family Distribution */}
        <div className="glass-card">
          <h3 className="dashboard-card-title">👨‍👩‍👧 Family Distribution</h3>
          <div className="dashboard-family-list">
            {familyDistribution.map(({ name, count }) => (
              <div key={name} className="dashboard-family-item">
                <span className="dashboard-family-name">{name}</span>
                <span className="dashboard-family-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card" style={{ gridColumn: '1 / -1' }}>
          <h3 className="dashboard-card-title">⏰ Recent Activity</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Tree</th>
                  <th>Species</th>
                  <th>Family</th>
                  <th>Confidence</th>
                  <th>Status</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {getAllTrees().slice(0, 8).map(tree => (
                  <tr key={tree.id}>
                    <td><strong>{tree.commonName}</strong></td>
                    <td style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>{tree.scientificName}</td>
                    <td>{tree.taxonomy?.family}</td>
                    <td>
                      <span className={`badge badge-${tree.confidence >= 0.8 ? 'success' : tree.confidence >= 0.6 ? 'warning' : 'danger'}`}>
                        {Math.round(tree.confidence * 100)}%
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${tree.status === 'approved' ? 'success' : 'warning'}`}>
                        {tree.status === 'approved' ? 'Approved' : 'Review'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{tree.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
