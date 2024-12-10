// routes.js
import express from 'express';
import { registerDoctorWithEmail, loginDoctor, logoutUser, resetPassword} from '../controllers/authControllers';
import { savePatientData, getPatient, updatePatientData, deletePatientData} from '../controllers/patientController';

const router = express.Router();

router.post('/register/email', registerDoctorWithEmail);  // Register dengan email/password
router.post('/login', loginDoctor);  // Login dengan email/username dan password
router.post('/reset-password', resetPassword);  // Reset password
router.post('/logout', logoutUser);  // Logout user


// Patient CRUD routes
router.post('/patients', savePatientData);
router.put('/patients/:id', updatePatientData);
router.post('/patients/:id/xray', upload.single('xray'), uploadPatientXray);
router.delete('/patients/:id', deletePatientData);
router.get('/patients/:id', getPatient);
router.get('/patients/:id/predict', invokeModelHandler);

export default router;
