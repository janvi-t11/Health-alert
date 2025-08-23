import React, { useState } from 'react';
import Sidebar from './Layout/Sidebar';
import Navbar from './Layout/Navbar';
import HomePage from './HomePage';
import AlertsPage from './AlertsPage';
import ReportForm from './ReportForm';
import Analytics from './Analytics';
import DatabaseView from './DatabaseView';

const MainApp = ({ userType = 'local', onLogout }) => {
  const [activeSection, setActiveSection] = useState('report');

  const getPageTitle = () => {
    switch (activeSection) {
      case 'alerts': return 'Health Alerts';
      case 'database': return 'Database View';
      case 'report': return 'Report Health Issue';
      case 'analytics': return 'Health Analytics';
      default: return 'Health Alert Platform';
    }
  };

  const renderContent = () => {
    try {
      switch (activeSection) {
        case 'report':
          return <ReportForm />;
        case 'alerts':
          return <AlertsPage />;
        case 'database':
          return <DatabaseView />;
        case 'analytics':
          return <Analytics />;
        default:
          return <ReportForm />;
      }
    } catch (error) {
      console.error('Error rendering content:', error);
      return (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-medium">Something went wrong</h3>
            <p className="text-red-600 text-sm mt-1">Please refresh the page or try again.</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        activeItem={activeSection}
        onItemClick={setActiveSection}
        userType={userType}
        onLogout={onLogout}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title={getPageTitle()} userType={userType} />
        
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default MainApp;