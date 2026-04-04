import mockTrees from '../data/mockTrees';

const STORAGE_KEY = 'treevault_trees';

function initStore() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockTrees));
  }
}

export function getAllTrees() {
  initStore();
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

export function getApprovedTrees() {
  return getAllTrees().filter(t => t.status === 'approved');
}

export function getPendingTrees() {
  return getAllTrees().filter(t => t.status === 'pending_review');
}

export function getTreeBySlug(slug) {
  return getAllTrees().find(t => t.slug === slug);
}

export function getTreeById(id) {
  return getAllTrees().find(t => t.id === id);
}

export function addTree(tree) {
  const trees = getAllTrees();
  trees.unshift(tree);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trees));
  return tree;
}

export function updateTree(id, updates) {
  const trees = getAllTrees();
  const index = trees.findIndex(t => t.id === id);
  if (index !== -1) {
    trees[index] = { ...trees[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trees));
    return trees[index];
  }
  return null;
}

export function deleteTree(id) {
  const trees = getAllTrees().filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trees));
}

export function getTreeStats() {
  const trees = getAllTrees();
  const approved = trees.filter(t => t.status === 'approved');
  const pending = trees.filter(t => t.status === 'pending_review');
  
  const speciesSet = new Set(approved.map(t => t.scientificName));
  const familySet = new Set(approved.map(t => t.taxonomy?.family).filter(Boolean));
  
  const categoryCounts = {};
  approved.forEach(t => {
    (t.categories || []).forEach(cat => {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
  });

  return {
    total: trees.length,
    approved: approved.length,
    pending: pending.length,
    species: speciesSet.size,
    families: familySet.size,
    categoryCounts,
    recentTrees: approved.slice(0, 5)
  };
}

export function searchTrees(query, filters = {}) {
  let trees = getApprovedTrees();
  
  if (query) {
    const q = query.toLowerCase();
    trees = trees.filter(t => 
      t.commonName.toLowerCase().includes(q) ||
      t.scientificName.toLowerCase().includes(q) ||
      t.taxonomy?.family?.toLowerCase().includes(q) ||
      t.location?.toLowerCase().includes(q)
    );
  }
  
  if (filters.category) {
    trees = trees.filter(t => (t.categories || []).includes(filters.category));
  }
  
  if (filters.family) {
    trees = trees.filter(t => t.taxonomy?.family === filters.family);
  }
  
  if (filters.minConfidence) {
    trees = trees.filter(t => t.confidence >= filters.minConfidence);
  }
  
  return trees;
}

export function resetStore() {
  localStorage.removeItem(STORAGE_KEY);
  initStore();
}
