// Location service for real geolocation data collection
class LocationService {
  constructor() {
    this.currentLocation = null;
    this.watchId = null;
  }

  // Get current position once
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          
          try {
            const address = await this.reverseGeocode(coords.latitude, coords.longitude);
            const locationData = { ...coords, ...address };
            this.currentLocation = locationData;
            resolve(locationData);
          } catch (error) {
            // Return coordinates even if reverse geocoding fails
            resolve(coords);
          }
        },
        (error) => {
          reject(this.handleLocationError(error));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Watch position for continuous updates
  watchLocation(callback, errorCallback) {
    if (!navigator.geolocation) {
      errorCallback(new Error('Geolocation is not supported'));
      return null;
    }

    this.watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        
        try {
          const address = await this.reverseGeocode(coords.latitude, coords.longitude);
          const locationData = { ...coords, ...address };
          this.currentLocation = locationData;
          callback(locationData);
        } catch (error) {
          callback(coords);
        }
      },
      (error) => {
        errorCallback(this.handleLocationError(error));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );

    return this.watchId;
  }

  // Stop watching location
  stopWatching() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // Reverse geocoding using OpenStreetMap Nominatim (free service)
  async reverseGeocode(latitude, longitude) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'HealthAlerts-Platform'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }

      const data = await response.json();
      
      return {
        address: data.display_name,
        city: data.address?.city || data.address?.town || data.address?.village || 'Unknown',
        state: data.address?.state || 'Unknown',
        country: data.address?.country || 'Unknown',
        pincode: data.address?.postcode || '000000',
        area: data.address?.suburb || data.address?.neighbourhood || data.address?.road || 'Unknown'
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return {
        address: `${latitude}, ${longitude}`,
        city: 'Unknown',
        state: 'Unknown',
        country: 'Unknown',
        pincode: '000000',
        area: 'Unknown'
      };
    }
  }

  // Handle geolocation errors
  handleLocationError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return new Error('Location access denied by user');
      case error.POSITION_UNAVAILABLE:
        return new Error('Location information unavailable');
      case error.TIMEOUT:
        return new Error('Location request timed out');
      default:
        return new Error('Unknown location error');
    }
  }

  // Check if geolocation is available
  isGeolocationAvailable() {
    return 'geolocation' in navigator;
  }

  // Get cached location
  getCachedLocation() {
    return this.currentLocation;
  }
}

// Create singleton instance
const locationService = new LocationService();

export default locationService;