require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('../routes/authRoutes');
const patientRoutes = require('../routes/patientRoutes');
const InputError = require('../exceptions/InputError'); // Untuk pengecualian khusus InputError

const app = express();

// Middleware CORS
app.use(cors({
    origin: '*', // Mengizinkan semua origin (bisa disesuaikan jika perlu keamanan tambahan)
}));

// Middleware untuk parsing JSON
app.use(express.json());

// Rute untuk autentikasi
if (authRoutes) {
    app.use('/auth', authRoutes);
} else {
    console.warn('Auth routes module not found or invalid.');
}

// Rute untuk pasien
if (patientRoutes) {
    app.use('/patients', patientRoutes);
} else {
    console.warn('Patient routes module not found or invalid.');
}

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
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
