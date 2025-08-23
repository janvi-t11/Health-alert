import React from 'react';
import { Home, FileText, BarChart3, Database, AlertTriangle, LogOut } from 'lucide-react';

const Sidebar = ({ activeItem, onItemClick, userType = 'local', onLogout }) => {
  const localMenuItems = [
    { id: 'report', label: 'Report Health Issue', icon: FileText },
    { id: 'alerts', label: 'Health Alerts', icon: AlertTriangle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const adminMenuItems = [
    { id: 'report', label: 'Report Health Issue', icon: FileText },
    { id: 'alerts', label: 'Health Alerts', icon: AlertTriangle },
    { id: 'database', label: 'Database View', icon: Database },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const menuItems = userType === 'admin' ? adminMenuItems : localMenuItems;

  return (
    <div className="w-64 bg-white h-screen shadow-lg">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-blue-600">Health Alert</h2>
        <p className="text-sm text-gray-500">{userType === 'admin' ? 'Admin Panel' : 'Local Reporter'}</p>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`flex items-center px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 cursor-pointer ${
                activeItem === item.id ? 'text-blue-600 bg-blue-50' : ''
              }`}
              onClick={() => onItemClick(item.id)}
            >
              <Icon size={18} className="mr-3" />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>
      
      <div className="absolute bottom-6 left-6 right-6">
        <div 
          className="flex items-center px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 cursor-pointer"
          onClick={onLogout}
        >
          <LogOut size={18} className="mr-3" />
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;