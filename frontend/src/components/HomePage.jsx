import React from 'react';
import { Heart, MapPin, TrendingUp, Users } from 'lucide-react';

const HomePage = ({ userType }) => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Heart className="text-red-500 mr-3" size={32} />
          <h1 className="text-3xl font-bold text-gray-800">Welcome to Health Alert Platform</h1>
        </div>
        <p className="text-lg text-gray-600">
          "Early Detection, Swift Action, Healthier Communities"
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <MapPin className="text-blue-500 mr-3" size={24} />
            <h3 className="text-xl font-semibold text-gray-800">Location-Based Reporting</h3>
          </div>
          <p className="text-gray-600">
            Report health issues with precise location data including state, city, area, and pincode across India.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <TrendingUp className="text-green-500 mr-3" size={24} />
            <h3 className="text-xl font-semibold text-gray-800">Real-Time Analytics</h3>
          </div>
          <p className="text-gray-600">
            View live health trends and patterns in your community with comprehensive data visualization.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <Users className="text-purple-500 mr-3" size={24} />
            <h3 className="text-xl font-semibold text-gray-800">Community Health</h3>
          </div>
          <p className="text-gray-600">
            Help build a comprehensive health monitoring system to protect your community.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-8 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Get Started
        </h2>
        <p className="text-gray-600 mb-6">
          Start by reporting health issues in your area to build the community health database.
        </p>
        <div className="text-sm text-gray-500">
          <p>• Use the sidebar to navigate between sections</p>
          <p>• Report health issues with location details</p>
          <p>• View analytics as data grows</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;