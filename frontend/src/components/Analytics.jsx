import React, { useState } from 'react';
import { BarChart3, TrendingUp, MapPin, AlertCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const { getAnalytics, reports } = useData();
  const analyticsData = getAnalytics();
  const [selectedView, setSelectedView] = useState('zones');

  const getZoneLevel = (count) => {
    if (count >= 20) return { level: 'Red Zone', color: '#ef4444' };
    if (count >= 10) return { level: 'Orange Zone', color: '#f97316' };
    if (count >= 5) return { level: 'Black Zone', color: '#374151' };
    return { level: 'Green Zone', color: '#22c55e' };
  };

  const getZoneData = () => {
    const stateData = {};
    reports.forEach(report => {
      if (!stateData[report.state]) {
        stateData[report.state] = {};
      }
      if (!stateData[report.state][report.healthIssue]) {
        stateData[report.state][report.healthIssue] = 0;
      }
      stateData[report.state][report.healthIssue]++;
    });

    const chartData = [];
    const labels = [];
    const colors = [];

    Object.entries(stateData).forEach(([state, issues]) => {
      Object.entries(issues).forEach(([issue, count]) => {
        const zone = getZoneLevel(count);
        labels.push(`${state} - ${issue}`);
        chartData.push(count);
        colors.push(zone.color);
      });
    });

    return { labels, data: chartData, colors };
  };

  const zoneChartData = getZoneData();

  const barChartData = {
    labels: zoneChartData.labels,
    datasets: [
      {
        label: 'Cases by State & Issue',
        data: zoneChartData.data,
        backgroundColor: zoneChartData.colors,
        borderColor: zoneChartData.colors,
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Health Issues by State with Zone Classification',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const trendChartData = {
    labels: analyticsData.trendingIssues.map(item => item.issue),
    datasets: [
      {
        label: 'Number of Cases',
        data: analyticsData.trendingIssues.map(item => item.count),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        pointBackgroundColor: analyticsData.trendingIssues.map(item => {
          const zone = getZoneLevel(item.count);
          return zone.color;
        }),
        pointBorderColor: analyticsData.trendingIssues.map(item => {
          const zone = getZoneLevel(item.count);
          return zone.color;
        }),
        pointRadius: 8,
        pointHoverRadius: 10,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Health Issues Trend with Zone Indicators',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Health Analytics Dashboard</h2>
        <p className="text-gray-600">Real-time health data analysis across India</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalReports}</p>
            </div>
            <BarChart3 className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Areas</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.activeAreas}</p>
            </div>
            <MapPin className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Cases</p>
              <p className="text-2xl font-bold text-red-600">{analyticsData.criticalCases}</p>
            </div>
            <AlertCircle className="text-red-500" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved Cases</p>
              <p className="text-2xl font-bold text-green-600">{analyticsData.totalReports > 0 ? Math.floor(analyticsData.totalReports * 0.3) : 0}</p>
            </div>
            <TrendingUp className="text-green-500" size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trending Health Issues */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Trending Health Issues</h3>
          <div className="space-y-4">
            {analyticsData.trendingIssues.length > 0 ? (
              analyticsData.trendingIssues.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{item.issue}</p>
                    <p className="text-sm text-gray-600">{item.count} reports</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No data available. Submit reports to see trends.</p>
            )}
          </div>
        </div>

        {/* Location-wise Data */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Affected Locations</h3>
          <div className="space-y-4">
            {analyticsData.locationData.length > 0 ? (
              analyticsData.locationData.map((location, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <MapPin className="text-gray-400 mr-2" size={16} />
                    <div>
                      <p className="font-medium text-gray-800">{location.city}</p>
                      <p className="text-sm text-gray-600">{location.state}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{location.cases}</p>
                    <p className="text-xs text-gray-500">cases</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No data available. Submit reports to see locations.</p>
            )}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="mt-6 space-y-6">
        {/* Chart Type Selector */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex space-x-4">
            <button
              onClick={() => setSelectedView('zones')}
              className={`px-4 py-2 rounded-lg font-medium ${
                selectedView === 'zones'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Zone Analysis
            </button>
            <button
              onClick={() => setSelectedView('trends')}
              className={`px-4 py-2 rounded-lg font-medium ${
                selectedView === 'trends'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Trend Analysis
            </button>
          </div>
        </div>

        {/* Zone Legend */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Zone Classification</h4>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Red Zone (20+ cases)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Orange Zone (10-19 cases)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-600 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Black Zone (5-9 cases)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Green Zone (0-4 cases)</span>
            </div>
          </div>
        </div>

        {/* Chart Display */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          {selectedView === 'zones' ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">State-wise Health Issues with Zone Classification</h3>
              {zoneChartData.labels.length > 0 ? (
                <div className="h-96">
                  <Bar data={barChartData} options={barChartOptions} />
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="text-gray-400 mx-auto mb-2" size={48} />
                    <p className="text-gray-600">No data available</p>
                    <p className="text-sm text-gray-500">Submit health reports to see zone analysis</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Health Issues Trend Analysis</h3>
              {analyticsData.trendingIssues.length > 0 ? (
                <div className="h-96">
                  <Line data={trendChartData} options={lineChartOptions} />
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="text-gray-400 mx-auto mb-2" size={48} />
                    <p className="text-gray-600">No trend data available</p>
                    <p className="text-sm text-gray-500">Submit health reports to see trends</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;