import { useState, useMemo } from 'react';

const useGeocoding = () => {
  const [geocodingStats, setGeocodingStats] = useState({
    total: 0,
    successful: 0,
    failed: 0
  });

  // Pre-defined coordinates for major German cities to avoid API calls
  const germanCityCoordinates = useMemo(() => ({
    'Berlin': { lat: 52.5200, lng: 13.4050 },
    'München': { lat: 48.1351, lng: 11.5820 },
    'Munich': { lat: 48.1351, lng: 11.5820 },
    'Hamburg': { lat: 53.5511, lng: 9.9937 },
    'Köln': { lat: 50.9375, lng: 6.9603 },
    'Cologne': { lat: 50.9375, lng: 6.9603 },
    'Frankfurt': { lat: 50.1109, lng: 8.6821 },
    'Stuttgart': { lat: 48.7758, lng: 9.1829 },
    'Düsseldorf': { lat: 51.2277, lng: 6.7735 },
    'Dortmund': { lat: 51.5136, lng: 7.4653 },
    'Essen': { lat: 51.4556, lng: 7.0116 },
    'Leipzig': { lat: 51.3397, lng: 12.3731 },
    'Bremen': { lat: 53.0793, lng: 8.8017 },
    'Dresden': { lat: 51.0504, lng: 13.7373 },
    'Hannover': { lat: 52.3759, lng: 9.7320 },
    'Nürnberg': { lat: 49.4521, lng: 11.0767 },
    'Nuremberg': { lat: 49.4521, lng: 11.0767 },
    'Duisburg': { lat: 51.4344, lng: 6.7623 },
    'Bochum': { lat: 51.4818, lng: 7.2162 },
    'Wuppertal': { lat: 51.2562, lng: 7.1508 },
    'Bonn': { lat: 50.7374, lng: 7.0982 },
    'Bielefeld': { lat: 52.0302, lng: 8.5325 },
    'Mannheim': { lat: 49.4875, lng: 8.4660 },
    'Karlsruhe': { lat: 49.0069, lng: 8.4037 },
    'Münster': { lat: 51.9607, lng: 7.6261 },
    'Augsburg': { lat: 48.3705, lng: 10.8978 },
    'Wiesbaden': { lat: 50.0826, lng: 8.2402 },
    'Gelsenkirchen': { lat: 51.5177, lng: 7.0857 },
    'Mönchengladbach': { lat: 51.1805, lng: 6.4428 },
    'Braunschweig': { lat: 52.2689, lng: 10.5268 },
    'Chemnitz': { lat: 50.8278, lng: 12.9214 },
    'Kiel': { lat: 54.3233, lng: 10.1228 },
    'Aachen': { lat: 50.7753, lng: 6.0839 },
    'Halle': { lat: 51.4969, lng: 11.9689 },
    'Magdeburg': { lat: 52.1205, lng: 11.6276 },
    'Freiburg': { lat: 47.9990, lng: 7.8421 },
    'Krefeld': { lat: 51.3388, lng: 6.5853 },
    'Lübeck': { lat: 53.8655, lng: 10.6866 },
    'Mainz': { lat: 49.9929, lng: 8.2473 },
    'Erfurt': { lat: 50.9787, lng: 11.0328 },
    'Rostock': { lat: 54.0887, lng: 12.1439 },
    'Kassel': { lat: 51.3127, lng: 9.4797 },
    'Hagen': { lat: 51.3670, lng: 7.4632 },
    'Potsdam': { lat: 52.3906, lng: 13.0645 },
    'Saarbrücken': { lat: 49.2401, lng: 6.9969 },
    'Hamm': { lat: 51.6806, lng: 7.8200 },
    'Mülheim': { lat: 51.4267, lng: 6.8833 },
    'Ludwigshafen': { lat: 49.4774, lng: 8.4451 },
    'Leverkusen': { lat: 51.0458, lng: 6.9856 },
    'Oldenburg': { lat: 53.1435, lng: 8.2146 },
    'Osnabrück': { lat: 52.2799, lng: 8.0472 },
    'Solingen': { lat: 51.1657, lng: 7.0670 },
    'Heidelberg': { lat: 49.3988, lng: 8.6724 },
    'Herne': { lat: 51.5386, lng: 7.2047 },
    'Neuss': { lat: 51.1979, lng: 6.6851 },
    'Darmstadt': { lat: 49.8728, lng: 8.6512 },
    'Paderborn': { lat: 51.7189, lng: 8.7575 },
    'Regensburg': { lat: 49.0134, lng: 12.1016 },
    'Ingolstadt': { lat: 48.7665, lng: 11.4257 },
    'Würzburg': { lat: 49.7913, lng: 9.9534 },
    'Fürth': { lat: 49.4778, lng: 10.9889 },
    'Wolfsburg': { lat: 52.4227, lng: 10.7865 },
    'Offenbach': { lat: 50.0955, lng: 8.7761 },
    'Ulm': { lat: 48.4011, lng: 9.9876 },
    'Heilbronn': { lat: 49.1427, lng: 9.2109 },
    'Pforzheim': { lat: 48.8914, lng: 8.6940 },
    'Göttingen': { lat: 51.5412, lng: 9.9158 },
    'Bottrop': { lat: 51.5216, lng: 6.9289 },
    'Trier': { lat: 49.7596, lng: 6.6441 },
    'Recklinghausen': { lat: 51.6142, lng: 7.1906 },
    'Reutlingen': { lat: 48.4911, lng: 9.2044 },
    'Bremerhaven': { lat: 53.5396, lng: 8.5806 },
    'Koblenz': { lat: 50.3569, lng: 7.5890 },
    'Bergisch Gladbach': { lat: 50.9920, lng: 7.1397 },
    'Erlangen': { lat: 49.5897, lng: 11.0049 },
    'Tübingen': { lat: 48.5216, lng: 9.0576 },
    'Siegen': { lat: 50.8747, lng: 8.0239 },
    'Hildesheim': { lat: 52.1561, lng: 9.9511 },
    'Cottbus': { lat: 51.7606, lng: 14.3340 }
  }), []);

  const extractMainCity = (locationName) => {
    if (!locationName) return null;
    
    // Remove common German location patterns
    const parts = locationName.split(',').map(part => part.trim());
    
    // Handle "Deutschland" -> skip it
    if (locationName === 'Deutschland') {
      return 'Germany'; // We'll handle this separately
    }
    
    // For "City, Deutschland" format
    if (parts.includes('Deutschland')) {
      const city = parts.find(part => part !== 'Deutschland');
      return city;
    }
    
    // For "District, City" format, return the city (usually the last or second-to-last part)
    if (parts.length >= 2) {
      const lastPart = parts[parts.length - 1];
      const secondLastPart = parts[parts.length - 2];
      
      // Check if last part is a known city
      if (germanCityCoordinates[lastPart]) {
        return lastPart;
      }
      
      // Check if second-to-last part is a known city
      if (germanCityCoordinates[secondLastPart]) {
        return secondLastPart;
      }
      
      // If neither is in our list, try the last part
      return lastPart;
    }
    
    return parts[0];
  };

  const geocodeLocation = (location) => {
    const mainCity = extractMainCity(location.name);
    
    if (!mainCity) {
      console.warn(`Could not extract city from: ${location.name}`);
      return null;
    }

    // Special handling for "Deutschland" (Germany)
    if (mainCity === 'Germany') {
      return {
        ...location,
        name: 'Germany (Multiple Cities)',
        latitude: 51.1657, // Center of Germany
        longitude: 10.4515,
        formattedAddress: 'Germany'
      };
    }

    // Check if we have pre-defined coordinates
    const coordinates = germanCityCoordinates[mainCity];
    
    if (coordinates) {
      console.log(`Found coordinates for ${location.name} -> ${mainCity}:`, coordinates);
      return {
        ...location,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        formattedAddress: `${mainCity}, Germany`
      };
    }

    console.warn(`No coordinates found for city: ${mainCity} (from ${location.name})`);
    return null;
  };

  const geocodeLocations = async (locations) => {
    console.log(`Starting to geocode ${locations.length} locations...`);
    
    // Limit to first 20 locations for performance
    const limitedLocations = locations.slice(0, 20);
    console.log(`Processing only first ${limitedLocations.length} locations for better performance`);
    
    setGeocodingStats({ total: limitedLocations.length, successful: 0, failed: 0 });
    
    const results = [];
    let successful = 0;
    let failed = 0;

    // Process all locations synchronously (no API calls needed)
    limitedLocations.forEach(location => {
      const result = geocodeLocation(location);
      if (result) {
        results.push(result);
        successful++;
      } else {
        failed++;
      }
    });

    setGeocodingStats({ 
      total: limitedLocations.length, 
      successful, 
      failed 
    });

    console.log(`Geocoding completed: ${successful}/${limitedLocations.length} successful`);
    
    return results;
  };

  return { geocodeLocations, geocodingStats };
};

export default useGeocoding;