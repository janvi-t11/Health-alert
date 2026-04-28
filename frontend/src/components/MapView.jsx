import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Search, AlertTriangle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useGeolocation } from '../hooks/useGeolocation';
import 'leaflet/dist/leaflet.css';

// Local marker images — no CDN, no tracking prevention issues
const SHADOW = '/markers/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/markers/marker-icon-2x.png',
  iconUrl: '/markers/marker-icon.png',
  shadowUrl: SHADOW,
});

const MARKER_COLORS = {
  green:  '/markers/marker-green.png',
  gold:   '/markers/marker-gold.png',
  orange: '/markers/marker-orange.png',
  red:    '/markers/marker-red.png',
  blue:   '/markers/marker-blue.png',
};

const SEVERITY_CONFIG = {
  low:      { markerColor: 'green',  circleColor: '#22c55e', circleOpacity: 0.15, radius: 4000,  label: 'Low',      bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-500' },
  moderate: { markerColor: 'gold',   circleColor: '#eab308', circleOpacity: 0.18, radius: 6000,  label: 'Moderate', bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
  high:     { markerColor: 'orange', circleColor: '#f97316', circleOpacity: 0.22, radius: 8000,  label: 'High',     bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' },
  critical: { markerColor: 'red',    circleColor: '#ef4444', circleOpacity: 0.30, radius: 12000, label: 'Critical', bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-500' },
};

// Hardcoded fallback coords for common Indian cities (case-insensitive key)
const KNOWN_COORDS = {
  'mumbai': [19.076, 72.877], 'new delhi': [28.613, 77.209], 'delhi': [28.613, 77.209],
  'bangalore': [12.971, 77.594], 'bengaluru': [12.971, 77.594], 'chennai': [13.083, 80.270],
  'kolkata': [22.572, 88.363], 'pune': [18.520, 73.856], 'hyderabad': [17.385, 78.486],
  'ahmedabad': [23.022, 72.571], 'jaipur': [26.912, 75.787], 'lucknow': [26.846, 80.946],
  'kochi': [9.931, 76.267], 'surat': [21.170, 72.831], 'nagpur': [21.145, 79.088],
  'indore': [22.719, 75.857], 'bhopal': [23.259, 77.413], 'patna': [25.594, 85.137],
  'vadodara': [22.307, 73.181], 'coimbatore': [11.017, 76.955], 'agra': [27.176, 78.008],
  'visakhapatnam': [17.686, 83.218], 'chandigarh': [30.733, 76.779], 'guwahati': [26.144, 91.736],
  'bhubaneswar': [20.296, 85.824], 'thiruvananthapuram': [8.524, 76.936],
  'nashik': [19.998, 73.789], 'varanasi': [25.317, 82.973], 'meerut': [28.984, 77.706],
  'rajkot': [22.303, 70.802], 'amritsar': [31.634, 74.872], 'jabalpur': [23.181, 79.987],
  'haridwar': [29.945, 78.164], 'noida': [28.535, 77.391], 'gurgaon': [28.459, 77.026],
  'gurugram': [28.459, 77.026], 'faridabad': [28.408, 77.317], 'ghaziabad': [28.669, 77.453],
  'aurangabad': [19.877, 75.343], 'chhatrapati sambhajinagar': [19.877, 75.343], 'chhatrapati sambhaji nagar': [19.877, 75.343], 'sambhajinagar': [19.877, 75.343], 'solapur': [17.686, 75.906], 'ranchi': [23.344, 85.309],
  'raipur': [21.251, 81.629], 'jodhpur': [26.292, 73.016], 'madurai': [9.925, 78.119],
  'tiruchirappalli': [10.790, 78.704], 'mysuru': [12.295, 76.639], 'mysore': [12.295, 76.639],
  'hubli': [15.364, 75.124], 'mangalore': [12.914, 74.856], 'vijayawada': [16.506, 80.648],
  'warangal': [17.977, 79.598], 'guntur': [16.306, 80.436], 'nellore': [14.442, 79.987],
  'shimla': [31.104, 77.167], 'dehradun': [30.316, 78.032], 'jammu': [32.726, 74.857],
  'srinagar': [34.083, 74.797], 'imphal': [24.817, 93.944], 'shillong': [25.578, 91.893],
  'aizawl': [23.727, 92.717], 'kohima': [25.674, 94.110], 'itanagar': [27.084, 93.606],
  'gangtok': [27.329, 88.612], 'agartala': [23.831, 91.286], 'panaji': [15.499, 73.824],
  'port blair': [11.623, 92.726],
};

// Icon cache
const ICON_CACHE = {};
function getSeverityIcon(severity) {
  if (!ICON_CACHE[severity]) {
    const color = SEVERITY_CONFIG[severity]?.markerColor || 'red';
    ICON_CACHE[severity] = new L.Icon({
      iconUrl: MARKER_COLORS[color] || MARKER_COLORS.red,
      shadowUrl: SHADOW,
      iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
    });
  }
  return ICON_CACHE[severity];
}

const userIcon = new L.Icon({
  iconUrl: MARKER_COLORS.blue,
  shadowUrl: SHADOW,
  iconSize: [30, 46], iconAnchor: [15, 46], popupAnchor: [1, -38],
});

function FlyToUser({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 12, { duration: 1.2, easeLinearity: 0.5 });
  }, [coords]);
  return null;
}

function MapControls() {
  const map = useMapEvents({
    focus() { map.scrollWheelZoom.enable(); },
    blur()  { map.scrollWheelZoom.disable(); },
  });
  useEffect(() => { map.scrollWheelZoom.disable(); }, []);
  return null;
}

const indianStates = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'
];

// Nominatim geocode with 1 req/sec rate limit
// No external geocoding — use KNOWN_COORDS only, skip unknown cities
function geocodeCity(city) {
  return KNOWN_COORDS[city?.toLowerCase().trim()] || null;
}

const MapView = () => {
  const { allReports, reports } = useData();
  const { getLocation, loading: geoLoading } = useGeolocation();
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [userCoords, setUserCoords] = useState(null);
  const [nearbyAlerts, setNearbyAlerts] = useState([]);
  // cityCoords: { 'citykey': [lat, lng] | null }
  const [cityCoords, setCityCoords] = useState({});

  const sourceReports = allReports?.length ? allReports : reports;

  // Seed coords from KNOWN_COORDS for all reports
  useEffect(() => {
    if (!sourceReports.length) return;
    const coords = {};
    sourceReports.forEach(r => {
      if (!r.city) return;
      const key = r.city.toLowerCase().trim();
      if (!(key in coords)) {
        coords[key] = geocodeCity(r.city) || null;
      }
    });
    setCityCoords(coords);
  }, [sourceReports.length]);

  const handleLocateMe = async () => {
    try {
      const loc = await getLocation();
      setUserCoords([loc.lat, loc.lng]);
      const nearby = sourceReports.filter(r =>
        r.city && loc.city && r.city.toLowerCase().trim() === loc.city.toLowerCase().trim()
      );
      setNearbyAlerts(nearby);
    } catch {
      alert('Could not get your location. Please allow location access.');
    }
  };

  const reportMarkers = useMemo(() => {
    return sourceReports
      .filter(r => {
        if (!r.city) return false;
        const coords = cityCoords[r.city.toLowerCase().trim()];
        if (!coords) return false;
        if (severityFilter !== 'all' && r.severity !== severityFilter) return false;
        return true;
      })
      .map(r => ({ ...r, coords: cityCoords[r.city.toLowerCase().trim()] }));
  }, [sourceReports, cityCoords, severityFilter]);

  const dangerCities = useMemo(() => [...new Set(
    sourceReports.filter(r => r.severity === 'critical' && cityCoords[r.city?.toLowerCase()?.trim()]).map(r => r.city)
  )], [sourceReports, cityCoords]);

  const locationStats = useMemo(() => {
    const map = {};
    sourceReports.forEach(r => {
      const key = `${r.state}-${r.city}`;
      if (!map[key]) map[key] = { state: r.state, city: r.city, areas: new Set(), totalCases: 0, severeCases: 0, worstSeverity: 'low' };
      map[key].areas.add(r.area);
      map[key].totalCases++;
      if (r.severity === 'high' || r.severity === 'critical') map[key].severeCases++;
      const order = ['low', 'moderate', 'high', 'critical'];
      if (order.indexOf(r.severity) > order.indexOf(map[key].worstSeverity)) map[key].worstSeverity = r.severity;
    });
    return Object.values(map).map(l => ({ ...l, areas: l.areas.size }));
  }, [sourceReports]);

  const filteredStats = locationStats.filter(s =>
    (!selectedState || s.state === selectedState) &&
    (!selectedCity || s.city?.toLowerCase().includes(selectedCity.toLowerCase()))
  );

  const criticalCount = sourceReports.filter(r => r.severity === 'critical').length;

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Location-based Health Map</h2>
        <p className="text-gray-500 text-sm mt-1">
          Showing <span className="font-semibold text-blue-600">{reportMarkers.length}</span> of{' '}
          <span className="font-semibold">{sourceReports.length}</span> reports on map
        </p>
      </div>

      {/* Danger Banner */}
      {criticalCount > 0 && (
        <div className="mb-4 p-4 bg-red-600 text-white rounded-lg flex items-start gap-3">
          <AlertTriangle size={22} className="mt-0.5 shrink-0 animate-bounce" />
          <div>
            <p className="font-bold text-lg">🚨 DANGER ZONES ACTIVE</p>
            <p className="text-sm mt-1">{criticalCount} critical report(s) in: {dangerCities.join(', ') || 'loading...'}</p>
          </div>
        </div>
      )}

      {/* Nearby Alerts */}
      {nearbyAlerts.length > 0 && (
        <div className="mb-4 p-4 bg-orange-50 border border-orange-300 rounded-lg">
          <p className="text-orange-800 font-semibold">⚠️ {nearbyAlerts.length} health alert(s) near your location</p>
          <ul className="mt-1 text-sm text-orange-700 list-disc list-inside">
            {nearbyAlerts.slice(0, 4).map((a, i) => (
              <li key={i}>
                <span className={`font-medium ${SEVERITY_CONFIG[a.severity]?.text}`}>[{a.severity?.toUpperCase()}]</span>{' '}
                {a.diseaseType} — {a.area || a.city}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Filter by State</label>
            <select value={selectedState} onChange={e => setSelectedState(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All States</option>
              {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Search City</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input type="text" placeholder="Search city..." value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Severity</label>
            <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Severities</option>
              <option value="low">🟢 Low</option>
              <option value="moderate">🟡 Moderate</option>
              <option value="high">🟠 High</option>
              <option value="critical">🔴 Critical</option>
            </select>
          </div>
          <button onClick={handleLocateMe} disabled={geoLoading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors">
            <MapPin size={15} />
            {geoLoading ? 'Locating...' : 'Show My Location'}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white px-4 py-2.5 rounded-lg shadow-md mb-4 flex flex-wrap gap-4 items-center">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Legend:</span>
        {Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-full ${cfg.dot}`}></span>
            <span className="text-sm text-gray-600">{cfg.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
          <span className="text-sm text-gray-600">Your Location</span>
        </div>
        <span className="ml-auto text-xs text-gray-400 italic">Click map to enable scroll zoom</span>
      </div>

      {/* Map */}
      <div className="rounded-xl shadow-lg mb-6 overflow-hidden border border-gray-200" style={{ height: '520px' }}>
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          minZoom={4}
          maxZoom={16}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            maxZoom={19}
          />
          <MapControls />

          {userCoords && (
            <>
              <FlyToUser coords={userCoords} />
              <Marker position={userCoords} icon={userIcon}>
                <Popup><strong>📍 Your Location</strong></Popup>
              </Marker>
              <Circle center={userCoords} radius={5000} color="#3b82f6" fillColor="#3b82f6" fillOpacity={0.1} weight={2} />
            </>
          )}

          {reportMarkers.map((report, i) => {
            const cfg = SEVERITY_CONFIG[report.severity] || SEVERITY_CONFIG.low;
            return (
              <React.Fragment key={report._id || i}>
                <Circle
                  center={report.coords}
                  radius={cfg.radius}
                  color={cfg.circleColor}
                  fillColor={cfg.circleColor}
                  fillOpacity={cfg.circleOpacity}
                  weight={report.severity === 'critical' ? 2.5 : 1}
                />
                <Marker position={report.coords} icon={getSeverityIcon(report.severity)}>
                  <Popup maxWidth={200}>
                    <div>
                      <p style={{ fontWeight: '700', fontSize: '14px', marginBottom: '6px' }}>
                        {report.diseaseType || report.healthIssue}
                      </p>
                      <p style={{ fontSize: '12px', margin: '3px 0', color: '#555' }}>📍 {report.area}, {report.city}</p>
                      <p style={{ fontSize: '12px', margin: '3px 0', color: '#555' }}>🗺️ {report.state}</p>
                      <p style={{ fontSize: '12px', margin: '3px 0', color: '#555' }}>
                        Status: {report.verified ? '✅ Verified' : '⏳ Pending'}
                      </p>
                      <p style={{ fontSize: '13px', fontWeight: '600', marginTop: '6px', color: cfg.circleColor }}>
                        ● {cfg.label} Severity
                      </p>
                      {report.severity === 'critical' && (
                        <p style={{ color: '#dc2626', fontWeight: '700', marginTop: '4px', fontSize: '13px' }}>
                          🚨 DANGER ZONE
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>

      {/* Stats Cards */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Location Statistics
          <span className="ml-2 text-sm font-normal text-gray-500">({filteredStats.length} locations)</span>
        </h3>
        {filteredStats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStats.map((stat, index) => {
              const cfg = SEVERITY_CONFIG[stat.worstSeverity] || SEVERITY_CONFIG.low;
              return (
                <div
                  key={index}
                  onClick={() => navigate(`/reports?city=${encodeURIComponent(stat.city)}`)}
                  className={`border-2 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] ${stat.worstSeverity === 'critical' ? 'border-red-400 bg-red-50 hover:bg-red-100' : stat.worstSeverity === 'high' ? 'border-orange-300 hover:bg-orange-50' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <MapPin className="text-blue-500 mr-2 shrink-0" size={16} />
                      <div>
                        <h4 className="font-semibold text-gray-800 flex items-center gap-1">
                          {stat.city}
                          <ExternalLink size={12} className="text-gray-400" />
                        </h4>
                        <p className="text-xs text-gray-500">{stat.state}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">{stat.totalCases}</p>
                      <p className="text-xs text-gray-400">reports</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-blue-50 p-2 rounded text-center">
                      <p className="text-blue-800 font-semibold">{stat.areas}</p>
                      <p className="text-blue-500 text-xs">areas</p>
                    </div>
                    <div className="bg-red-50 p-2 rounded text-center">
                      <p className="text-red-800 font-semibold">{stat.severeCases}</p>
                      <p className="text-red-500 text-xs">severe</p>
                    </div>
                    <div className={`${cfg.bg} p-2 rounded text-center`}>
                      <p className={`${cfg.text} font-semibold text-xs`}>{cfg.label}</p>
                      <p className={`${cfg.text} text-xs opacity-75`}>worst</p>
                    </div>
                  </div>
                  {stat.worstSeverity === 'critical' && (
                    <p className="mt-2 text-xs text-red-600 font-semibold flex items-center gap-1">
                      <AlertTriangle size={11} /> DANGER ZONE — Avoid if possible
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10">
            <MapPin className="text-gray-200 mx-auto mb-3" size={52} />
            <p className="text-gray-400">{sourceReports.length === 0 ? 'No health reports yet.' : 'No locations match your filters.'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
