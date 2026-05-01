import { useState } from 'react';

// Get area + city + state from bigdatacloud (free, no key, works from browser)
async function getLocationFromBigdata(lat, lng) {
  const res = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
  );
  const data = await res.json();
  const city  = data.city || data.principalSubdivision || '';
  const state = data.principalSubdivision || '';

  // Extract most specific area from localityInfo
  let area = '';
  const informative   = data.localityInfo?.informative || [];
  const administrative = data.localityInfo?.administrative || [];

  const suburbInfo = informative.find(i =>
    ['suburb','neighbourhood','quarter','hamlet','village','locality']
      .includes(i.description?.toLowerCase())
  );
  if (suburbInfo?.name && suburbInfo.name !== city) {
    area = suburbInfo.name;
  } else {
    const sorted = [...administrative].sort((a, b) => b.adminLevel - a.adminLevel);
    for (const item of sorted) {
      if (item.name && item.name !== city && item.name !== state && item.adminLevel >= 6) {
        area = item.name;
        break;
      }
    }
  }

  return { city, state, area, country: data.countryName || 'India' };
}

// Get pincode from India Post API using area/city + state matching
async function getPincodeFromIndiaPost(area, city, state) {
  const stateLower = state.toLowerCase().trim();
  const terms = [area, city].filter(Boolean);

  for (const term of terms) {
    try {
      const res = await fetch(
        `https://api.postalpincode.in/postoffice/${encodeURIComponent(term)}`
      );
      const data = await res.json();
      if (data?.[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
        // Strict state match first
        const stateMatch = data[0].PostOffice.find(p =>
          p.State?.toLowerCase().trim() === stateLower
        );
        // Loose state match fallback
        const looseMatch = data[0].PostOffice.find(p =>
          p.State?.toLowerCase().includes(stateLower) ||
          stateLower.includes(p.State?.toLowerCase().trim())
        );
        const match = stateMatch || looseMatch;
        if (match) return match.Pincode;
      }
    } catch {}
  }
  return '';
}

export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

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
            // Step 1: get city, state, area from bigdatacloud
            const loc = await getLocationFromBigdata(latitude, longitude);

            // Step 2: get pincode from India Post API (browser → no CORS issue)
            const pincode = await getPincodeFromIndiaPost(loc.area, loc.city, loc.state);

            resolve({
              lat:     latitude,
              lng:     longitude,
              city:    loc.city,
              state:   loc.state,
              area:    loc.area,
              pincode,
              country: loc.country,
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
