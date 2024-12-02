const express = require('express');
const router = express.Router();

// Import controller untuk register, login, logout, resetPassword, dll.
const { 
  registerDoctorWithEmail,  
  loginDoctor, 
  logoutUser, 
  resetPassword 
} = require('../controllers/authControllers');

// Rute untuk register dengan email dan password
router.post('/register/email', registerDoctorWithEmail); 

// Rute untuk login menggunakan email atau username dan password
router.post('/login', loginDoctor);  

// Rute untuk logout
router.post('/logout', logoutUser);  

// Rute untuk reset password
router.post('/reset-password', resetPassword); 

module.exports = router;
