import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheckIcon, 
  DocumentTextIcon, 
  BellAlertIcon,
  ChartBarIcon,
  UserGroupIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useData } from '../context/DataContext';
import { sendHealthAlert, shouldTriggerAlert } from '../utils/smsService';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { allReports, loading, approveReport, rejectReport, deleteReport } = useData();
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAreaAlerts, setShowAreaAlerts] = useState(false);
  const navigate = useNavigate();

  const stats = {
    total: allReports.length,
    pending: allReports.filter(r => r.status === 'active').length,
    accepted: allReports.filter(r => r.status === 'approved').length,
    rejected: allReports.filter(r => r.status === 'rejected').length
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

  const handleApprove = async (reportId) => {
    try {
      await approveReport(reportId);
      toast.success('Report approved successfully!');
      
      const approvedReport = allReports.find(r => r._id === reportId);
      if (approvedReport && shouldTriggerAlert(allReports, approvedReport)) {
        const phoneNumbers = allReports
          .filter(r => r.status === 'approved' && r.area === approvedReport.area && r.city === approvedReport.city && r.phone)
          .map(r => r.phone);
        
        if (phoneNumbers.length > 0) {
          await sendHealthAlert(
            phoneNumbers,
            approvedReport.healthIssue,
            approvedReport.area,
            approvedReport.city,
            phoneNumbers.length
          );
        }
      }
      
      setShowModal(false);
      setSelectedReport(null);
    } catch (error) {
      toast.error('Failed to approve report');
    }
  };

  const handleReject = async (reportId) => {
    try {
      await rejectReport(reportId);
      toast.success('Report rejected successfully!');
      setShowModal(false);
      setSelectedReport(null);
    } catch (error) {
      toast.error('Failed to reject report');
    }
  };

  const handleDelete = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await deleteReport(reportId);
        toast.success('Report deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete report');
      }
    }
  };

  const handleAreaAlert = async (area, city) => {
    const areaReports = allReports.filter(r => 
      r.status === 'approved' && 
      r.area === area && 
      r.city === city && 
      (r.phone || r.phoneNumber || r.mobile)
    );
    
    if (areaReports.length === 0) {
      toast.error('No users found in this area');
      return;
    }
    
    const phoneNumbers = areaReports.map(r => r.phone || r.phoneNumber || r.mobile);
    const healthIssues = [...new Set(areaReports.map(r => r.healthIssue || r.diseaseType))];
    
    console.log('Sending alert to phones:', phoneNumbers);
    console.log('Health issues:', healthIssues);
    
    try {
      await sendHealthAlert(
        phoneNumbers,
        healthIssues.join(', '),
        area,
        city,
        areaReports.length
      );
      toast.success(`Alert sent to ${phoneNumbers.length} users in ${area}`);
    } catch (error) {
      toast.error('Failed to send area alert');
    }
  };

  const getUniqueAreas = () => {
    const areas = new Map();
    allReports
      .filter(r => r.status === 'approved')
      .forEach(r => {
        const key = `${r.area}, ${r.city}`;
        if (!areas.has(key)) {
          areas.set(key, {
            area: r.area,
            city: r.city,
            count: 0,
            users: 0
          });
        }
        const areaData = areas.get(key);
        areaData.count++;
        // Check multiple possible phone field names
        if (r.phone || r.phoneNumber || r.mobile) {
          areaData.users++;
        }
      });
    
    // Debug log
    console.log('Area data:', Array.from(areas.values()));
    console.log('Sample report:', allReports[0]);
    
    return Array.from(areas.values());
  };

  const handleLogout = () => {
    toast.success('Logged out successfully');
    navigate('/');
  };

  const tabs = [
    { id: 'pending', label: 'Pending', icon: ClockIcon, count: stats.pending },
    { id: 'accepted', label: 'Accepted', icon: CheckCircleIcon, count: stats.accepted },
    { id: 'rejected', label: 'Rejected', icon: XCircleIcon, count: stats.rejected },
    { id: 'all', label: 'All Reports', icon: DocumentTextIcon, count: stats.total }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <ShieldCheckIcon className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Manage health reports and alerts</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAreaAlerts(!showAreaAlerts)}
                className="btn-secondary"
              >
                Area Alerts
              </button>
              <Link to="/map" className="btn-secondary">
                View Map
              </Link>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowRightOnRectangleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Area Alerts Panel */}
        {showAreaAlerts && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-6"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Send Area-Based Alerts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getUniqueAreas().map((areaData, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{areaData.area}</h4>
                      <p className="text-sm text-gray-500">{areaData.city}</p>
                    </div>
                    <button
                      onClick={() => handleAreaAlert(areaData.area, areaData.city)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                      disabled={areaData.users === 0}
                    >
                      Send Alert
                    </button>
                  </div>
                  <div className="text-xs text-gray-600">
                    <p>{areaData.count} reports • {areaData.users} users</p>
                  </div>
                </div>
              ))}
            </div>
            {getUniqueAreas().length === 0 && (
              <p className="text-gray-500 text-center py-4">No approved reports with user data found</p>
            )}
          </motion.div>
        )}
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {tabs.map((tab, index) => (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveTab(tab.id)}
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${
                  tab.id === 'pending' ? 'bg-yellow-500' :
                  tab.id === 'accepted' ? 'bg-green-500' :
                  tab.id === 'rejected' ? 'bg-red-500' : 'bg-blue-500'
                }`}>
                  <tab.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{tab.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{tab.count}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Reports List */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getReportsByStatus(activeTab).map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {report.diseaseType}
                        </div>
                        <div className="text-sm text-gray-500">
                          Issue Type: {report.diseaseType}
                        </div>
                        {(report.aiAnalysis || report.urgencyScore || report.riskCategory) && (
                          <div className="text-xs text-blue-600 mt-1">
                            AI Risk: {report.aiAnalysis?.riskCategory || report.riskCategory || 'general'} | 
                            Urgency: {report.aiAnalysis?.urgencyScore || report.urgencyScore || 5}/10
                          </div>
                        )}
                        {report.description && (
                          <div className="text-xs text-gray-400 mt-1">
                            {report.description.substring(0, 50)}...
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {report.area}, {report.city}
                      </div>
                      <div className="text-sm text-gray-500">
                        {report.state}, {report.pincode}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        report.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        report.severity === 'severe' ? 'bg-orange-100 text-orange-800' :
                        report.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {report.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setShowModal(true);
                          }}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {activeTab === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(report._id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleReject(report._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <XCircleIcon className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(report._id)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {getReportsByStatus(activeTab).length === 0 && (
              <div className="text-center py-8">
                <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                <p className="text-gray-500">There are no {activeTab} reports at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Detail Modal */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Report Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Disease Type:</label>
                  <p className="text-sm text-gray-900">{selectedReport.diseaseType || selectedReport.healthIssue}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Health Issue:</label>
                  <p className="text-sm text-gray-900">{selectedReport.healthIssue}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Severity:</label>
                  <p className="text-sm text-gray-900 capitalize">{selectedReport.severity}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Location:</label>
                  <p className="text-sm text-gray-900">
                    {selectedReport.area}, {selectedReport.city}<br />
                    {selectedReport.state}, {selectedReport.pincode}
                  </p>
                </div>
                {selectedReport.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Description:</label>
                    <p className="text-sm text-gray-900">{selectedReport.description}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700">Reported:</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedReport.createdAt).toLocaleString()}
                  </p>
                </div>
                {(selectedReport.aiAnalysis || selectedReport.urgencyScore || selectedReport.riskCategory) && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <label className="text-sm font-medium text-blue-900">AI Analysis:</label>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p>Risk Category: <span className="font-medium">{selectedReport.aiAnalysis?.riskCategory || selectedReport.riskCategory || 'general'}</span></p>
                      <p>Urgency Score: <span className="font-medium">{selectedReport.aiAnalysis?.urgencyScore || selectedReport.urgencyScore || 5}/10</span></p>
                      <p>Community Risk: <span className="font-medium">{selectedReport.aiAnalysis?.communityRisk || selectedReport.communityRisk || 'medium'}</span></p>
                      {(selectedReport.aiAnalysis?.recommendedActions || selectedReport.recommendedActions) && (
                        <div>
                          <p className="font-medium">Recommended Actions:</p>
                          <ul className="list-disc list-inside text-xs">
                            {(selectedReport.aiAnalysis?.recommendedActions || selectedReport.recommendedActions || ['Monitor symptoms', 'Consult healthcare provider']).map((action, idx) => (
                              <li key={idx}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
                {activeTab === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(selectedReport._id)}
                      className="btn-primary"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(selectedReport._id)}
                      className="btn-danger"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}