// Import dependencies
const express = require('express');
const multer = require('multer');
const {
    savePatientData,
    updatePatientData,
    uploadPatientXray,
    deletePatientData,
    getPatient,
    invokeModelHandler,
} = require('../controllers/patientController');

// Set up router and file upload middleware
const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});

// Define routes

// Save new patient data
router.post('/patients', savePatientData);

// Update existing patient data
router.put('/patients/:id', updatePatientData);

// Upload X-ray for a patient
router.post('/patients/:id/xray', upload.single('xray'), uploadPatientXray);

// Delete a patient record
router.delete('/patients/:id', deletePatientData);

// Get a specific patient's data
router.get('/patients/:id', getPatient);

// Invoke model for tumor detection
router.get('/patients/:id/predict', invokeModelHandler);

module.exports = router;
