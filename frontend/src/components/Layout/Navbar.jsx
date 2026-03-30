import React from 'react';
import { MapPin, User } from 'lucide-react';

const Navbar = ({ title, userType = 'local' }) => {
  return (
    <div className="bg-white shadow-sm border-b px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
            <MapPin size={16} />
            <span>India</span>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
            <User size={14} className="sm:w-4 sm:h-4" />
            <span className={`px-2 py-1 rounded-full text-xs ${
              userType === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
              {userType === 'admin' ? 'Admin' : 'User'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;