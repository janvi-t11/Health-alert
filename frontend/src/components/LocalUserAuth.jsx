import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import { api } from '../services/api';

const LocalUserAuth = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [emailExists, setEmailExists] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailChecked, setEmailChecked] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changePasswordData, setChangePasswordData] = useState({ oldPassword: '', newPassword: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const checkEmail = async () => {
      if (email && email.includes('@')) {
        try {
          const response = await api.checkEmail(email);
          setEmailExists(response.exists);
          setIsLogin(response.exists);
          setEmailChecked(true);
        } catch (error) {
          console.error('Email check failed:', error);
        }
      } else {
        setEmailExists(null);
        setEmailChecked(false);
      }
    };

    const timer = setTimeout(checkEmail, 500);
    return () => clearTimeout(timer);
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const response = await api.login({
          email,
          password: formData.password,
          userType: 'local'
        });
        
        if (response.success) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userType', 'local');
          onSuccess('local');
        } else {
          setError(response.error);
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        const response = await api.signup({
          email,
          password: formData.password,
          userType: 'local',
          name: formData.name
        });
        
        if (response.success) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userType', 'local');
          onSuccess('local');
        } else {
          setError(response.error);
        }
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email first');
      return;
    }

    setForgotPasswordLoading(true);
    setError('');

    try {
      const response = await api.forgotPassword(email);
      if (response.success) {
        setTempPassword(response.tempPassword);
        setShowForgotPassword(true);
      } else {
        setError(response.error);
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!email || !changePasswordData.oldPassword || !changePasswordData.newPassword) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.changePassword(email, changePasswordData.oldPassword, changePasswordData.newPassword);
      if (response.success) {
        setShowChangePassword(false);
        setChangePasswordData({ oldPassword: '', newPassword: '' });
        alert('Password changed successfully!');
      } else {
        setError(response.error);
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="text-green-600" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Local User Access</h2>
          <p className="text-gray-600 mt-2">
            {emailChecked 
              ? (isLogin ? 'Welcome back!' : 'Join our community')
              : 'Report health issues in your area'
            }
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showForgotPassword && tempPassword && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            <p className="font-medium mb-2">Temporary Password:</p>
            <p className="bg-white px-3 py-2 rounded border font-mono text-sm">{tempPassword}</p>
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setFormData({ ...formData, password: tempPassword });
              }}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Use this password to login
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline w-4 h-4 mr-1" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your email"
              required
            />
            {emailChecked && (
              <p className={`text-sm mt-1 ${emailExists ? 'text-green-600' : 'text-blue-600'}`}>
                {emailExists ? '✓ Email found - Please login' : '✓ New email - Create account'}
              </p>
            )}
          </div>

          {emailChecked && (
            <>
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter your full name"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="inline w-4 h-4 mr-1" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder={isLogin ? 'Enter your password' : 'Create a password'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              )}

              {isLogin && (
                <div className="flex justify-between text-sm">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={forgotPasswordLoading || !email}
                    className="text-green-600 hover:text-green-700 disabled:text-gray-400"
                  >
                    {forgotPasswordLoading ? 'Generating...' : 'Forgot Password?'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowChangePassword(true)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Change Password
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
              >
                {loading 
                  ? (isLogin ? 'Logging in...' : 'Creating Account...') 
                  : (isLogin ? 'Login' : 'Create Account')
                }
              </button>
            </>
          )}
        </form>

        {/* Change Password Modal */}
        {showChangePassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Change Password</h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={changePasswordData.oldPassword}
                    onChange={(e) => setChangePasswordData({...changePasswordData, oldPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={changePasswordData.newPassword}
                    onChange={(e) => setChangePasswordData({...changePasswordData, newPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowChangePassword(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="mt-6 text-center space-y-2">
          <button
            onClick={() => navigate('/admin-auth')}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Admin Access →
          </button>
          <br />
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocalUserAuth;