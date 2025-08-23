import React from 'react';
import { Users, Shield, MapPin } from 'lucide-react';

const LoginSelection = ({ onSelectUserType }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <MapPin className="text-blue-600 mr-3" size={32} />
            <h1 className="text-4xl font-bold text-gray-800">Health Alert Platform</h1>
          </div>
          <p className="text-xl text-gray-600">Monitor and report health issues across India</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Local User Login */}
          <div 
            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-200"
            onClick={() => onSelectUserType('local')}
          >
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-green-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Local User</h2>
              <p className="text-gray-600 mb-6">
                Report health issues in your area and view analytics to stay informed about local health trends.
              </p>
              <div className="space-y-2 text-sm text-gray-500 mb-6">
                <p>✓ Report health issues</p>
                <p>✓ View local analytics</p>
                <p>✓ Track area-wise trends</p>
              </div>
              <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-medium">
                Continue as Local User
              </button>
            </div>
          </div>

          {/* Admin Login */}
          <div 
            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-red-200"
            onClick={() => onSelectUserType('admin')}
          >
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-red-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin</h2>
              <p className="text-gray-600 mb-6">
                Access the complete database, manage reports, and monitor health trends across all regions.
              </p>
              <div className="space-y-2 text-sm text-gray-500 mb-6">
                <p>✓ Full database access</p>
                <p>✓ Report management</p>
                <p>✓ Advanced analytics</p>
                <p>✓ Export capabilities</p>
              </div>
              <button className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 font-medium">
                Continue as Admin
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-500">
            Helping communities stay healthy through data-driven insights
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginSelection;