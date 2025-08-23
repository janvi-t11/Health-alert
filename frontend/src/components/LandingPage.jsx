import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  MapPinIcon, 
  ChartBarIcon, 
  BellAlertIcon,
  ArrowRightIcon,
  UserGroupIcon,
  GlobeAltIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Real-time Monitoring',
      description: 'Track health issues as they happen with instant updates and alerts.'
    },
    {
      icon: MapPinIcon,
      title: 'Location-based Alerts',
      description: 'Get notified about health issues in your city and nearby areas based on reported cases.'
    },
    {
      icon: ChartBarIcon,
      title: 'Data Analytics',
      description: 'View trends and patterns to understand health risks in your community.'
    },
    {
      icon: BellAlertIcon,
      title: 'Early Warning System',
      description: 'Advanced algorithms detect potential outbreaks before they spread.'
    }
  ];



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <HeartIcon className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">HealthAlerts</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
              User Login
            </Link>
            <Link to="/admin/login" className="text-gray-600 hover:text-gray-900 transition-colors">
              Admin Portal
            </Link>
            <Link to="/register" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Protect Your
              <span className="text-primary-600"> Community</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Report health issues, track outbreaks, and stay informed about potential risks in your area. 
              Together, we can build healthier, safer communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary text-lg px-8 py-3">
                Report an Issue
                <ArrowRightIcon className="h-5 w-5 ml-2 inline" />
              </Link>
              <Link to="/map" className="btn-secondary text-lg px-8 py-3">
                View Map
              </Link>
            </div>
          </motion.div>
        </div>
      </section>



      {/* Features Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform makes it easy to report health issues and stay informed about potential risks in your community.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card text-center hover:shadow-lg transition-shadow"
              >
                <feature.icon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of citizens who are already protecting their communities. 
              Your report could save lives.
            </p>
            <Link to="/register" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors inline-flex items-center">
              Start Reporting Now
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>


    </div>
  );
}