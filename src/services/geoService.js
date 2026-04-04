// Geo Service - Reverse geocoding, clustering, GeoJSON

export async function reverseGeocode(lat, lng) {
  try {
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
      {
        headers: { 'User-Agent': 'TreeVault/1.0' }
      }
    );
    const data = await resp.json();
    
    if (data.address) {
      const parts = [];
      if (data.address.city || data.address.town || data.address.village) {
        parts.push(data.address.city || data.address.town || data.address.village);
      }
      if (data.address.state) parts.push(data.address.state);
      if (data.address.country) parts.push(data.address.country);
      return parts.join(', ') || data.display_name;
    }
    return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (error) {
    console.error('Geocoding error:', error);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

export function treesToGeoJSON(trees) {
  return {
    type: 'FeatureCollection',
    features: trees.map(tree => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [tree.coordinates.lng, tree.coordinates.lat]
      },
      properties: {
        id: tree.id,
        slug: tree.slug,
        commonName: tree.commonName,
        scientificName: tree.scientificName,
        confidence: tree.confidence,
        categories: tree.categories,
        image: tree.image
      }
    }))
  };
}

export function clusterTrees(trees, radiusKm = 0.5) {
  const clusters = [];
  const assigned = new Set();

  trees.forEach((tree, i) => {
    if (assigned.has(i)) return;

    const cluster = {
      center: { lat: tree.coordinates.lat, lng: tree.coordinates.lng },
      trees: [tree],
      count: 1
    };
    assigned.add(i);

    trees.forEach((other, j) => {
      if (assigned.has(j)) return;
      const dist = haversineDistance(
        tree.coordinates.lat, tree.coordinates.lng,
        other.coordinates.lat, other.coordinates.lng
      );
      if (dist <= radiusKm) {
        cluster.trees.push(other);
        cluster.count++;
        assigned.add(j);
      }
    });

    // Recalculate center
    if (cluster.count > 1) {
      cluster.center.lat = cluster.trees.reduce((sum, t) => sum + t.coordinates.lat, 0) / cluster.count;
      cluster.center.lng = cluster.trees.reduce((sum, t) => sum + t.coordinates.lng, 0) / cluster.count;
    }

    clusters.push(cluster);
  });

  return clusters;
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

export function getBrowserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

export function findNearbyTrees(trees, lat, lng, radiusKm = 2) {
  return trees.filter(tree => {
    const dist = haversineDistance(lat, lng, tree.coordinates.lat, tree.coordinates.lng);
    return dist <= radiusKm;
  }).map(tree => ({
    ...tree,
    distance: haversineDistance(lat, lng, tree.coordinates.lat, tree.coordinates.lng)
  })).sort((a, b) => a.distance - b.distance);
}
