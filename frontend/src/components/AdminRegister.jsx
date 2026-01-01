import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">Admin Registration</h1>
          <p className="text-gray-300">Healthcare Authority Access</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-orange-400"
                placeholder="Full Name"
                autoComplete="name"
                required
              />
              {errors.name && <p className="text-red-300 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-orange-400"
                placeholder="Official Email"
                autoComplete="username"
                required
              />
              {errors.email && <p className="text-red-300 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-orange-400"
                placeholder="Organization/Hospital"
                autoComplete="organization"
                required
              />
              {errors.organization && <p className="text-red-300 text-sm mt-1">{errors.organization}</p>}
            </div>

            <div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-orange-400"
                placeholder="Password"
                autoComplete="new-password"
                required
              />
              {errors.password && <p className="text-red-300 text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-orange-400"
                placeholder="Confirm Password"
                autoComplete="new-password"
                required
              />
              {errors.confirmPassword && <p className="text-red-300 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            <div>
              <input
                type="text"
                name="authCode"
                value={formData.authCode}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-orange-400"
                placeholder="Authorization Code"
                autoComplete="off"
                required
              />
              {errors.authCode && <p className="text-red-300 text-sm mt-1">{errors.authCode}</p>}
              <p className="text-xs text-gray-400 mt-1">Contact system administrator for authorization code</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 disabled:opacity-50"
            >
              {isLoading ? 'Registering...' : 'Register as Admin'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Already have admin access?{' '}
              <Link to="/admin/login" className="text-blue-300 hover:text-blue-100 font-medium">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}