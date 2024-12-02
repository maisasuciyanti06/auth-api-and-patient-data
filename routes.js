// routes.js
import express from 'express';
import { registerDoctorWithEmail, loginDoctor, logoutUser, resetPassword} from '../controllers/authControllers';
import { savePatientData, getPatient, updatePatientData, deletePatientData, getAllPatients } from '../controllers/patientController';

const router = express.Router();

router.post('/register/email', registerDoctorWithEmail);  // Register dengan email/password
router.post('/login', loginDoctor);  // Login dengan email/username dan password
router.post('/reset-password', resetPassword);  // Reset password
router.post('/logout', logoutUser);  // Logout user



// Patient CRUD routes
router.post('/patients', savePatientData);  // Endpoint untuk menambah data pasien
router.get('/patients', getPatient); // Endpoint untuk mencari pasien berdasarkan ID atau nama
router.put('/patients/:id', updatePatientData); // Endpoint untuk mengedit data pasien
router.delete('/patients/:id', deletePatientData); // Endpoint untuk menghapus data pasien
router.get('/patients/all', getAllPatients);  // Endpoint untuk mengambil semua data pasien

export default router;
