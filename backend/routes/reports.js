const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const severityAnalyzer = require('../utils/severityAnalyzer');
const emergencyProtocols = require('../utils/emergencyProtocols');
const upload = require('../middleware/upload');
const { auth } = require('../middleware/auth');
const { detectFakeReport } = require('../services/openaiService');

// GET all reports
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET verified reports only
router.get('/verified', async (req, res) => {
  try {
    const reports = await Report.find({ verified: true }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new report with image upload
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    // Automatic severity analysis (stored separately)
    const severityAnalysis = severityAnalyzer.analyzeSeverity(req.body);
    
    // OpenAI Fake Report Detection (runs in background)
    let fakeDetection = null;
    try {
      const detectionResult = await detectFakeReport(req.body);
      fakeDetection = detectionResult.analysis;
      console.log('Fake Detection Result:', fakeDetection);
    } catch (error) {
      console.error('Fake detection failed, continuing without it:', error.message);
    }
    
    // Process uploaded images
    const images = req.files ? req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      caption: req.body.caption || ''
    })) : [];
    
    const reportData = {
      ...req.body,
      // Use user's severity if provided, otherwise use auto-analyzed severity
      severity: req.body.severity || severityAnalysis.severity,
      autoSeverity: severityAnalysis,
      fakeDetection: fakeDetection, // Add AI fake detection results
      images: images,
      reportedBy: null
    };
    
    const report = new Report(reportData);
    const savedReport = await report.save();
    
    // Check for emergency protocols
    const emergencyTriggers = await emergencyProtocols.checkEmergencyTrigger(reportData, Report);
    
    if (emergencyTriggers.length > 0) {
      const emergencyAlert = emergencyProtocols.generateEmergencyAlert(emergencyTriggers, reportData);
      
      // Update report with emergency alert
      savedReport.emergencyAlert = {
        triggered: true,
        priority: emergencyAlert.priority,
        notifiedAt: new Date(),
        actions: emergencyAlert.actions
      };
      await savedReport.save();
      
      // Notify authorities
      await emergencyProtocols.notifyAuthorities(emergencyAlert);
    }
    
    res.status(201).json(savedReport);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT approve report
router.put('/:id/approve', async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', verified: true },
      { new: true }
    );
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT reject report
router.put('/:id/reject', async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', verified: false },
      { new: true }
    );
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE report
router.delete('/:id', async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json({ message: 'Report deleted successfully', deletedReport: report });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;