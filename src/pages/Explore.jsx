import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import TreeCard from '../components/TreeCard';
import FilterPanel from '../components/FilterPanel';
import ConfidenceBadge from '../components/ConfidenceBadge';
import { searchTrees, getApprovedTrees } from '../services/treeStore';
import './Explore.css';

const treeIcon = new L.DivIcon({
  className: 'tree-marker-icon',
  html: '<div class="tree-marker">🌳</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

export default function Explore() {
  const [filters, setFilters] = useState({});
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'grid'

  const trees = useMemo(() => {
    return searchTrees(filters.query, filters);
  }, [filters]);

  const mapCenter = useMemo(() => {
    if (trees.length === 0) return [20.5937, 78.9629];
    const avgLat = trees.reduce((s, t) => s + t.coordinates.lat, 0) / trees.length;
    const avgLng = trees.reduce((s, t) => s + t.coordinates.lng, 0) / trees.length;
    return [avgLat, avgLng];
  }, [trees]);

  return (
    <div className="page">
      <div className="explore-page">
        <div className="explore-sidebar">
          <FilterPanel onFilterChange={setFilters} activeFilters={filters} />
          <div className="explore-view-toggle">
            <button
              className={`btn btn-sm ${viewMode === 'map' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('map')}
            >
              🗺️ Map
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('grid')}
            >
              📋 Grid
            </button>
          </div>
          <div className="explore-count">
            <span className="explore-count-num">{trees.length}</span> trees found
          </div>
        </div>

        <div className="explore-main">
          {viewMode === 'map' ? (
            <div className="explore-map-wrap">
              <MapContainer
                center={mapCenter}
                zoom={5}
                className="explore-map"
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; CARTO'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                {trees.map(tree => (
                  <Marker
                    key={tree.id}
                    position={[tree.coordinates.lat, tree.coordinates.lng]}
                    icon={treeIcon}
                  >
                    <Popup>
                      <div className="explore-popup">
                        <img src={tree.image} alt={tree.commonName} className="explore-popup-img" />
                        <div className="explore-popup-body">
                          <strong>{tree.commonName}</strong>
                          <em>{tree.scientificName}</em>
                          <div style={{ margin: '4px 0' }}>
                            <ConfidenceBadge score={tree.confidence} />
                          </div>
                          <Link to={`/tree/${tree.slug}`} className="explore-popup-link">
                            View Details →
                          </Link>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          ) : (
            <div className="grid grid-3 explore-grid">
              {trees.map(tree => (
                <TreeCard key={tree.id} tree={tree} />
              ))}
              {trees.length === 0 && (
                <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                  <div className="empty-state-icon">🔍</div>
                  <p>No trees match your filters</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
