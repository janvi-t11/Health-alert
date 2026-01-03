import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  MapPinIcon, 
  CameraIcon, 
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { createReport } from '../services/api';
import toast from 'react-hot-toast';
import { useData } from '../context/DataContext';
import { aiService } from '../services/aiService';

export default function ReportForm({ onSubmitted }) {
  const { addReport } = useData();
  const [diseaseType, setDiseaseType] = useState('Fever');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [healthIssue, setHealthIssue] = useState('');
  const [severity, setSeverity] = useState('');
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [pincode, setPincode] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchLocationFromPincode = async (pin) => {
    if (pin.length === 6) {
      setPincodeLoading(true);
      try {
        const pincodeData = {
          // Mumbai
          '400001': { state: 'Maharashtra', city: 'Mumbai', area: 'Fort' },
          '400058': { state: 'Maharashtra', city: 'Mumbai', area: 'Andheri West' },
          '400050': { state: 'Maharashtra', city: 'Mumbai', area: 'Bandra West' },
          '400070': { state: 'Maharashtra', city: 'Mumbai', area: 'Andheri East' },
          '400005': { state: 'Maharashtra', city: 'Mumbai', area: 'Colaba' },
          // Delhi
          '110001': { state: 'Delhi', city: 'New Delhi', area: 'Connaught Place' },
          '110016': { state: 'Delhi', city: 'New Delhi', area: 'Lajpat Nagar' },
          '110019': { state: 'Delhi', city: 'New Delhi', area: 'Kalkaji' },
          '110025': { state: 'Delhi', city: 'New Delhi', area: 'Karol Bagh' },
          // Bangalore
          '560001': { state: 'Karnataka', city: 'Bangalore', area: 'Bangalore City' },
          '560034': { state: 'Karnataka', city: 'Bangalore', area: 'Koramangala' },
          '560066': { state: 'Karnataka', city: 'Bangalore', area: 'Whitefield' },
          '560103': { state: 'Karnataka', city: 'Bangalore', area: 'Marathahalli' },
          // Chennai
          '600001': { state: 'Tamil Nadu', city: 'Chennai', area: 'Chennai Central' },
          '600028': { state: 'Tamil Nadu', city: 'Chennai', area: 'T Nagar' },
          '600041': { state: 'Tamil Nadu', city: 'Chennai', area: 'Adyar' },
          // Kolkata
          '700001': { state: 'West Bengal', city: 'Kolkata', area: 'Kolkata Central' },
          '700019': { state: 'West Bengal', city: 'Kolkata', area: 'Salt Lake' },
          // Pune
          '411001': { state: 'Maharashtra', city: 'Pune', area: 'Pune City' },
          '411038': { state: 'Maharashtra', city: 'Pune', area: 'Koregaon Park' },
          // Hyderabad
          '500001': { state: 'Telangana', city: 'Hyderabad', area: 'Hyderabad Central' },
          '500081': { state: 'Telangana', city: 'Hyderabad', area: 'Gachibowli' },
          // Ahmedabad
          '380001': { state: 'Gujarat', city: 'Ahmedabad', area: 'Ahmedabad City' },
          '380015': { state: 'Gujarat', city: 'Ahmedabad', area: 'Satellite' },
          // Jaipur
          '302001': { state: 'Rajasthan', city: 'Jaipur', area: 'Jaipur City' },
          '302017': { state: 'Rajasthan', city: 'Jaipur', area: 'Malviya Nagar' },
          // Lucknow
          '226001': { state: 'Uttar Pradesh', city: 'Lucknow', area: 'Lucknow City' },
          '226010': { state: 'Uttar Pradesh', city: 'Lucknow', area: 'Gomti Nagar' },
          // Kochi
          '682001': { state: 'Kerala', city: 'Kochi', area: 'Ernakulam' },
          '682025': { state: 'Kerala', city: 'Kochi', area: 'Kakkanad' }
        };
        
        const locationData = pincodeData[pin];
        if (locationData) {
          setState(locationData.state);
          setCity(locationData.city);
          setArea(locationData.area);
          toast.success('Location details filled automatically!');
        } else {
          toast.error('Pincode not found. Please fill location manually.');
        }
      } catch (error) {
        toast.error('Failed to fetch location details.');
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  const handlePincodeChange = (e) => {
    const pin = e.target.value;
    setPincode(pin);
    if (pin.length === 6) {
      fetchLocationFromPincode(pin);
    }
  };
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const diseaseTypes = [
    // Diseases
    { value: 'Fever', label: 'Fever', icon: '🌡️' },
    { value: 'Dengue', label: 'Dengue', icon: '🩸' },
    { value: 'Malaria', label: 'Malaria', icon: '🦟' },
    { value: 'Chikungunya', label: 'Chikungunya', icon: '🦠' },
    { value: 'Typhoid', label: 'Typhoid', icon: '🤒' },
    { value: 'Cholera', label: 'Cholera', icon: '💧' },
    { value: 'Hepatitis', label: 'Hepatitis', icon: '🟡' },
    { value: 'Diarrhea', label: 'Diarrhea', icon: '🚽' },
    { value: 'COVID-19', label: 'COVID-19', icon: '😷' },
    { value: 'Tuberculosis', label: 'Tuberculosis', icon: '🫁' },
    { value: 'Skin Infection', label: 'Skin Infection', icon: '🩹' },
    { value: 'Eye Infection', label: 'Eye Infection', icon: '👁️' },
    // Food Safety
    { value: 'Food Poisoning', label: 'Food Poisoning', icon: '🤢' },
    { value: 'Contaminated Food', label: 'Contaminated Food', icon: '🍖' },
    { value: 'Expired Food Sale', label: 'Expired Food Sale', icon: '📅' },
    { value: 'Unhygienic Food Prep', label: 'Unhygienic Food Prep', icon: '🧽' },
    // Environmental Issues
    { value: 'Polluted Water', label: 'Polluted Water', icon: '💧' },
    { value: 'Air Pollution', label: 'Air Pollution', icon: '🌫️' },
    { value: 'Waste on Streets', label: 'Waste on Streets', icon: '🗑️' },
    { value: 'Polluted River', label: 'Polluted River', icon: '🏞️' },
    { value: 'Sewage Overflow', label: 'Sewage Overflow', icon: '🚰' },
    { value: 'Industrial Pollution', label: 'Industrial Pollution', icon: '🏭' },
    { value: 'Stagnant Water', label: 'Stagnant Water', icon: '🪣' },
    { value: 'Garbage Dump', label: 'Garbage Dump', icon: '🏚️' },
    { value: 'Other', label: 'Other', icon: '⚠️' }
  ];

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo size must be less than 5MB');
        return;
      }
      setPhoto(file);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const reportData = {
        diseaseType,
        healthIssue: healthIssue || diseaseType,
        severity,
        country,
        state,
        city,
        area,
        pincode,
        description
      };
      
      console.log('Submitting report data:', reportData);
      
      // Submit report without AI (temporarily disabled due to quota)
      const newReport = await addReport(reportData);
      
      console.log('Report created:', newReport);
      
      setSuccess('Report submitted successfully!');
      setHealthIssue('');
      setSeverity('');
      setState('');
      setCity('');
      setArea('');
      setPincode('');
      setDescription('');
      setPhoto(null);
      onSubmitted?.(newReport);
      
      toast.success('Report submitted successfully!');
      
      // Reset form after successful submission
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError('Failed to submit report');
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link 
            to="/dashboard" 
            className="inline-flex items-center text-primary-600 hover:text-primary-500 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Report Health Issue</h1>
          <p className="text-gray-600 mt-2">
            Help protect your community by reporting health concerns in your area.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Disease Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Type of Health Issue *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                {diseaseTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setDiseaseType(type.value)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      diseaseType === type.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="text-sm font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Health Issue */}
            <div>
              <label htmlFor="healthIssue" className="block text-sm font-medium text-gray-700 mb-2">
                Health Issue
              </label>
              <input
                type="text"
                id="healthIssue"
                value={healthIssue}
                onChange={(e) => setHealthIssue(e.target.value)}
                className="input-field"
                placeholder="Describe the health issue (optional)"
              />
            </div>

            {/* Severity */}
            <div>
              <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-2">
                Severity *
              </label>
              <select
                id="severity"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select severity</option>
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="input-field"
                placeholder="Provide additional details about the health issue (optional)"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo (Optional)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400 transition-colors">
                <div className="space-y-1 text-center">
                  <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="photo-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                    >
                      <span>Upload a photo</span>
                      <input
                        id="photo-upload"
                        name="photo-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handlePhotoChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  {photo && (
                    <p className="text-sm text-green-600 flex items-center justify-center">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      {photo.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <div className="space-y-3">
                <div>
                  <label htmlFor="pincode" className="block text-xs font-medium text-gray-700 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    id="pincode"
                    value={pincode}
                    onChange={handlePincodeChange}
                    className="input-field"
                    placeholder="Enter 6-digit pincode (e.g., 400058)"
                    maxLength={6}
                    autoComplete="postal-code"
                    required
                  />
                  {pincodeLoading && (
                    <p className="text-xs text-blue-600 mt-1">Fetching location details...</p>
                  )}
                </div>
                <div>
                  <label htmlFor="country" className="block text-xs font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    value={country}
                    className="input-field bg-gray-50"
                    placeholder="Auto-filled"
                    autoComplete="country"
                    readOnly
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-xs font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className={`input-field ${state ? 'bg-gray-50' : ''}`}
                    placeholder={state ? 'Auto-filled from pincode' : 'Will auto-fill from pincode'}
                    autoComplete="address-level1"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-xs font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={`input-field ${city ? 'bg-gray-50' : ''}`}
                    placeholder={city ? 'Auto-filled from pincode' : 'Will auto-fill from pincode'}
                    autoComplete="address-level2"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="area" className="block text-xs font-medium text-gray-700 mb-1">
                    Area
                  </label>
                  <input
                    type="text"
                    id="area"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className={`input-field ${area ? 'bg-gray-50' : ''}`}
                    placeholder={area ? 'Auto-filled from pincode' : 'Will auto-fill from pincode'}
                    autoComplete="address-line1"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              disabled={submitting || !severity || !country || !state || !city || !area || !pincode}
              type="submit"
              className="w-full btn-primary py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting Report...
                </div>
              ) : (
                'Submit Report'
              )}
            </button>

            {/* Messages */}
            {error && (
              <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            )}
            
            {success && (
              <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-green-700">{success}</span>
              </div>
            )}
          </form>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <h3 className="text-sm font-medium text-blue-900 mb-2">Why report health issues?</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Help authorities identify potential outbreaks early</li>
            <li>• Protect your community from health risks</li>
            <li>• Contribute to public health data and research</li>
            <li>• Enable faster response to health emergencies</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}