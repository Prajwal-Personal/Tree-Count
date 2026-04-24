import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import './MapPicker.css';

// Fix leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const treeIcon = new L.DivIcon({
  className: 'tree-marker-icon',
  html: '<div class="tree-marker">🌳</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

function LocationMarker({ position, onPositionChange }) {
  useMapEvents({
    click(e) {
      onPositionChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return position ? (
    <Marker position={[position.lat, position.lng]} icon={treeIcon}>
      <Popup>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}>
          <strong>Selected Location</strong><br />
          {position.lat.toFixed(7)}°, {position.lng.toFixed(7)}°
        </div>
      </Popup>
    </Marker>
  ) : null;
}

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng], 14);
    }
  }, [position, map]);
  return null;
}

export default function MapPicker({ position, onPositionChange, height = '350px', interactive = true }) {
  const defaultCenter = [20.5937, 78.9629]; // India center
  const center = position ? [position.lat, position.lng] : defaultCenter;
  const zoom = position ? 14 : 5;

  return (
    <div className="map-picker" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="map-picker-container"
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {interactive && (
          <LocationMarker position={position} onPositionChange={onPositionChange} />
        )}
        {!interactive && position && (
          <Marker position={[position.lat, position.lng]} icon={treeIcon}>
            <Popup>
              {position.lat.toFixed(7)}°, {position.lng.toFixed(7)}°
            </Popup>
          </Marker>
        )}
        <RecenterMap position={position} />
      </MapContainer>
    </div>
  );
}
