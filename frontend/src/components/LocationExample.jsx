import { useState, useEffect } from 'react';
import { getLocationForReport } from '../services/geolocationService';
import toast from 'react-hot-toast';

/**
 * Component showing auto-detect location for all Indian cities
 */
export default function LocationDetector() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  const detectLocation = async () => {
    setLoading(true);
    
    try {
      const locationData = await getLocationForReport();
      
      if (locationData.success) {
        setLocation(locationData);
        
        if (locationData.isIndia) {
          toast.success(`Location detected: ${locationData.city}, ${locationData.state}`);
        } else {
          toast.error('This service is optimized for Indian locations');
        }
      } else {
        toast.error('Could not detect location. Please enter manually.');
      }
    } catch (err) {
      toast.error('Failed to detect location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={detectLocation}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Detecting...
          </>
        ) : (
          <>
            <span>📍</span>
            Detect My Location
          </>
        )}
      </button>

      {location && location.success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-2">Detected Location</h4>
          <div className="space-y-1 text-sm text-green-700">
            <p><strong>City:</strong> {location.city}</p>
            <p><strong>State:</strong> {location.state}</p>
            <p><strong>Pincode:</strong> {location.pincode || 'Not available'}</p>
            <p><strong>Full Location:</strong> {location.location}</p>
            {location.isIndia && (
              <p className="text-xs text-green-600 mt-2">✓ Location verified in India</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
