import { useState, useEffect } from 'react';
import { getAllTrees } from '../services/treeStore';
import { getCategoryColor } from '../utils/helpers';
import './FilterPanel.css';

export default function FilterPanel({ onFilterChange, activeFilters = {} }) {
  const [categories, setCategories] = useState([]);
  const [families, setFamilies] = useState([]);
  const [searchQuery, setSearchQuery] = useState(activeFilters.query || '');

  useEffect(() => {
    const trees = getAllTrees();
    const catSet = new Set();
    const famSet = new Set();
    trees.forEach(t => {
      (t.categories || []).forEach(c => catSet.add(c));
      if (t.taxonomy?.family) famSet.add(t.taxonomy.family);
    });
    setCategories([...catSet].sort());
    setFamilies([...famSet].sort());
  }, []);

  const handleSearch = (value) => {
    setSearchQuery(value);
    onFilterChange?.({ ...activeFilters, query: value });
  };

  return (
    <div className="filter-panel glass-card">
      <h3 className="filter-title">🔍 Filter Trees</h3>
      
      <div className="form-group">
        <label className="form-label">Search</label>
        <input
          type="text"
          className="form-input"
          placeholder="Name, species, location..."
          value={searchQuery}
          onChange={e => handleSearch(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Category</label>
        <div className="filter-tags">
          <button
            className={`filter-tag ${!activeFilters.category ? 'active' : ''}`}
            onClick={() => onFilterChange?.({ ...activeFilters, category: '' })}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-tag ${activeFilters.category === cat ? 'active' : ''}`}
              style={activeFilters.category === cat ? { borderColor: getCategoryColor(cat), color: getCategoryColor(cat) } : {}}
              onClick={() => onFilterChange?.({ ...activeFilters, category: cat })}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Family</label>
        <select
          className="form-select"
          value={activeFilters.family || ''}
          onChange={e => onFilterChange?.({ ...activeFilters, family: e.target.value })}
        >
          <option value="">All Families</option>
          {families.map(fam => (
            <option key={fam} value={fam}>{fam}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Min Confidence</label>
        <div className="filter-confidence">
          <input
            type="range"
            min="0"
            max="100"
            value={(activeFilters.minConfidence || 0) * 100}
            onChange={e => onFilterChange?.({ ...activeFilters, minConfidence: e.target.value / 100 })}
            className="filter-range"
          />
          <span className="filter-confidence-value">
            {Math.round((activeFilters.minConfidence || 0) * 100)}%
          </span>
        </div>
      </div>

      {(activeFilters.category || activeFilters.family || activeFilters.minConfidence > 0 || activeFilters.query) && (
        <button
          className="btn btn-secondary btn-sm"
          style={{ width: '100%' }}
          onClick={() => {
            setSearchQuery('');
            onFilterChange?.({});
          }}
        >
          ✕ Clear Filters
        </button>
      )}
    </div>
  );
}
