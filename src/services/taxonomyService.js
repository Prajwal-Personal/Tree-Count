// Taxonomy Service - GBIF API + Wikipedia fallback

const TAXONOMY_CACHE = {};

export async function fetchTaxonomy(scientificName) {
  if (TAXONOMY_CACHE[scientificName]) {
    return TAXONOMY_CACHE[scientificName];
  }

  try {
    // Try GBIF first
    const gbifData = await fetchFromGBIF(scientificName);
    if (gbifData) {
      // Try Wikipedia for description
      const description = await fetchWikipediaDescription(scientificName);
      const result = { ...gbifData, description: description || gbifData.description || '' };
      TAXONOMY_CACHE[scientificName] = result;
      return result;
    }
  } catch (error) {
    console.error('Taxonomy fetch error:', error);
  }

  // Fallback: return basic info
  const fallback = {
    kingdom: 'Plantae',
    phylum: 'Tracheophyta',
    class: 'Magnoliopsida',
    order: 'Unknown',
    family: 'Unknown',
    genus: scientificName.split(' ')[0],
    species: scientificName,
    description: ''
  };
  TAXONOMY_CACHE[scientificName] = fallback;
  return fallback;
}

async function fetchFromGBIF(scientificName) {
  try {
    // Search for species
    const searchResp = await fetch(
      `https://api.gbif.org/v1/species/match?name=${encodeURIComponent(scientificName)}`
    );
    const searchData = await searchResp.json();

    if (searchData.usageKey) {
      // Get full species details
      const detailResp = await fetch(
        `https://api.gbif.org/v1/species/${searchData.usageKey}`
      );
      const detail = await detailResp.json();

      return {
        kingdom: detail.kingdom || 'Plantae',
        phylum: detail.phylum || 'Tracheophyta',
        class: detail.class || 'Unknown',
        order: detail.order || 'Unknown',
        family: detail.family || 'Unknown',
        genus: detail.genus || scientificName.split(' ')[0],
        species: detail.species || scientificName,
        description: ''
      };
    }
  } catch (error) {
    console.error('GBIF API error:', error);
  }
  return null;
}

async function fetchWikipediaDescription(scientificName) {
  try {
    const resp = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(scientificName.replace(/ /g, '_'))}`
    );
    if (resp.ok) {
      const data = await resp.json();
      return data.extract || '';
    }
  } catch (error) {
    console.error('Wikipedia API error:', error);
  }
  return '';
}

export function getTaxonomyHierarchy(taxonomy) {
  if (!taxonomy) return [];
  return [
    { rank: 'Kingdom', value: taxonomy.kingdom },
    { rank: 'Phylum', value: taxonomy.phylum },
    { rank: 'Class', value: taxonomy.class },
    { rank: 'Order', value: taxonomy.order },
    { rank: 'Family', value: taxonomy.family },
    { rank: 'Genus', value: taxonomy.genus },
    { rank: 'Species', value: taxonomy.species },
  ].filter(item => item.value && item.value !== 'Unknown');
}
