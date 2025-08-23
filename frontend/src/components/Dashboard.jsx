import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HeartIcon, 
  MapPinIcon, 
  ChartBarIcon, 
  BellAlertIcon,
  PlusIcon,
  UserIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { api } from '../api';
import toast from 'react-hot-toast';
import LocationAlert from './LocationAlert';
import { useData } from '../context/DataContext';

export default function Dashboard() {
  const { reports, loading } = useData();
  const navigate = useNavigate();

  const stats = {
    totalReports: reports.length,
    activeAlerts: 0, // Mock value
    todayReports: reports.filter(r => {
      const today = new Date().toISOString().split('T')[0];
      return r.createdAt.startsWith(today);
    }).length,
    verifiedReports: reports.filter(r => r.verified).length
  };

  const recentReports = reports.slice(0, 5);

  const handleLogout = () => {
    toast.success('Logged out successfully');
    navigate('/');
  };

  const statCards = [
    {
      title: 'Total Reports',
      value: stats.totalReports,
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
      change: '+12% from last week'
    },
    {
      title: 'Active Alerts',
      value: stats.activeAlerts,
      icon: BellAlertIcon,
      color: 'bg-red-500',
      change: '3 new alerts today'
    },
    {
      title: 'Today\'s Reports',
      value: stats.todayReports,
      icon: ChartBarIcon,
      color: 'bg-green-500',
      change: '+5 from yesterday'
    },
    {
      title: 'Verified Reports',
      value: stats.verifiedReports,
      icon: HeartIcon,
      color: 'bg-purple-500',
      change: '85% verification rate'
    }
  ];

  const quickActions = [
    {
      title: 'Report Issue',
      description: 'Submit a new health report',
      icon: PlusIcon,
      color: 'bg-primary-600',
      link: '/report'
    },
    {
      title: 'View Map',
      description: 'See all reports on the map',
      icon: MapPinIcon,
      color: 'bg-green-600',
      link: '/map'
    },
    {
      title: 'View Trends',
      description: 'Analyze health data trends',
      icon: ChartBarIcon,
      color: 'bg-blue-600',
      link: '/trends'
    }
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
      <LocationAlert />
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <HeartIcon className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">HealthAlerts Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, User!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <BellAlertIcon className="h-6 w-6" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <CogIcon className="h-6 w-6" />
              </button>
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
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="card"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className="group p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${action.color} group-hover:scale-110 transition-transform`}>
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-3">
                        <h3 className="font-medium text-gray-900 group-hover:text-primary-600">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-500">{action.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Recent Reports */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="card"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Reports</h2>
              <div className="space-y-4">
                {recentReports.length > 0 ? (
                  recentReports.map((report, index) => {
                    const isRecent = new Date() - new Date(report.createdAt) < 24 * 60 * 60 * 1000;
                    return (
                    <div key={index} className={`flex items-start space-x-3 ${isRecent ? 'bg-blue-50 p-3 rounded-lg border border-blue-200' : ''}`}>
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <DocumentTextIcon className="h-4 w-4 text-primary-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {report.diseaseType}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                        {report.description && (
                          <p className="text-xs text-gray-600 mt-1 truncate">
                            {report.description}
                          </p>
                        )}
                        {isRecent && (
                          <div className="text-xs text-blue-600 font-medium mt-1">• Just reported</div>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {report.verified ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                    <h4 className="text-sm font-medium text-gray-900 mb-2">No Recent Reports</h4>
                    <p className="text-xs text-gray-500 mb-1">
                      No verified reports available yet.
                    </p>
                    <p className="text-xs text-gray-400">
                      Reports appear here after admin verification.
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-6">
                <Link
                  to="/reports"
                  className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                >
                  View all reports →
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}