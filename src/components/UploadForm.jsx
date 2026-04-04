import { useState, useCallback } from 'react';
import { getImagePreview } from '../services/imageService';
import './UploadForm.css';

export default function UploadForm({ onImageSelected, disabled }) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const previewUrl = await getImagePreview(file);
    setPreview(previewUrl);
    setFileName(file.name);
    onImageSelected?.(file, previewUrl);
  }, [onImageSelected]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const removeImage = () => {
    setPreview(null);
    setFileName('');
    onImageSelected?.(null, null);
  };

  return (
    <div className="upload-form">
      {!preview ? (
        <div
          className={`upload-dropzone ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && document.getElementById('tree-image-input').click()}
        >
          <div className="upload-icon">📸</div>
          <h3 className="upload-title">
            {isDragging ? 'Drop your image here!' : 'Upload Tree Image'}
          </h3>
          <p className="upload-subtitle">
            Drag & drop an image or click to browse
          </p>
          <p className="upload-hint">JPG, PNG, WebP • Max 10MB</p>
          <input
            id="tree-image-input"
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="upload-input-hidden"
            disabled={disabled}
          />
        </div>
      ) : (
        <div className="upload-preview">
          <div className="upload-preview-image-wrap">
            <img src={preview} alt="Tree preview" className="upload-preview-image" />
            <button className="upload-preview-remove" onClick={removeImage} title="Remove image">
              ✕
            </button>
          </div>
          <div className="upload-preview-info">
            <span className="upload-preview-name">{fileName}</span>
            <span className="badge badge-success">Ready</span>
          </div>
        </div>
      )}
    </div>
  );
}
