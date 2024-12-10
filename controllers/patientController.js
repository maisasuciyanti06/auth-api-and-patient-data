const { Storage } = require('@google-cloud/storage');
const queryDatabase = require('../config/db');
const predictClassification = require('../services/prediction');

// Inisialisasi Google Cloud Storage
const storage = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME; // Ganti dengan nama bucket Anda
const bucket = storage.bucket(bucketName);

// Helper function for validation
const validatePatientData = (data) => {
    const { id, name, age, gender } = data;
    if (!id || !name || !age || !gender) {
        throw new Error('Required fields missing');
    }
    if (typeof age !== 'number' || age <= 0) {
        throw new Error('Invalid age');
    }
};

// Save patient data
const savePatientData = async (req, res) => {
    try {
        validatePatientData(req.body);
        await queryDatabase('INSERT INTO patients SET ?', req.body);
        res.status(201).json({ message: 'Patient data saved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Update patient data
const updatePatientData = async (req, res) => {
    try {
        validatePatientData(req.body);
        await queryDatabase('UPDATE patients SET ? WHERE id = ?', [req.body, req.body.id]);
        res.status(200).json({ message: 'Patient data updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Upload patient's X-ray
const uploadPatientXray = async (req, res) => {
    try {
        const { id } = req.params;
        const file = req.file;

        if (!id || !file) {
            return res.status(400).json({ message: 'Patient ID and file are required' });
        }

        const blob = bucket.file(file.originalname);
        const blobStream = blob.createWriteStream({ resumable: false });

        blobStream.on('error', (err) => {
            console.error('Error uploading file:', err);
            res.status(500).json({ message: `Error uploading file: ${err.message}` });
        });

        blobStream.on('finish', async () => {
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            await queryDatabase('UPDATE patients SET xray_image_url = ? WHERE id = ?', [publicUrl, id]);
            res.status(200).json({ message: 'X-ray uploaded successfully', url: publicUrl });
        });

        blobStream.end(file.buffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Delete patient data
const deletePatientData = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Patient ID is required' });
        }

        const patient = await queryDatabase('SELECT xray_image_url FROM patients WHERE id = ?', [id]);
        if (patient[0]?.xray_image_url) {
            const fileName = patient[0].xray_image_url.split('/').pop();
            await bucket.file(fileName).delete();
        }

        await queryDatabase('DELETE FROM patients WHERE id = ?', [id]);
        res.status(200).json({ message: 'Patient data deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Get patient data
const getPatient = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Patient ID is required' });
        }

        const patient = await queryDatabase('SELECT * FROM patients WHERE id = ?', [id]);
        if (!patient || patient.length === 0) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        res.status(200).json({ patient: patient[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Invoke model for tumor detection
const invokeModelHandler = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Patient ID is required' });
        }

        const patient = await queryDatabase('SELECT xray_image_url FROM patients WHERE id = ?', [id]);
        if (!patient || patient.length === 0 || !patient[0].xray_image_url) {
            return res.status(404).json({ message: 'X-ray image not found for this patient' });
        }

        const results = await predictClassification(patient[0].xray_image_url);
        res.status(200).json({ results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    savePatientData,
    updatePatientData,
    uploadPatientXray,
    deletePatientData,
    getPatient,
    invokeModelHandler,
};
