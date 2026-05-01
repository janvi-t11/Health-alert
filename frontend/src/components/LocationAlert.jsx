import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  MapPinIcon, ShieldCheckIcon, ExclamationTriangleIcon, XMarkIcon, ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useData } from '../context/DataContext';

// Reverse geocode using backend proxy with bigdatacloud fallback
async function reverseGeocode(lat, lng) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
  // Try backend first
  try {
    const res = await fetch(`${API_BASE}/geocode/reverse?lat=${lat}&lng=${lng}`);
    if (res.ok) {
      const data = await res.json();
      if (data.city) return { city: data.city, area: data.area || '', district: data.state || '' };
    }
  } catch {}
  // Fallback to bigdatacloud
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    const data = await res.json();
    return {
      city:     data.city || data.principalSubdivision || '',
      area:     data.locality || '',
      district: data.principalSubdivision || '',
    };
  } catch {}
  return { city: '', area: '', district: '' };
}

// Match report to user location — exact city match only
function isNearUser(report, userLoc) {
  const reportCity = report.city?.toLowerCase().trim();
  const userCity   = userLoc.city?.toLowerCase().trim();
  const userDistrict = userLoc.district?.toLowerCase().trim();

  if (!reportCity || !userCity) return false;

  // Exact city match
  if (reportCity === userCity) return true;

  // Handle known aliases: Aurangabad ↔ Chhatrapati Sambhajinagar
  const aliases = [
    ['aurangabad', 'chhatrapati sambhajinagar', 'chhatrapati sambhaji nagar', 'sambhajinagar'],
  ];
  for (const group of aliases) {
    if (group.includes(reportCity) && (group.includes(userCity) || group.includes(userDistrict))) return true;
  }

  return false;
}

const STORAGE_KEY = 'locationPermissionAsked';

export default function LocationAlert({ sessionKey = 'default', useLocalStorage = false }) {

  const { allReports, reports, setDangerZone } = useData();
  const sourceReports = allReports?.length ? allReports : reports;

  // 'ask'      → show our custom "Allow Location" prompt
  // 'loading'  → getting GPS + geocoding
  // 'done'     → show alert popup
  // 'denied'   → user said no
  // 'idle'     → already asked this session, skip
  const [step, setStep] = useState('idle');
  const [userLocation, setUserLocation] = useState(null);
  const [alertData, setAlertData] = useState(null);
  const initRef = useRef(false);

  // On mount — check if we already asked this session
  const storage = useLocalStorage ? localStorage : sessionStorage;
  const storageKey = `${STORAGE_KEY}_${sessionKey}`;

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const alreadyAsked = storage.getItem(storageKey);
    if (!alreadyAsked) {
      setTimeout(() => setStep('ask'), 800);
    }
  }, [sessionKey]);

  const handleAllow = () => {
    storage.setItem(storageKey, 'true');

    setStep('loading');

    if (!navigator.geolocation) {
      setStep('denied');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const loc = await reverseGeocode(lat, lng);
        setUserLocation({ ...loc, lat, lng });
        // step will move to 'done' via the next useEffect
      },
      (err) => {
        console.warn('Location denied:', err.message);
        setStep('denied');
      },
      { timeout: 10000, maximumAge: 0, enableHighAccuracy: true }
    );
  };

    const handleDeny = () => {
    storage.setItem(storageKey, 'true');

    setStep('idle');
  };

  // Once we have location + reports, compute alert
  useEffect(() => {
    if (!userLocation || !sourceReports.length) return;

    const nearby = sourceReports.filter(r => isNearUser(r, userLocation));
    const critical = nearby.filter(r => r.severity === 'critical');
    const high     = nearby.filter(r => r.severity === 'high');
    const displayCity = userLocation.area || userLocation.city || userLocation.district || 'your area';

    if (critical.length > 0) {
      setAlertData({ type: 'danger', title: '🚨 Danger Zone Detected!',
        message: `${critical.length} critical health report(s) in ${displayCity}. Take immediate precautions.`,
        reports: critical.slice(0, 3), extra: Math.max(0, nearby.length - 3), city: userLocation.city });
      setDangerZone({ city: displayCity, count: critical.length, type: 'critical' });

    } else if (high.length > 0) {
      setAlertData({ type: 'warning', title: '⚠️ Health Alert in Your Area',
        message: `${high.length} high severity report(s) near ${displayCity}. Stay cautious.`,
        reports: high.slice(0, 3), extra: Math.max(0, nearby.length - 3), city: userLocation.city });
      setDangerZone({ city: displayCity, count: high.length, type: 'high' });

    } else if (nearby.length > 0) {
      setAlertData({ type: 'info', title: '📋 Health Reports Near You',
        message: `${nearby.length} health report(s) in ${displayCity}. Stay informed.`,
        reports: nearby.slice(0, 3), extra: Math.max(0, nearby.length - 3), city: userLocation.city });

    } else {
      setAlertData({ type: 'safe', title: '✅ Your Area is Safe',
        message: `No active health reports near ${displayCity}. Stay safe!`,
        reports: [], extra: 0, city: userLocation.city });
    }

    setStep('done');
  }, [userLocation, sourceReports.length]);

  const styles = {
    danger:  { bg: 'bg-red-50',    border: 'border-red-300',    title: 'text-red-900',    msg: 'text-red-700',    tag: 'bg-red-100 text-red-800',     btn: 'bg-red-600 hover:bg-red-700 text-white',      icon: <ExclamationTriangleIcon className="h-7 w-7 text-red-600" /> },
    warning: { bg: 'bg-orange-50', border: 'border-orange-300', title: 'text-orange-900', msg: 'text-orange-700', tag: 'bg-orange-100 text-orange-800', btn: 'bg-orange-500 hover:bg-orange-600 text-white', icon: <ExclamationTriangleIcon className="h-7 w-7 text-orange-500" /> },
    info:    { bg: 'bg-blue-50',   border: 'border-blue-200',   title: 'text-blue-900',   msg: 'text-blue-700',   tag: 'bg-blue-100 text-blue-800',    btn: 'bg-blue-600 hover:bg-blue-700 text-white',    icon: <MapPinIcon className="h-7 w-7 text-blue-500" /> },
    safe:    { bg: 'bg-green-50',  border: 'border-green-200',  title: 'text-green-900',  msg: 'text-green-700',  tag: 'bg-green-100 text-green-800',  btn: 'bg-green-600 hover:bg-green-700 text-white',  icon: <ShieldCheckIcon className="h-7 w-7 text-green-600" /> },
  };

  const severityColor = (sev) => ({
    low: 'bg-green-100 text-green-700', moderate: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700', critical: 'bg-red-100 text-red-700 font-bold',
  }[sev] || 'bg-gray-100 text-gray-600');

  return (
    <AnimatePresence>

      {/* Step 1 — Custom permission prompt */}
      {step === 'ask' && (
        <motion.div
          key="ask"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="max-w-sm w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Top accent */}
            <div className="bg-blue-600 px-6 py-4 text-white text-center">
              <MapPinIcon className="h-10 w-10 mx-auto mb-2 opacity-90" />
              <h3 className="text-lg font-bold">Allow Location Access</h3>
            </div>

            <div className="p-6">
              <p className="text-gray-600 text-sm text-center mb-2">
                HealthAlerts needs your location to check for
                <span className="font-semibold text-red-600"> health alerts near you</span>.
              </p>
              <p className="text-gray-400 text-xs text-center mb-6">
                Your location is never stored or shared.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleAllow}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <MapPinIcon className="h-4 w-4" />
                  Allow Location
                </button>
                <button
                  onClick={handleDeny}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-medium transition-colors"
                >
                  Not Now
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Step 2 — Loading */}
      {step === 'loading' && (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-2xl px-8 py-6 shadow-xl flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
            <p className="text-sm text-gray-600 font-medium">Detecting your location...</p>
            <p className="text-xs text-gray-400">Checking nearby health alerts</p>
          </div>
        </motion.div>
      )}

      {/* Step 3 — Alert result */}
      {step === 'done' && alertData && (
        <motion.div
          key="done"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setStep('idle')}
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className={`max-w-md w-full rounded-2xl shadow-2xl border-2 ${styles[alertData.type].bg} ${styles[alertData.type].border} overflow-hidden`}
          >
            {alertData.type === 'danger' && (
              <div className="bg-red-600 text-white text-center text-xs font-bold py-1.5 tracking-widest uppercase animate-pulse">
                🚨 You are in a danger zone
              </div>
            )}

            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {styles[alertData.type].icon}
                  <div>
                    <h3 className={`text-base font-bold ${styles[alertData.type].title}`}>{alertData.title}</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPinIcon className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-400">
                        {userLocation?.area && `${userLocation.area}, `}{userLocation?.city}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setStep('idle')} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <p className={`text-sm mb-4 ${styles[alertData.type].msg}`}>{alertData.message}</p>

              {alertData.reports.length > 0 && (
                <div className="space-y-2 mb-4">
                  <p className={`text-xs font-semibold uppercase tracking-wide ${styles[alertData.type].title}`}>Reports in your area:</p>
                  {alertData.reports.map((r, i) => (
                    <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg ${styles[alertData.type].tag}`}>
                      <div>
                        <p className="text-sm font-medium">{r.diseaseType || r.healthIssue}</p>
                        <p className="text-xs opacity-70">{r.area}, {r.city}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${severityColor(r.severity)}`}>
                        {r.severity}
                      </span>
                    </div>
                  ))}
                  {alertData.extra > 0 && (
                    <p className="text-xs text-gray-400 text-center">+{alertData.extra} more reports nearby</p>
                  )}
                </div>
              )}

              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
                <MapPinIcon className="h-3 w-3" />
                Based on your GPS location · Live data
              </div>

              <div className="flex gap-3">
                {alertData.type !== 'safe' ? (
                  <>
                    <Link
                      to={`/reports?city=${encodeURIComponent(alertData.city)}`}
                      onClick={() => setStep('idle')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${styles[alertData.type].btn}`}
                    >
                      View Reports <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => setStep('idle')}
                      className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                      Dismiss
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setStep('idle')}
                    className={`w-full py-2.5 rounded-lg text-sm font-semibold ${styles[alertData.type].btn}`}
                  >
                    Got it, Stay Safe!
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

    </AnimatePresence>
  );
}
