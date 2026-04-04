// AI Service - Simulated tree identification
// Replace with PlantNet API or other AI service for production

const SPECIES_DATABASE = [
  {
    scientificName: 'Azadirachta indica',
    commonName: 'Neem',
    family: 'Meliaceae',
    confidence: () => 0.85 + Math.random() * 0.12
  },
  {
    scientificName: 'Ficus benghalensis',
    commonName: 'Banyan Tree',
    family: 'Moraceae',
    confidence: () => 0.82 + Math.random() * 0.15
  },
  {
    scientificName: 'Delonix regia',
    commonName: 'Gulmohar',
    family: 'Fabaceae',
    confidence: () => 0.78 + Math.random() * 0.18
  },
  {
    scientificName: 'Mangifera indica',
    commonName: 'Mango',
    family: 'Anacardiaceae',
    confidence: () => 0.88 + Math.random() * 0.10
  },
  {
    scientificName: 'Tectona grandis',
    commonName: 'Teak',
    family: 'Lamiaceae',
    confidence: () => 0.80 + Math.random() * 0.15
  },
  {
    scientificName: 'Pongamia pinnata',
    commonName: 'Indian Beech',
    family: 'Fabaceae',
    confidence: () => 0.60 + Math.random() * 0.25
  },
  {
    scientificName: 'Cassia fistula',
    commonName: 'Golden Shower Tree',
    family: 'Fabaceae',
    confidence: () => 0.65 + Math.random() * 0.20
  },
  {
    scientificName: 'Ficus religiosa',
    commonName: 'Peepal Tree',
    family: 'Moraceae',
    confidence: () => 0.85 + Math.random() * 0.12
  },
  {
    scientificName: 'Eucalyptus globulus',
    commonName: 'Blue Gum Eucalyptus',
    family: 'Myrtaceae',
    confidence: () => 0.50 + Math.random() * 0.30
  },
  {
    scientificName: 'Tamarindus indica',
    commonName: 'Tamarind',
    family: 'Fabaceae',
    confidence: () => 0.82 + Math.random() * 0.14
  },
  {
    scientificName: 'Bauhinia variegata',
    commonName: 'Orchid Tree',
    family: 'Fabaceae',
    confidence: () => 0.70 + Math.random() * 0.20
  },
  {
    scientificName: 'Santalum album',
    commonName: 'Sandalwood',
    family: 'Santalaceae',
    confidence: () => 0.75 + Math.random() * 0.15
  },
  {
    scientificName: 'Albizia lebbeck',
    commonName: 'Siris Tree',
    family: 'Fabaceae',
    confidence: () => 0.68 + Math.random() * 0.20
  },
  {
    scientificName: 'Terminalia arjuna',
    commonName: 'Arjun Tree',
    family: 'Combretaceae',
    confidence: () => 0.72 + Math.random() * 0.18
  }
];

export async function identifyTree(imageFile) {
  // Simulate AI processing delay (1.5-3 seconds)
  const delay = 1500 + Math.random() * 1500;
  await new Promise(resolve => setTimeout(resolve, delay));

  // Pick a random species from our database
  const species = SPECIES_DATABASE[Math.floor(Math.random() * SPECIES_DATABASE.length)];
  const confidence = Math.min(species.confidence(), 0.99);

  // Generate top 3 suggestions
  const otherSpecies = SPECIES_DATABASE
    .filter(s => s.scientificName !== species.scientificName)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);

  const suggestions = [
    {
      scientificName: species.scientificName,
      commonName: species.commonName,
      family: species.family,
      confidence: parseFloat(confidence.toFixed(2))
    },
    ...otherSpecies.map(s => ({
      scientificName: s.scientificName,
      commonName: s.commonName,
      family: s.family,
      confidence: parseFloat((Math.random() * 0.3 + 0.1).toFixed(2))
    }))
  ];

  return {
    topResult: suggestions[0],
    suggestions,
    processingTime: Math.round(delay),
    model: 'TreeVault AI v1.0 (Simulated)'
  };
}

// PlantNet API integration point
// To use: set VITE_PLANTNET_API_KEY in .env
export async function identifyTreePlantNet(imageFile) {
  const apiKey = import.meta.env.VITE_PLANTNET_API_KEY;
  if (!apiKey) {
    console.warn('PlantNet API key not set, using simulated identification');
    return identifyTree(imageFile);
  }

  const formData = new FormData();
  formData.append('images', imageFile);
  formData.append('organs', 'auto');

  try {
    const response = await fetch(
      `https://my-api.plantnet.org/v2/identify/all?api-key=${apiKey}`,
      { method: 'POST', body: formData }
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const top = data.results[0];
      return {
        topResult: {
          scientificName: top.species.scientificNameWithoutAuthor,
          commonName: top.species.commonNames?.[0] || top.species.scientificNameWithoutAuthor,
          family: top.species.family?.scientificNameWithoutAuthor || 'Unknown',
          confidence: parseFloat(top.score.toFixed(2))
        },
        suggestions: data.results.slice(0, 3).map(r => ({
          scientificName: r.species.scientificNameWithoutAuthor,
          commonName: r.species.commonNames?.[0] || r.species.scientificNameWithoutAuthor,
          family: r.species.family?.scientificNameWithoutAuthor || 'Unknown',
          confidence: parseFloat(r.score.toFixed(2))
        })),
        processingTime: 0,
        model: 'PlantNet API v2'
      };
    }
  } catch (error) {
    console.error('PlantNet API error:', error);
    return identifyTree(imageFile);
  }
}
