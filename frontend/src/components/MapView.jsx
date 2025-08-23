import React, { useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { useData } from '../context/DataContext';

const MapView = () => {
  const { reports } = useData();
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const getLocationStats = () => {
    const locationMap = {};
    reports.forEach(report => {
      const key = `${report.state}-${report.city}`;
      if (!locationMap[key]) {
        locationMap[key] = {
          state: report.state,
          city: report.city,
          areas: new Set(),
          totalCases: 0,
          severeCases: 0
        };
      }
      locationMap[key].areas.add(report.area);
      locationMap[key].totalCases++;
      if (report.severity === 'severe') {
        locationMap[key].severeCases++;
      }
    });

    return Object.values(locationMap).map(loc => ({
      ...loc,
      areas: loc.areas.size
    }));
  };

  const locationStats = getLocationStats();
  const filteredStats = locationStats.filter(stat => {
    return (!selectedState || stat.state === selectedState) &&
           (!selectedCity || stat.city.toLowerCase().includes(selectedCity.toLowerCase()));
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Location-based Health Map</h2>
        <p className="text-gray-600">Health issues distribution across India</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by State
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All States</option>
              {indianStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search City
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search city..."
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Map Visualization */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">India Health Map</h3>
        <div className="h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            {/* State-wise Data */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                State-wise Cases
              </h4>
              <div className="space-y-2 text-sm">
                {Object.entries(
                  reports.reduce((acc, report) => {
                    acc[report.state] = (acc[report.state] || 0) + 1;
                    return acc;
                  }, {})
                ).slice(0, 5).map(([state, count]) => (
                  <div key={state} className="flex justify-between items-center">
                    <span className="text-gray-700">{state}</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* City-level Data */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                City-level Reports
              </h4>
              <div className="space-y-2 text-sm">
                {Object.entries(
                  reports.reduce((acc, report) => {
                    const key = `${report.city}, ${report.state}`;
                    acc[key] = (acc[key] || 0) + 1;
                    return acc;
                  }, {})
                ).slice(0, 5).map(([city, count]) => (
                  <div key={city} className="flex justify-between items-center">
                    <span className="text-gray-700 truncate">{city}</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Real-time Distribution */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                Case Distribution
              </h4>
              <div className="space-y-2 text-sm">
                {Object.entries(
                  reports.reduce((acc, report) => {
                    acc[report.diseaseType] = (acc[report.diseaseType] || 0) + 1;
                    return acc;
                  }, {})
                ).slice(0, 5).map(([disease, count]) => (
                  <div key={disease} className="flex justify-between items-center">
                    <span className="text-gray-700 truncate">{disease}</span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Map Summary */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Total Reports: <span className="font-semibold">{reports.length}</span> | 
              Active States: <span className="font-semibold">{new Set(reports.map(r => r.state)).size}</span> | 
              Cities Covered: <span className="font-semibold">{new Set(reports.map(r => r.city)).size}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Location Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Location Statistics</h3>
        
        {filteredStats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStats.map((stat, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <MapPin className="text-blue-500 mr-2" size={16} />
                    <div>
                      <h4 className="font-semibold text-gray-800">{stat.city}</h4>
                      <p className="text-sm text-gray-600">{stat.state}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{stat.totalCases}</p>
                    <p className="text-xs text-gray-500">total cases</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-blue-800 font-medium">{stat.areas}</p>
                    <p className="text-blue-600 text-xs">areas affected</p>
                  </div>
                  <div className="bg-red-50 p-2 rounded">
                    <p className="text-red-800 font-medium">{stat.severeCases}</p>
                    <p className="text-red-600 text-xs">severe cases</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MapPin className="text-gray-300 mx-auto mb-4" size={48} />
            <p className="text-gray-500">
              {reports.length === 0 
                ? 'No health reports submitted yet. Start by reporting health issues in your area.'
                : 'No locations match your search criteria.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;