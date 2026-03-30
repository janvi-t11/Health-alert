// Free IP Geolocation Service for India
// Works for all cities and regions across India
// Uses ipapi.co - No API key required for basic usage (up to 1000 requests/day)

/**
 * Get user's location based on their IP address
 * Works for all locations in India
 * @returns {Promise<Object>} Location data including city, state, country, coordinates
 */
export const getUserLocationByIP = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch location');
    }
    
    const data = await response.json();
    
    return {
      success: true,
      ip: data.ip,
      city: data.city || 'Unknown',
      state: data.region || 'Unknown',
      country: data.country_name || 'Unknown',
      countryCode: data.country_code,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
      postal: data.postal,
      org: data.org,
      isIndia: data.country_code === 'IN'
    };
  } catch (error) {
    console.error('Error fetching location:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get simplified location for Indian users
 * @returns {Promise<Object>} Simplified location data
 */
export const getIndianLocation = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    // Check if user is in India
    const isIndia = data.country_code === 'IN';
    
    return {
      success: true,
      city: data.city || 'Unknown',
      state: data.region || 'Unknown',
      country: data.country_name || 'India',
      postal: data.postal || '',
      coordinates: {
        lat: data.latitude || 0,
        lng: data.longitude || 0
      },
      isIndia,
      fullLocation: `${data.city || 'Unknown'}, ${data.region || 'Unknown'}, India`
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      city: 'Unknown',
      state: 'Unknown',
      country: 'India',
      coordinates: { lat: 0, lng: 0 },
      isIndia: false
    };
  }
};

/**
 * Alternative: Using ip-api.com (completely free, no limits for non-commercial use)
 * Works for all Indian cities and states
 * @returns {Promise<Object>} Location data
 */
export const getUserLocationAlternative = async () => {
  try {
    const response = await fetch('http://ip-api.com/json/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch location');
    }
    
    const data = await response.json();
    
    if (data.status === 'fail') {
      throw new Error(data.message);
    }
    
    return {
      success: true,
      ip: data.query,
      city: data.city || 'Unknown',
      state: data.regionName || 'Unknown',
      country: data.country || 'Unknown',
      countryCode: data.countryCode,
      latitude: data.lat,
      longitude: data.lon,
      timezone: data.timezone,
      postal: data.zip || '',
      isp: data.isp,
      isIndia: data.countryCode === 'IN'
    };
  } catch (error) {
    console.error('Error fetching location:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get location with fallback to multiple services
 * Optimized for Indian locations
 * @returns {Promise<Object>} Location data
 */
export const getLocationWithFallback = async () => {
  // Try primary service first
  let result = await getIndianLocation();
  
  if (result.success) {
    return result;
  }
  
  // Fallback to alternative service
  console.log('Primary service failed, trying alternative...');
  result = await getUserLocationAlternative();
  
  if (result.success) {
    return {
      success: true,
      city: result.city,
      state: result.state,
      country: result.country,
      postal: result.postal,
      coordinates: {
        lat: result.latitude,
        lng: result.longitude
      },
      isIndia: result.isIndia,
      fullLocation: `${result.city}, ${result.state}, ${result.country}`
    };
  }
  
  // Return default if all fail
  return {
    success: false,
    error: 'All geolocation services failed',
    city: 'Unknown',
    state: 'Unknown',
    country: 'India',
    coordinates: { lat: 0, lng: 0 },
    isIndia: false
  };
};

/**
 * Get location formatted for health report submission
 * @returns {Promise<Object>} Location formatted for report form
 */
export const getLocationForReport = async () => {
  const location = await getLocationWithFallback();
  
  if (!location.success) {
    return {
      success: false,
      error: location.error
    };
  }
  
  return {
    success: true,
    location: location.fullLocation || `${location.city}, ${location.state}`,
    city: location.city,
    state: location.state,
    country: location.country,
    pincode: location.postal,
    latitude: location.coordinates.lat,
    longitude: location.coordinates.lng,
    isIndia: location.isIndia
  };
};

/**
 * Check if user is in a specific Indian state
 * @param {string} stateName - Name of the state to check
 * @returns {Promise<boolean>} True if user is in the specified state
 */
export const isUserInState = async (stateName) => {
  const location = await getIndianLocation();
  
  if (!location.success || !location.isIndia) {
    return false;
  }
  
  return location.state.toLowerCase().includes(stateName.toLowerCase());
};

/**
 * Get nearby cities based on user location
 * @param {number} radius - Radius in kilometers (default: 50km)
 * @returns {Promise<Object>} User location with radius
 */
export const getLocationWithRadius = async (radius = 50) => {
  const location = await getIndianLocation();
  
  if (!location.success) {
    return location;
  }
  
  return {
    ...location,
    radius,
    searchArea: `${location.city} and ${radius}km surrounding area`
  };
};

// Export default
export default {
  getUserLocationByIP,
  getIndianLocation,
  getUserLocationAlternative,
  getLocationWithFallback,
  getLocationForReport,
  isUserInState,
  getLocationWithRadius
};
