import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import { api } from '../services/api';

const SmartAuthForm = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [emailExists, setEmailExists] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    userType: 'local',
    name: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailChecked, setEmailChecked] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const navigate = useNavigate();

  // Check email when user stops typing
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
        // Login
        const response = await api.login({
          email,
          password: formData.password,
          userType: formData.userType
        });
        
        if (response.success) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userType', response.user.userType);
          onSuccess(response.user.userType);
        } else {
          setError(response.error);
        }
      } else {
        // Signup
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        const response = await api.signup({
          email,
          password: formData.password,
          userType: formData.userType,
          name: formData.name
        });
        
        if (response.success) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userType', response.user.userType);
          onSuccess(response.user.userType);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <Heart className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-3xl font-bold text-gray-800">
            {emailChecked ? (isLogin ? 'Welcome Back!' : 'Create Account') : 'Get Started'}
          </h2>
          <p className="text-gray-600 mt-2">
            {emailChecked 
              ? (isLogin ? 'Login to your account' : 'Join our health community')
              : 'Enter your email to continue'
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
            <p className="font-medium mb-2">Temporary Password Generated:</p>
            <p className="bg-white px-3 py-2 rounded border font-mono text-sm">{tempPassword}</p>
            <p className="text-sm mt-2">Use this temporary password to login, then change it in your profile.</p>
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
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline w-4 h-4 mr-1" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              {/* User Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline w-4 h-4 mr-1" />
                  User Type
                </label>
                <select
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="local">Local User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Name Field (only for signup) */}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>
              )}

              {/* Password Field */}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              {/* Confirm Password (only for signup) */}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              )}

              {/* Forgot Password Link (only for login) */}
              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={forgotPasswordLoading || !email}
                    className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                  >
                    {forgotPasswordLoading ? 'Generating...' : 'Forgot Password?'}
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {loading 
                  ? (isLogin ? 'Logging in...' : 'Creating Account...') 
                  : (isLogin ? 'Login' : 'Create Account')
                }
              </button>
            </>
          )}
        </form>

        <div className="mt-6 text-center">
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

export default SmartAuthForm;