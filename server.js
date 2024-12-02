const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');  // Pastikan jalur file ini benar
const patientRoutes = require('./routes/patientRoutes'); // Import routes pasien
const moment = require('moment-timezone');

dotenv.config();

const app = express();

// Fungsi untuk mengonversi waktu ke WIB
const convertToWIB = (date) => {
  return moment(date).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
};

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Gunakan rute autentikasi
app.use('/routes', authRoutes);  // Gunakan '/routes' atau sesuaikan dengan jalur yang sesuai
app.use('/routes', patientRoutes);  // Endpoint pasien, misalnya /patients/{id}, /patients

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
