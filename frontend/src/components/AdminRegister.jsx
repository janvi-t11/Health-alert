import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

export default function AdminRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organization: '',
    authCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.organization.trim()) newErrors.organization = 'Organization is required';
    if (!formData.authCode.trim()) newErrors.authCode = 'Authorization code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const response = await authAPI.adminRegister({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        organization: formData.organization,
        authCode: formData.authCode
      });
      
      if (response.success) {
        toast.success('Admin registration successful! Please login with your credentials.');
        navigate('/admin/login');
      } else {
        toast.error(response.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Admin registration error:', error);
      toast.error(error.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <ShieldCheckIcon className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Registration</h1>
          <p className="text-gray-600 mt-2">Healthcare Authority Access</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Full Name"
                autoComplete="name"
                required
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Official Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                className="input-field"
                placeholder="admin@healthalerts.com"
                autoComplete="username"
                required
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
                Organization/Hospital
              </label>
              <input
                type="text"
                name="organization"
                id="organization"
                value={formData.organization}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Organization/Hospital"
                autoComplete="organization"
                required
              />
              {errors.organization && <p className="text-red-600 text-sm mt-1">{errors.organization}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Create a strong password"
                autoComplete="new-password"
                required
              />
              {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Confirm your password"
                autoComplete="new-password"
                required
              />
              {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            <div>
              <label htmlFor="authCode" className="block text-sm font-medium text-gray-700 mb-2">
                Authorization Code
              </label>
              <input
                type="text"
                name="authCode"
                id="authCode"
                value={formData.authCode}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter authorization code"
                autoComplete="off"
                required
              />
              {errors.authCode && <p className="text-red-600 text-sm mt-1">{errors.authCode}</p>}
              <p className="text-xs text-gray-500 mt-1">Contact system administrator for authorization code</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Registering...' : 'Register as Admin'}
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mt-6 space-y-2"
        >
          <p className="text-gray-600">
            Already have admin access?{' '}
            <Link to="/admin/login" className="text-red-600 hover:text-red-500 font-medium">
              Login here
            </Link>
          </p>
          <p className="text-gray-600">
            Regular user?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-500 font-medium">
              Create user account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
