export function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatCoords(lat, lng) {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

export function getConfidenceLevel(score) {
  if (score >= 0.8) return { level: 'high', label: 'High', color: 'success' };
  if (score >= 0.6) return { level: 'medium', label: 'Medium', color: 'warning' };
  return { level: 'low', label: 'Low', color: 'danger' };
}

export function getConfidencePercent(score) {
  return Math.round(score * 100);
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function truncateText(text, maxLen = 120) {
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen).trim() + '...';
}

export function getCategoryColor(category) {
  const colors = {
    'Medicinal': '#10b981',
    'Native': '#3b82f6',
    'Invasive': '#ef4444',
    'Evergreen': '#22c55e',
    'Deciduous': '#f59e0b',
    'Flowering': '#ec4899',
    'Non-flowering': '#8b5cf6',
    'Fruit-bearing': '#f97316',
    'Timber': '#78716c',
    'Ornamental': '#e879f9'
  };
  return colors[category] || '#64748b';
}

export function classifyTree(taxonomy) {
  const categories = [];
  const family = (taxonomy?.family || '').toLowerCase();
  const description = (taxonomy?.description || '').toLowerCase();

  // Medicinal families
  const medicinalFamilies = ['meliaceae', 'fabaceae', 'lamiaceae', 'apocynaceae', 'rubiaceae', 'moraceae', 'myrtaceae'];
  if (medicinalFamilies.includes(family)) categories.push('Medicinal');

  // Evergreen / Deciduous
  if (description.includes('evergreen')) categories.push('Evergreen');
  else if (description.includes('deciduous')) categories.push('Deciduous');

  // Flowering
  if (description.includes('flower') || description.includes('bloom')) categories.push('Flowering');

  // Fruit
  if (description.includes('fruit') || description.includes('berry') || description.includes('drupe')) categories.push('Fruit-bearing');

  // Timber
  if (description.includes('timber') || description.includes('lumber') || description.includes('hardwood')) categories.push('Timber');

  // Ornamental
  if (description.includes('ornamental') || description.includes('garden') || description.includes('landscape')) categories.push('Ornamental');

  if (categories.length === 0) categories.push('Native');
  return categories;
}
