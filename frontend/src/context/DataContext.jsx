import { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Filter reports based on user type
  const reports = isAdmin ? allReports : allReports.filter(r => r.verified === true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/reports');
      if (!response.ok) throw new Error('Failed to fetch reports');
      const data = await response.json();
      setAllReports(data);
    } catch (error) {
      console.error('Failed to load reports:', error);
      setAllReports([]);
    } finally {
      setLoading(false);
    }
  };

  const addReport = async (reportData) => {
    try {
      const response = await fetch('http://localhost:4000/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportData)
      });
      if (!response.ok) throw new Error('Failed to create report');
      const newReport = await response.json();
      setAllReports(prev => [newReport, ...prev]);
      return newReport;
    } catch (error) {
      console.error('Failed to create report:', error);
      throw error;
    }
  };

  const setAdminMode = (admin) => {
    setIsAdmin(admin);
  };

  const getAnalytics = () => {
    return {
      totalReports: allReports.length,
      verifiedReports: allReports.filter(r => r.verified).length,
      pendingReports: allReports.filter(r => !r.verified).length,
      diseaseBreakdown: allReports.reduce((acc, report) => {
        acc[report.diseaseType] = (acc[report.diseaseType] || 0) + 1;
        return acc;
      }, {})
    };
  };

  const value = {
    reports,
    allReports,
    loading,
    addReport,
    loadReports,
    getAnalytics,
    approveReport: async (reportId) => {
      try {
        const response = await fetch(`http://localhost:4000/api/reports/${reportId}/approve`, {
          method: 'PUT'
        });
        if (!response.ok) throw new Error('Failed to approve report');
        const updatedReport = await response.json();
        setAllReports(prev => prev.map(report => 
          report._id === reportId ? updatedReport : report
        ));
      } catch (error) {
        console.error('Failed to approve report:', error);
        throw error;
      }
    },
    rejectReport: async (reportId) => {
      try {
        const response = await fetch(`http://localhost:4000/api/reports/${reportId}/reject`, {
          method: 'PUT'
        });
        if (!response.ok) throw new Error('Failed to reject report');
        const updatedReport = await response.json();
        setAllReports(prev => prev.map(report => 
          report._id === reportId ? updatedReport : report
        ));
      } catch (error) {
        console.error('Failed to reject report:', error);
        throw error;
      }
    },
    isAdmin,
    setAdminMode,
    deleteReport: async (reportId) => {
      try {
        const response = await fetch(`http://localhost:4000/api/reports/${reportId}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete report');
        setAllReports(prev => prev.filter(report => report._id !== reportId));
      } catch (error) {
        console.error('Failed to delete report:', error);
        throw error;
      }
    }
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};