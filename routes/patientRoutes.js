const express = require('express');
const router = express.Router();
const {
  savePatientData,
  getPatient,
  updatePatientData,
  deletePatientData,
  getAllPatients
} = require('../controllers/patientController'); // Sesuaikan dengan path controller Anda

// Menyimpan data pasien
router.post('/patients', async (req, res) => {
  const { name, age, gender, address, phone_number } = req.body;
  try {
    const result = await savePatientData(name, age, gender, address, phone_number);
    res.status(201).json(result); // Status 201 untuk resource yang baru dibuat
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mengambil data pasien berdasarkan ID atau Nama
router.get('/patients', async (req, res) => {
  const { id, name } = req.query;
  try {
    const result = await getPatient(id, name);
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Mengambil semua data pasien
router.get('/patients/all', async (req, res) => {
  try {
    const result = await getAllPatients();
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Memperbarui data pasien berdasarkan nama
router.put('/patients/:name', async (req, res) => {
  const { name } = req.params; // Mengambil nama dari parameter URL
  const { age, gender, address, phone_number } = req.body; // Mengambil data pembaruan dari body request
  try {
    // Memanggil fungsi updatePatientData untuk memperbarui data berdasarkan nama
    const result = await updatePatientData(name, age, gender, address, phone_number);
    res.status(200).json(result); // Mengirimkan respons sukses jika pembaruan berhasil
  } catch (error) {
    res.status(400).json({ message: error.message }); // Mengirimkan error jika terjadi kegagalan
  }
});


// Menghapus data pasien
router.delete('/patients/:name', async (req, res) => {
  const { name } = req.params;
  try {
    const result = await deletePatientData(name);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
