import { createContext, useContext, useState, useEffect } from 'react';
import { api, getReports, createReport, approveReport, rejectReport } from '../services/api';
import io from 'socket.io-client';
import toast from 'react-hot-toast';

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
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Filter reports based on user type - users only see approved reports
  const reports = isAdmin ? allReports : allReports.filter(r => r.status === 'approved');

  useEffect(() => {
    // Initialize socket connection
    const WS_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api').replace('/api', '');
    const newSocket = io(WS_URL, { transports: ['websocket'] });
    
    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('new-report', (report) => {
      setAllReports(prev => [report, ...prev]);
      if (isAdmin) {
        toast.success('New health report received!');
      }
    });

    newSocket.on('report-updated', (updatedReport) => {
      setAllReports(prev => prev.map(r => r._id === updatedReport._id ? updatedReport : r));
      if (isAdmin) {
        toast.success(`Report ${updatedReport.status === 'approved' ? 'approved' : 'rejected'} successfully!`);
      }
    });

    newSocket.on('new-alert', (alert) => {
      setAlerts(prev => [alert, ...prev]);
      toast.success('New health alert detected!');
    });

    setSocket(newSocket);

    // Fetch initial data
    fetchData();

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const reportsRes = await getReports();
      setAllReports(Array.isArray(reportsRes) ? reportsRes : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setAllReports([]);
    } finally {
      setLoading(false);
    }
  };

  const addReport = async (reportData) => {
    try {
      const newReport = await createReport(reportData);
      setAllReports(prev => [newReport, ...prev]);
      return newReport;
    } catch (error) {
      console.error('Error adding report:', error);
      throw error;
    }
  };

  const updateReport = async (reportId, updates) => {
    try {
      const response = await api.patch(`/reports/${reportId}`, updates);
      const updatedReport = response.data;
      setAllReports(prev => prev.map(r => r._id === reportId ? updatedReport : r));
      
      // Emit socket event for real-time updates
      if (socket) {
        socket.emit('report-updated', updatedReport);
      }
      
      return updatedReport;
    } catch (error) {
      console.error('Error updating report:', error);
      throw error;
    }
  };

  const verifyReport = async (reportId, verified) => {
    try {
      const response = await api.patch(`/reports/${reportId}/verify`, { verified });
      const updatedReport = response.data;
      setAllReports(prev => prev.map(r => r._id === reportId ? updatedReport : r));
      
      // Emit socket event for real-time updates
      if (socket) {
        socket.emit('report-updated', updatedReport);
      }
      
      return updatedReport;
    } catch (error) {
      console.error('Error verifying report:', error);
      throw error;
    }
  };

  const deleteReport = async (reportId) => {
    try {
      await api.delete(`/reports/${reportId}`);
      setAllReports(prev => prev.filter(r => r._id !== reportId));
      toast.success('Report deleted successfully');
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  };

  const getReportsByStatus = (status) => {
    switch (status) {
      case 'pending':
        return allReports.filter(r => r.status === 'active');
      case 'accepted':
        return allReports.filter(r => r.status === 'approved');
      case 'rejected':
        return allReports.filter(r => r.status === 'rejected');
      default:
        return allReports;
    }
  };

  const getReportsByDiseaseType = (diseaseType) => {
    return allReports.filter(r => r.healthIssue === diseaseType);
  };

  const getReportsByLocation = (location) => {
    return allReports.filter(r => 
      r.state?.toLowerCase().includes(location.toLowerCase()) ||
      r.city?.toLowerCase().includes(location.toLowerCase()) ||
      r.area?.toLowerCase().includes(location.toLowerCase())
    );
  };

  // Set admin mode based on localStorage
  useEffect(() => {
    const userType = localStorage.getItem('userType');
    setIsAdmin(userType === 'admin');
  }, []);

  const value = {
    reports,
    allReports,
    alerts,
    loading,
    addReport,
    updateReport,
    verifyReport,
    deleteReport,
    getReportsByStatus,
    getReportsByDiseaseType,
    getReportsByLocation,
    refreshData: fetchData,
    loadReports: fetchData,
    approveReport: async (reportId) => {
      try {
        const updatedReport = await approveReport(reportId);
        setAllReports(prev => prev.map(report => 
          report._id === reportId ? updatedReport : report
        ));
        toast.success('Report approved successfully!');
      } catch (error) {
        console.error('Error approving report:', error);
        toast.error('Failed to approve report');
      }
    },
    rejectReport: async (reportId) => {
      try {
        const updatedReport = await rejectReport(reportId);
        setAllReports(prev => prev.map(report => 
          report._id === reportId ? updatedReport : report
        ));
        toast.success('Report rejected successfully!');
      } catch (error) {
        console.error('Error rejecting report:', error);
        toast.error('Failed to reject report');
      }
    },
    isAdmin,
    setAdminMode: setIsAdmin
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};