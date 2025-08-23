import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPinIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { useData } from '../context/DataContext';

export default function LocationAlert() {
  const { reports } = useData();
  const [showAlert, setShowAlert] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [alertData, setAlertData] = useState(null);
  const [locationRequested, setLocationRequested] = useState(false);

  useEffect(() => {
    if (!locationRequested) {
      requestLocation();
      setLocationRequested(true);
    }
  }, [locationRequested]);

  useEffect(() => {
    if (userLocation && reports.length > 0) {
      checkNearbyReports();
    }
  }, [userLocation, reports]);

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          // Fallback: ask for city manually or use IP-based location
          setUserLocation({ city: 'Unknown', manual: true });
        }
      );
    }
  };

  const checkNearbyReports = () => {
    if (!userLocation) return;

    // For demo, we'll use city-based matching since we don't have GPS coordinates in reports
    // In real implementation, you'd calculate distance using GPS coordinates
    
    const nearbyReports = reports.filter(report => {
      // Simple city matching - in real app, use GPS distance calculation
      return report.verified && report.city && 
             userLocation.city && 
             report.city.toLowerCase().includes(userLocation.city.toLowerCase());
    });

    const criticalReports = nearbyReports.filter(r => 
      r.severity === 'critical' || r.severity === 'severe'
    );

    if (criticalReports.length > 0) {
      setAlertData({
        type: 'danger',
        title: 'Health Alert in Your Area',
        message: `${criticalReports.length} critical health issue(s) reported in your area. Stay cautious and follow safety guidelines.`,
        reports: criticalReports.slice(0, 3),
        totalNearby: nearbyReports.length
      });
    } else if (nearbyReports.length > 0) {
      setAlertData({
        type: 'warning',
        title: 'Health Reports in Your Area',
        message: `${nearbyReports.length} health issue(s) reported in your area. Stay informed and take precautions.`,
        reports: nearbyReports.slice(0, 3),
        totalNearby: nearbyReports.length
      });
    } else {
      setAlertData({
        type: 'safe',
        title: 'Safe Zone',
        message: 'No health issues reported in your immediate area. You are in a relatively safe zone.',
        reports: [],
        totalNearby: 0
      });
    }
    
    setShowAlert(true);
  };

  const closeAlert = () => {
    setShowAlert(false);
  };

  if (!showAlert || !alertData) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`max-w-md w-full rounded-lg shadow-xl p-6 ${
            alertData.type === 'danger' ? 'bg-red-50 border-2 border-red-200' :
            alertData.type === 'warning' ? 'bg-yellow-50 border-2 border-yellow-200' :
            'bg-green-50 border-2 border-green-200'
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              {alertData.type === 'safe' ? (
                <ShieldCheckIcon className="h-8 w-8 text-green-600 mr-3" />
              ) : (
                <ExclamationTriangleIcon className={`h-8 w-8 mr-3 ${
                  alertData.type === 'danger' ? 'text-red-600' : 'text-yellow-600'
                }`} />
              )}
              <div>
                <h3 className={`text-lg font-semibold ${
                  alertData.type === 'danger' ? 'text-red-900' :
                  alertData.type === 'warning' ? 'text-yellow-900' :
                  'text-green-900'
                }`}>
                  {alertData.title}
                </h3>
              </div>
            </div>
            <button
              onClick={closeAlert}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <p className={`text-sm mb-4 ${
            alertData.type === 'danger' ? 'text-red-800' :
            alertData.type === 'warning' ? 'text-yellow-800' :
            'text-green-800'
          }`}>
            {alertData.message}
          </p>

          {alertData.reports.length > 0 && (
            <div className="space-y-2 mb-4">
              <h4 className={`text-sm font-medium ${
                alertData.type === 'danger' ? 'text-red-900' :
                alertData.type === 'warning' ? 'text-yellow-900' :
                'text-green-900'
              }`}>
                Recent Reports:
              </h4>
              {alertData.reports.map((report, index) => (
                <div key={index} className={`p-2 rounded text-xs ${
                  alertData.type === 'danger' ? 'bg-red-100' :
                  alertData.type === 'warning' ? 'bg-yellow-100' :
                  'bg-green-100'
                }`}>
                  <div className="font-medium">{report.diseaseType}</div>
                  <div className="text-gray-600">{report.area}, {report.city}</div>
                </div>
              ))}
              {alertData.totalNearby > 3 && (
                <p className="text-xs text-gray-600">
                  +{alertData.totalNearby - 3} more reports in your area
                </p>
              )}
            </div>
          )}

          <div className="flex items-center text-xs text-gray-600 mb-4">
            <MapPinIcon className="h-4 w-4 mr-1" />
            Location-based alert • Updated now
          </div>

          <button
            onClick={closeAlert}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              alertData.type === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white' :
              alertData.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' :
              'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            Got it
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}