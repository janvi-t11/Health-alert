import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { DataProvider } from './context/DataContext'
import LandingPage from './components/LandingPage'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import AdminLoginPage from './components/AdminLoginPage'
import AdminRegister from './components/AdminRegister'
import ReportsPage from './components/ReportsPage'
import AlertsPage from './components/AlertsPage'
import AdminDashboard from './components/AdminDashboard'
import Dashboard from './components/Dashboard'
import MapView from './components/MapView'
import ReportForm from './components/ReportForm'
import TrendsChart from './components/TrendsChart'
import SpriteMCPTest from './components/SpriteMCPTest'

function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <div className="App">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/report" element={<ReportForm />} />
          <Route path="/report/:id" element={<ReportForm />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/trends" element={<TrendsChart />} />
          <Route path="/sprite-mcp-test" element={<SpriteMCPTest />} />
        </Routes>
        </div>
      </BrowserRouter>
    </DataProvider>
  )
}

export default App