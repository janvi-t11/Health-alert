// Example: How to integrate auto-location detection in ReportForm.jsx

import { useState } from 'react';
import { getLocationForReport } from '../services/geolocationService';
import toast from 'react-hot-toast';

/**
 * Integration example for ReportForm
 * This shows how to add "Detect My Location" button to your existing form
 */

const ReportFormWithAutoLocation = () => {
  const [formData, setFormData] = useState({
    issueType: '',
    description: '',
    location: '',
    city: '',
    state: '',
    pincode: '',
    latitude: '',
    longitude: ''
  });
  
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Auto-detect location function
  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    
    try {
      const locationData = await getLocationForReport();
      
      if (locationData.success) {
        // Auto-fill form with detected location
        setFormData({
          ...formData,
          location: locationData.location,
          city: locationData.city,
          state: locationData.state,
          pincode: locationData.pincode || '',
          latitude: locationData.latitude,
          longitude: locationData.longitude
        });
        
        if (locationData.isIndia) {
          toast.success(`Location detected: ${locationData.city}, ${locationData.state}`);
        } else {
          toast.warning('Location detected outside India. Please verify.');
        }
      } else {
        toast.error('Could not detect location. Please enter manually.');
      }
    } catch (error) {
      console.error('Location detection error:', error);
      toast.error('Failed to detect location');
    } finally {
      setDetectingLocation(false);
    }
  };

  return (
    <form className="space-y-6">
      {/* Issue Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Issue Type *
        </label>
        <select
          name="issueType"
          value={formData.issueType}
          onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
          className="input-field"
          required
        >
          <option value="">Select issue type</option>
          <option value="Dengue">Dengue</option>
          <option value="Malaria">Malaria</option>
          <option value="COVID-19">COVID-19</option>
          <option value="Air Pollution">Air Pollution</option>
          <option value="Water Contamination">Water Contamination</option>
          <option value="Food Safety">Food Safety</option>
        </select>
      </div>

      {/* Location Section with Auto-Detect */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Location *
          </label>
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={detectingLocation}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {detectingLocation ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                Detecting...
              </>
            ) : (
              <>
                <span>📍</span>
                Auto-Detect
              </>
            )}
          </button>
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City *
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="input-field"
            placeholder="e.g., Mumbai, Delhi, Bangalore"
            required
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State *
          </label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            className="input-field"
            placeholder="e.g., Maharashtra, Delhi, Karnataka"
            required
          />
        </div>

        {/* Pincode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pincode
          </label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
            className="input-field"
            placeholder="e.g., 400001"
            maxLength="6"
          />
        </div>

        {/* Full Location (Auto-filled) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="input-field"
            placeholder="Auto-filled or enter manually"
            readOnly={detectingLocation}
          />
          <p className="text-xs text-gray-500 mt-1">
            This will be auto-filled when you click "Auto-Detect"
          </p>
        </div>

        {/* Hidden coordinates (for backend) */}
        <input type="hidden" name="latitude" value={formData.latitude} />
        <input type="hidden" name="longitude" value={formData.longitude} />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="input-field"
          rows="4"
          placeholder="Describe the health issue in detail..."
          required
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full btn-primary py-3 text-base font-medium"
      >
        Submit Report
      </button>
    </form>
  );
};

export default ReportFormWithAutoLocation;


// ============================================
// ALTERNATIVE: Simpler Integration
// ============================================

/**
 * If you just want to add a button to existing form:
 */

/*
import { getLocationForReport } from '../services/geolocationService';

// Add this function to your existing ReportForm component:
const autoFillLocation = async () => {
  const location = await getLocationForReport();
  
  if (location.success) {
    setFormData({
      ...formData,
      city: location.city,
      state: location.state,
      pincode: location.pincode,
      location: location.location
    });
    toast.success('Location detected!');
  }
};

// Add this button in your form:
<button type="button" onClick={autoFillLocation}>
  📍 Detect My Location
</button>
*/


// ============================================
// USAGE IN ALERTS PAGE
// ============================================

/**
 * Show alerts based on user's current location
 */

/*
import { getLocationWithRadius } from '../services/geolocationService';

const AlertsPage = () => {
  const [nearbyAlerts, setNearbyAlerts] = useState([]);
  
  useEffect(() => {
    loadNearbyAlerts();
  }, []);
  
  const loadNearbyAlerts = async () => {
    const location = await getLocationWithRadius(50); // 50km radius
    
    if (location.success) {
      // Fetch alerts near user's location
      const response = await fetch(
        `/api/alerts/nearby?city=${location.city}&state=${location.state}`
      );
      const alerts = await response.json();
      setNearbyAlerts(alerts);
    }
  };
  
  return (
    <div>
      <h2>Health Alerts Near You</h2>
      <p>Showing alerts for {location.searchArea}</p>
      {nearbyAlerts.map(alert => (
        <AlertCard key={alert.id} alert={alert} />
      ))}
    </div>
  );
};
*/


// ============================================
// USAGE IN DASHBOARD
// ============================================

/**
 * Show user's location on dashboard
 */

/*
import { getIndianLocation } from '../services/geolocationService';

const Dashboard = () => {
  const [userLocation, setUserLocation] = useState(null);
  
  useEffect(() => {
    detectUserLocation();
  }, []);
  
  const detectUserLocation = async () => {
    const location = await getIndianLocation();
    if (location.success) {
      setUserLocation(location);
    }
  };
  
  return (
    <div>
      {userLocation && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p>📍 Your Location: {userLocation.city}, {userLocation.state}</p>
          <p className="text-sm text-gray-600">
            Showing health data for your area
          </p>
        </div>
      )}
    </div>
  );
};
*/
