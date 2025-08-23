import React from 'react';
import { MapPin, User } from 'lucide-react';

const Navbar = ({ title, userType = 'local' }) => {
  return (
    <div className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin size={16} />
            <span>India</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <User size={16} />
            <span className={`px-2 py-1 rounded-full text-xs ${
              userType === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
              {userType === 'admin' ? 'Admin' : 'Local User'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;