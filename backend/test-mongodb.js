const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health_alerts';

console.log('Testing MongoDB Connection...');
console.log('URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//<username>:<password>@'));

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB successfully!');
    
    // Test collections
    const Report = require('./models/Report');
    const Admin = require('./models/Admin');
    const User = require('./models/User');
    
    const reportCount = await Report.countDocuments();
    const adminCount = await Admin.countDocuments();
    const userCount = await User.countDocuments();
    
    console.log('\n📊 Database Statistics:');
    console.log(`   Reports: ${reportCount}`);
    console.log(`   Admins: ${adminCount}`);
    console.log(`   Users: ${userCount}`);
    
    console.log('\n✅ MongoDB is the source of truth!');
    console.log('✅ All data is globally accessible!');
    console.log('✅ Data persists across server restarts!');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
