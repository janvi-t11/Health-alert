import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { api } from '../services/api';

const AdminAuth = ({ onSuccess }) => {
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
          userType: 'admin'
        });
        
        if (response.success) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userType', 'admin');
          onSuccess('admin');
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
          userType: 'admin',
          name: formData.name
        });
        
        if (response.success) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userType', 'admin');
          onSuccess('admin');
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
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-2xl p-8 max-w-md w-full border border-white/20">
        <div className="text-center mb-8">
          <div className="bg-red-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Shield className="text-red-300" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-white">Admin Portal</h2>
          <p className="text-gray-300 mt-2">
            {emailChecked 
              ? (isLogin ? 'Administrative Access' : 'Create Admin Account')
              : 'Secure administrative access'
            }
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-400/50 text-red-200 px-4 py-3 rounded mb-4 backdrop-blur-sm">
            {error}
          </div>
        )}

        {showForgotPassword && tempPassword && (
          <div className="bg-green-500/20 border border-green-400/50 text-green-200 px-4 py-3 rounded mb-4 backdrop-blur-sm">
            <p className="font-medium mb-2">Temporary Password:</p>
            <p className="bg-white/10 px-3 py-2 rounded border font-mono text-sm">{tempPassword}</p>
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setFormData({ ...formData, password: tempPassword });
              }}
              className="mt-2 text-blue-300 hover:text-blue-200 text-sm font-medium"
            >
              Use this password to login
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              <Mail className="inline w-4 h-4 mr-1" />
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 backdrop-blur-sm"
              placeholder="admin@healthalerts.com"
              required
            />
            {emailChecked && (
              <p className={`text-sm mt-1 ${emailExists ? 'text-green-300' : 'text-blue-300'}`}>
                {emailExists ? '✓ Admin email found - Please login' : '✓ New admin - Create account'}
              </p>
            )}
          </div>

          {emailChecked && (
            <>
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Admin Name (Optional)
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 backdrop-blur-sm"
                    placeholder="Enter admin name"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  <Lock className="inline w-4 h-4 mr-1" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 backdrop-blur-sm"
                    placeholder={isLogin ? 'Enter admin password' : 'Create secure password'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 backdrop-blur-sm"
                    placeholder="Confirm admin password"
                    required
                  />
                </div>
              )}

              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={forgotPasswordLoading || !email}
                    className="text-sm text-red-300 hover:text-red-200 disabled:text-gray-500"
                  >
                    {forgotPasswordLoading ? 'Generating...' : 'Forgot Password?'}
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-md hover:from-red-700 hover:to-red-800 disabled:opacity-50 font-medium transform hover:scale-105 transition-all duration-200"
              >
                {loading 
                  ? (isLogin ? 'Authenticating...' : 'Creating Admin...') 
                  : (isLogin ? 'Admin Login' : 'Create Admin Account')
                }
              </button>
            </>
          )}
        </form>

        <div className="mt-6 text-center space-y-2">
          <button
            onClick={() => navigate('/local-auth')}
            className="text-green-300 hover:text-green-200 font-medium"
          >
            ← Local User Access
          </button>
          <br />
          <button
            onClick={() => navigate('/')}
            className="text-gray-300 hover:text-white"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;