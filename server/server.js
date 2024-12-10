require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('../routes/authRoutes');  // Pastikan jalur file ini benar
const patientRoutes = require('../routes/patientRoutes'); // Import routes pasien
const InputError = require('../exceptions/InputError'); // Untuk pengecualian khusus InputError

const app = express();
const PORT = 4001;

// Middleware CORS
app.use(cors({
    origin: '*', // Mengizinkan semua origin (bisa disesuaikan jika perlu keamanan tambahan)
}));

// Middleware untuk parsing JSON
app.use(express.json());

// Gunakan rute autentikasi
app.use('/routes', authRoutes);  // Gunakan '/routes' atau sesuaikan dengan jalur yang sesuai
app.use('/routes', patientRoutes);  // Endpoint pasien, misalnya /patients/{id}, /patients

// Middleware global untuk menangani error
app.use((err, req, res, next) => {
    console.error('Error caught by global handler:', err.message); // Log error untuk debugging

    // Penanganan error khusus
    if (err instanceof InputError) {
        return res.status(err.statusCode || 400).json({
            status: 'fail',
            message: `${err.message}. Silakan gunakan foto lain.`,
        });
    }

    // Jika content length melebihi batas yang ditentukan
    if (err.status === 413) {
        return res.status(413).json({
            status: 'fail',
            message: 'Payload content length greater than maximum allowed: 1000000',
        });
    }

    // Jika error berasal dari Boom.js
    if (err.isBoom) {
        return res.status(err.output.statusCode).json({
            status: 'fail',
            message: err.message || 'Error handled by Boom.js',
        });
    }

    // Untuk error umum
    console.error('Unhandled error:', err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Internal Server Error',
    });
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});

