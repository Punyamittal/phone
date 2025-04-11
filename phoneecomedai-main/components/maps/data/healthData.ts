// Sample data for healthcare heat maps

export interface HealthHeatPoint {
  lat: number;
  lng: number;
  intensity: number;
  // Additional metadata for tooltips or filtering
  dataType: 'covid' | 'flu' | 'allergies' | 'healthcare_access';
  value: number;
  label?: string;
}

// Helper function to generate more clustered data points for better visualization
function generateClusteredPoints(
  centerLat: number, 
  centerLng: number, 
  count: number, 
  clusterRadius: number, 
  dataType: 'covid' | 'flu' | 'allergies' | 'healthcare_access',
  valueMultiplier: number,
  clusterFactor: number = 2.5
): HealthHeatPoint[] {
  const points: HealthHeatPoint[] = [];
  
  // Create a few cluster centers
  const clusterCenters = Array.from({ length: 5 }, () => ({
    lat: centerLat + (Math.random() - 0.5) * 0.1,
    lng: centerLng + (Math.random() - 0.5) * 0.1,
  }));
  
  for (let i = 0; i < count; i++) {
    // Choose randomly whether this point belongs to a cluster or is more scattered
    const isInCluster = Math.random() < 0.7; // 70% of points will be in clusters
    
    let lat, lng;
    
    if (isInCluster) {
      // Choose a random cluster center
      const center = clusterCenters[Math.floor(Math.random() * clusterCenters.length)];
      
      // Generate a point near the cluster center
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * clusterRadius * 0.7; // Shorter distance for tighter clusters
      
      lat = center.lat + Math.sin(angle) * distance / 111; // Approx conversion to degrees
      lng = center.lng + Math.cos(angle) * distance / (111 * Math.cos(center.lat * Math.PI / 180));
    } else {
      // Generate a more scattered point
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * clusterRadius;
      
      lat = centerLat + Math.sin(angle) * distance / 111;
      lng = centerLng + Math.cos(angle) * distance / (111 * Math.cos(centerLat * Math.PI / 180));
    }
    
    // Create intensity based on proximity to cluster centers
    let maxIntensity = 0;
    clusterCenters.forEach(center => {
      const distToCenter = Math.sqrt(
        Math.pow(lat - center.lat, 2) + Math.pow(lng - center.lng, 2)
      );
      const calculatedIntensity = Math.max(0, 1 - (distToCenter * 111 * clusterFactor / clusterRadius));
      maxIntensity = Math.max(maxIntensity, calculatedIntensity);
    });
    
    // Add some randomness to intensity but keep it high for visibility
    const intensity = Math.min(0.5 + maxIntensity * 0.5 + Math.random() * 0.2, 1);
    const value = Math.floor(intensity * valueMultiplier);
    
    points.push({
      lat,
      lng,
      intensity,
      dataType,
      value,
      label: `${dataType.replace('_', ' ')}: ${value}`
    });
  }
  
  return points;
}

// Generate COVID data with more clustering for better visibility
export const covidCasesData: HealthHeatPoint[] = generateClusteredPoints(
  28.6139, // New Delhi, India latitude
  77.2090, // New Delhi, India longitude
  800, // More points for better visibility
  5, // Cluster radius in km
  'covid',
  100, // Max value multiplier
  2.5 // Cluster factor (higher means tighter clusters)
);

// Generate flu cases data
export const fluCasesData: HealthHeatPoint[] = generateClusteredPoints(
  28.6139, // New Delhi, India latitude
  77.2090, // New Delhi, India longitude
  600,
  6,
  'flu',
  80,
  2.0
);

// Generate healthcare access data
export const healthcareAccessData: HealthHeatPoint[] = generateClusteredPoints(
  28.6139, // New Delhi, India latitude
  77.2090, // New Delhi, India longitude
  500,
  7,
  'healthcare_access',
  10,
  1.8
);

// Sample data dictionaries for quick reference
export const healthDataSets = {
  covid: {
    name: 'COVID-19 Cases',
    data: covidCasesData,
    gradient: { 0.3: 'blue', 0.5: 'lime', 0.7: 'yellow', 0.9: 'red' } // Adjusted for better visibility
  },
  flu: {
    name: 'Flu Cases',
    data: fluCasesData,
    gradient: { 0.3: 'blue', 0.5: 'cyan', 0.7: 'green', 0.9: 'yellow' } // Adjusted for better visibility
  },
  healthcare_access: {
    name: 'Healthcare Access',
    data: healthcareAccessData,
    gradient: { 0.3: 'red', 0.5: 'orange', 0.7: 'yellow', 0.9: 'green' } // Adjusted for better visibility
  }
}; 