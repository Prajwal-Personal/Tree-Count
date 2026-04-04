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
  const [processing, setProcessing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [taxonomyData, setTaxonomyData] = useState(null);
  const [compressionInfo, setCompressionInfo] = useState(null);
  const [error, setError] = useState('');

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
      setLocationName(`${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`);
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

    const tree = {
      id: generateId(),
      slug: generateSlug(aiResult.topResult.commonName || aiResult.topResult.scientificName),
      commonName: treeName || aiResult.topResult.commonName,
      scientificName: aiResult.topResult.scientificName,
      confidence: aiResult.topResult.confidence,
      status: aiResult.topResult.confidence >= 0.8 ? 'approved' : 'pending_review',
      image: imagePreview,
      coordinates: position,
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
                      placeholder="e.g. 17.38500"
                      step="0.00001"
                      min="-90"
                      max="90"
                      value={position ? position.lat : ''}
                      onChange={e => {
                        const lat = parseFloat(parseFloat(e.target.value).toFixed(5));
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
                      placeholder="e.g. 78.48670"
                      step="0.00001"
                      min="-180"
                      max="180"
                      value={position ? position.lng : ''}
                      onChange={e => {
                        const lng = parseFloat(parseFloat(e.target.value).toFixed(5));
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
                <div className="form-group" style={{ marginTop: 'var(--space-md)' }}>
                  <label className="form-label">Tree Name (optional)</label>
                  <input
                    type="text"
                    className="form-input"
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
