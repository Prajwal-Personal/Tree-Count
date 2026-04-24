import { useState } from 'react';
import UploadForm from '../components/UploadForm';
import MapPicker from '../components/MapPicker';
import ConfidenceBadge from '../components/ConfidenceBadge';
import TaxonomyExplorer from '../components/TaxonomyExplorer';
import { identifyTree } from '../services/aiService';
import { fetchTaxonomy } from '../services/taxonomyService';
import { reverseGeocode, getBrowserLocation } from '../services/geoService';
import { compressImage, formatFileSize } from '../services/imageService';
import { addTree } from '../services/treeStore';
import { generateSlug, generateId, classifyTree } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';
import './Upload.css';

export default function Upload() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [position, setPosition] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [treeName, setTreeName] = useState('');
  const [treeCount, setTreeCount] = useState(1);
  const [treeCoordinates, setTreeCoordinates] = useState([]);
  const [showTreeCoords, setShowTreeCoords] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [taxonomyData, setTaxonomyData] = useState(null);
  const [compressionInfo, setCompressionInfo] = useState(null);
  const [error, setError] = useState('');

  const handleTreeCountChange = (count) => {
    const n = Math.max(1, parseInt(count) || 1);
    setTreeCount(n);
    if (n <= 1) {
      setShowTreeCoords(false);
      setTreeCoordinates([]);
    } else if (showTreeCoords) {
      // Adjust the treeCoordinates array to match the new count
      setTreeCoordinates(prev => {
        if (prev.length < n) {
          return [...prev, ...Array(n - prev.length).fill(null).map(() => ({ lat: '', lng: '' }))];
        }
        return prev.slice(0, n);
      });
    }
  };

  const handleToggleTreeCoords = () => {
    if (!showTreeCoords) {
      // Initialize coordinates array
      const coords = Array(treeCount).fill(null).map((_, i) => {
        if (i === 0 && position) {
          return { lat: position.lat.toFixed(7), lng: position.lng.toFixed(7) };
        }
        return { lat: '', lng: '' };
      });
      setTreeCoordinates(coords);
    } else {
      setTreeCoordinates([]);
    }
    setShowTreeCoords(!showTreeCoords);
  };

  const updateTreeCoordinate = (index, field, value) => {
    setTreeCoordinates(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleImageSelected = (file, preview) => {
    setImageFile(file);
    setImagePreview(preview);
    setError('');
  };

  const handlePositionChange = async (pos) => {
    setPosition(pos);
    try {
      const name = await reverseGeocode(pos.lat, pos.lng);
      setLocationName(name);
    } catch {
      setLocationName(`${pos.lat.toFixed(7)}, ${pos.lng.toFixed(7)}`);
    }
  };

  const handleDetectLocation = async () => {
    try {
      const pos = await getBrowserLocation();
      handlePositionChange(pos);
    } catch (err) {
      setError('Could not detect location. Please select on map or enter manually.');
    }
  };

  const handleProcess = async () => {
    if (!imageFile) {
      setError('Please upload a tree image first');
      return;
    }
    if (!position) {
      setError('Please select a location on the map');
      return;
    }

    setProcessing(true);
    setError('');
    setStep(3);

    try {
      // Step 1: Compress image
      const compressed = await compressImage(imageFile);
      setCompressionInfo(compressed);

      // Step 2: AI Identification
      const aiData = await identifyTree(imageFile);
      setAiResult(aiData);

      // Step 3: Fetch taxonomy
      const taxonomy = await fetchTaxonomy(aiData.topResult.scientificName);
      setTaxonomyData(taxonomy);

      setProcessing(false);
    } catch (err) {
      setError('Processing failed: ' + err.message);
      setProcessing(false);
    }
  };

  const handleSave = () => {
    if (!aiResult || !taxonomyData) return;

    // Parse individual tree coordinates if provided
    const parsedTreeCoords = showTreeCoords
      ? treeCoordinates.map(c => ({
          lat: parseFloat(c.lat),
          lng: parseFloat(c.lng)
        })).filter(c => !isNaN(c.lat) && !isNaN(c.lng))
      : [];

    const tree = {
      id: generateId(),
      slug: generateSlug(aiResult.topResult.commonName || aiResult.topResult.scientificName),
      commonName: treeName || aiResult.topResult.commonName,
      scientificName: aiResult.topResult.scientificName,
      confidence: aiResult.topResult.confidence,
      status: aiResult.topResult.confidence >= 0.8 ? 'approved' : 'pending_review',
      image: imagePreview,
      coordinates: position,
      treeCount: treeCount,
      treeCoordinates: parsedTreeCoords.length > 0 ? parsedTreeCoords : undefined,
      location: locationName,
      taxonomy: taxonomyData,
      categories: classifyTree(taxonomyData),
      nativeRegion: '',
      ecologicalInfo: '',
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'user'
    };

    addTree(tree);
    navigate(`/tree/${tree.slug}`);
  };

  return (
    <div className="page container">
      <div className="upload-page">
        <h1 className="section-title">📤 Upload a Tree</h1>
        <p className="section-subtitle">Upload an image, pick a location, and let AI do the rest</p>

        {/* Step Indicator */}
        <div className="upload-steps">
          {[
            { num: 1, label: 'Image & Location' },
            { num: 2, label: 'Review & Process' },
            { num: 3, label: 'AI Results' }
          ].map(s => (
            <div key={s.num} className={`upload-step ${step >= s.num ? 'active' : ''} ${step === s.num ? 'current' : ''}`}>
              <div className="upload-step-num">{s.num}</div>
              <span className="upload-step-label">{s.label}</span>
            </div>
          ))}
        </div>

        {error && <div className="upload-error">⚠️ {error}</div>}

        {/* Step 1: Image & Location */}
        {step >= 1 && (
          <div className={`upload-section ${step === 1 ? '' : 'collapsed'}`}>
            <div className="upload-grid">
              <div>
                <h3>📸 Tree Image</h3>
                <UploadForm onImageSelected={handleImageSelected} disabled={processing} />
              </div>
              <div>
                <div className="upload-location-header">
                  <h3>📍 Location</h3>
                  <button className="btn btn-secondary btn-sm" onClick={handleDetectLocation} disabled={processing}>
                    🎯 Auto-detect
                  </button>
                </div>
                <MapPicker position={position} onPositionChange={handlePositionChange} height="300px" />
                <div className="upload-coords-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: 'var(--space-md)' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Latitude</label>
                    <input
                      type="number"
                      className="form-input"
                      id="input-latitude"
                      placeholder="e.g. 17.3850000"
                      step="0.0000001"
                      min="-90"
                      max="90"
                      value={position ? position.lat : ''}
                      onChange={e => {
                        const lat = parseFloat(parseFloat(e.target.value).toFixed(7));
                        if (!isNaN(lat) && lat >= -90 && lat <= 90) {
                          const lng = position?.lng || 0;
                          handlePositionChange({ lat, lng });
                        }
                      }}
                      disabled={processing}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Longitude</label>
                    <input
                      type="number"
                      className="form-input"
                      id="input-longitude"
                      placeholder="e.g. 78.4867000"
                      step="0.0000001"
                      min="-180"
                      max="180"
                      value={position ? position.lng : ''}
                      onChange={e => {
                        const lng = parseFloat(parseFloat(e.target.value).toFixed(7));
                        if (!isNaN(lng) && lng >= -180 && lng <= 180) {
                          const lat = position?.lat || 0;
                          handlePositionChange({ lat, lng });
                        }
                      }}
                      disabled={processing}
                    />
                  </div>
                </div>
                {locationName && (
                  <p className="upload-location-name">📍 {locationName}</p>
                )}

                {/* Tree Count */}
                <div className="form-group" style={{ marginTop: 'var(--space-md)' }}>
                  <label className="form-label">🌳 Tree Count</label>
                  <input
                    type="number"
                    className="form-input"
                    id="input-tree-count"
                    placeholder="Number of trees"
                    min="1"
                    value={treeCount}
                    onChange={e => handleTreeCountChange(e.target.value)}
                    disabled={processing}
                  />
                </div>

                {/* Optional per-tree coordinates */}
                {treeCount > 1 && (
                  <div className="tree-coords-section">
                    <div className="tree-coords-toggle" onClick={handleToggleTreeCoords}>
                      <span className="tree-coords-toggle-icon">{showTreeCoords ? '▼' : '▶'}</span>
                      <span className="tree-coords-toggle-label">
                        📌 Input individual tree coordinates <span className="tree-coords-optional">(optional)</span>
                      </span>
                    </div>

                    {showTreeCoords && (
                      <div className="tree-coords-list">
                        {treeCoordinates.map((coord, i) => (
                          <div key={i} className="tree-coord-row">
                            <span className="tree-coord-index">🌳 #{i + 1}</span>
                            <div className="tree-coord-inputs">
                              <input
                                type="number"
                                className="form-input form-input-sm"
                                placeholder="Latitude"
                                step="0.0000001"
                                min="-90"
                                max="90"
                                value={coord.lat}
                                onChange={e => updateTreeCoordinate(i, 'lat', e.target.value)}
                                disabled={processing}
                              />
                              <input
                                type="number"
                                className="form-input form-input-sm"
                                placeholder="Longitude"
                                step="0.0000001"
                                min="-180"
                                max="180"
                                value={coord.lng}
                                onChange={e => updateTreeCoordinate(i, 'lng', e.target.value)}
                                disabled={processing}
                              />
                            </div>
                          </div>
                        ))}
                        <p className="tree-coords-hint">
                          💡 Leave empty to use the main location for all trees
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="form-group" style={{ marginTop: 'var(--space-md)' }}>
                  <label className="form-label">Tree Name (optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    id="input-tree-name"
                    placeholder="e.g., Neem, Banyan..."
                    value={treeName}
                    onChange={e => setTreeName(e.target.value)}
                    disabled={processing}
                  />
                </div>
                <button
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', marginTop: 'var(--space-md)' }}
                  onClick={handleProcess}
                  disabled={processing || !imageFile}
                >
                  {processing ? (
                    <>
                      <span className="spinner"></span> Processing...
                    </>
                  ) : (
                    '🚀 Process with AI'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 3 && (
          <div className="upload-results animate-fade-in-up">
            {processing ? (
              <div className="upload-processing">
                <div className="upload-processing-animation">
                  <span className="spinner" style={{ width: '48px', height: '48px', borderWidth: '4px' }}></span>
                </div>
                <h3>AI is analyzing your tree...</h3>
                <p className="upload-processing-steps">
                  Compressing image → Identifying species → Fetching taxonomy → Generating classifications
                </p>
              </div>
            ) : aiResult && (
              <div className="upload-result-grid">
                <div className="glass-card">
                  <h3 className="upload-result-title">🤖 AI Identification Result</h3>
                  <div className="upload-result-species">
                    <div className="upload-result-main">
                      <h2>{aiResult.topResult.commonName}</h2>
                      <p className="upload-result-scientific">{aiResult.topResult.scientificName}</p>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
                        <ConfidenceBadge score={aiResult.topResult.confidence} showLabel />
                        <span className="badge badge-neutral">{aiResult.topResult.family}</span>
                      </div>
                    </div>
                  </div>
                  
                  <h4 style={{ marginTop: 'var(--space-lg)', marginBottom: 'var(--space-sm)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Other Suggestions
                  </h4>
                  {aiResult.suggestions.slice(1).map((s, i) => (
                    <div key={i} className="upload-alt-suggestion">
                      <span>{s.commonName} ({s.scientificName})</span>
                      <ConfidenceBadge score={s.confidence} />
                    </div>
                  ))}

                  <div className="upload-result-meta">
                    <span>⏱️ {aiResult.processingTime}ms</span>
                    <span>🧠 {aiResult.model}</span>
                  </div>
                </div>

                <div className="glass-card">
                  <TaxonomyExplorer taxonomy={taxonomyData} />
                  
                  {taxonomyData?.description && (
                    <div className="upload-result-desc">
                      <h4>📖 Description</h4>
                      <p>{taxonomyData.description}</p>
                    </div>
                  )}

                  {compressionInfo && (
                    <div className="upload-compression-info">
                      <span>🗜️ Image: {formatFileSize(compressionInfo.originalSize)} → {formatFileSize(compressionInfo.compressedSize)} ({compressionInfo.compressionRatio}% saved)</span>
                    </div>
                  )}
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleSave}>
                    ✅ Save Tree to Database
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
