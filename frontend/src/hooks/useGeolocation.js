import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

// Reverse geocode via our backend proxy (Nominatim server-side)
// Falls back to bigdatacloud if backend endpoint not available
async function reverseGeocodeViaBackend(lat, lng) {
  const res = await fetch(`${API_BASE}/geocode/reverse?lat=${lat}&lng=${lng}`);
  if (!res.ok) throw new Error(`Backend returned ${res.status}`);
  return await res.json();
}

async function reverseGeocodeViaBigdata(lat, lng) {
  const res = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
  );
  const data = await res.json();
  const city = data.city || data.principalSubdivision || '';
  // Get most specific area from localityInfo
  let area = '';
  const informative = data.localityInfo?.informative || [];
  const administrative = data.localityInfo?.administrative || [];
  const suburbInfo = informative.find(i =>
    ['suburb','neighbourhood','quarter','hamlet','village','locality'].includes(i.description?.toLowerCase())
  );
  if (suburbInfo?.name && suburbInfo.name !== city) {
    area = suburbInfo.name;
  } else {
    const sorted = [...administrative].sort((a, b) => b.adminLevel - a.adminLevel);
    for (const item of sorted) {
      if (item.name && item.name !== city && item.name !== data.principalSubdivision && item.adminLevel >= 6) {
        area = item.name;
        break;
      }
    }
  }
  return {
    city,
    state:   data.principalSubdivision || '',
    area,
    pincode: data.postcode || '',
    country: data.countryName || 'India',
  };
}

export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation is not supported by your browser');
        return;
      }
      setLoading(true);
      setError('');
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Try backend proxy first (Nominatim, exact pincode)
            // Fall back to bigdatacloud if backend not available
            let data;
            try {
              data = await reverseGeocodeViaBackend(latitude, longitude);
            } catch {
              data = await reverseGeocodeViaBigdata(latitude, longitude);
            }
            resolve({
              lat: latitude,
              lng: longitude,
              city:    data.city    || '',
              state:   data.state   || '',
              area:    data.area    || '',
              pincode: data.pincode || '',
              country: data.country || 'India',
            });
          } catch {
            resolve({ lat: latitude, lng: longitude, city: '', state: '', area: '', pincode: '', country: 'India' });
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          setLoading(false);
          setError(err.message);
          reject(err.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  return { getLocation, loading, error };
}
