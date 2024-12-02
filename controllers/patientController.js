const queryDatabase = require('../config/db'); // Mengimpor koneksi database
const moment = require('moment-timezone');

// Fungsi untuk mengonversi waktu ke WIB
const convertToWIB = (date) => {
  return moment(date).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
};

// Menyimpan data pasien
const savePatientData = async (name, age, gender, address, phone_number) => {
  try {
    // Validasi untuk memastikan semua data wajib diisi
    if (!name || !age || !gender || !address || !phone_number) {
      throw new Error('All fields are required');
    }

    // Validasi tipe data (opsional, untuk memastikan input sesuai format yang diharapkan)
    if (typeof name !== 'string' || name.trim() === '') {
      throw new Error('Name must be a non-empty string');
    }
    if (typeof age !== 'number' || age <= 0) {
      throw new Error('Age must be a positive number');
    }
    if (!['male', 'female', 'other'].includes(gender.toLowerCase())) {
      throw new Error("Gender must be one of 'male', 'female', or 'other'");
    }  
    if (typeof address !== 'string' || address.trim() === '') {
      throw new Error('Address must be a non-empty string');
    }
    if (typeof phone_number !== 'string' || phone_number.trim() === '') {
      throw new Error('Phone number must be a non-empty string');
    }

    // Query untuk menyimpan data ke database menggunakan Promise
    const result = await queryDatabase(
      'INSERT INTO patients (name, age, gender, address, phone_number) VALUES (?, ?, ?, ?, ?)',
      [name, age, gender, address, phone_number]
    );

    return {
      message: 'Patient data successfully saved',
      patientId: result.insertId,
    };
  } catch (error) {
    throw new Error('Failed to save patient data: ' + error.message);
  }
};

// Fungsi untuk mengambil semua data pasien
const getAllPatients = async () => {
  try {
    const rows = await queryDatabase('SELECT * FROM patients');
    return rows; // Mengembalikan semua data pasien
  } catch (error) {
    throw new Error('Failed to retrieve all patient data: ' + error.message);
  }
};

// Mencari data pasien berdasarkan ID atau Nama
const getPatient = async (id = null, name = null) => {
  try {
    // Validasi awal: Salah satu parameter harus diisi
    if (!id && !name) {
      throw new Error('Enter patient ID or name to perform a search.');
    }

    let query = 'SELECT * FROM patients WHERE ';
    const params = [];

    // Tambahkan kondisi berdasarkan parameter yang diberikan
    if (id) {
      query += 'id = ?';
      params.push(id);
    } else if (name) {
      query += 'name = ?';
      params.push(name);
    }

    // Eksekusi query
    const rows = await queryDatabase(query, params);

    // Validasi hasil query
    if (rows.length === 0) {
      if (id) {
        throw new Error(`Patient with ID ${id} not found.`);
      } else {
        throw new Error(`Patient with name "${name}" not found.`);
      }
    }

    return rows[0]; // Mengembalikan data pasien pertama yang ditemukan
  } catch (error) {
    throw new Error('Failed to retrieve patient data: ' + error.message);
  }
};

// Update data
const updatePatientData = async (name, age, gender, address, phone_number) => {
  try {
    // Menjalankan query untuk memperbarui data pasien berdasarkan nama
    const result = await queryDatabase(
      'UPDATE patients SET name = ?, age = ?, gender = ?, address = ?, phone_number = ? WHERE name = ?',
      [name, age, gender, address, phone_number, name] // Menyertakan nama sebagai parameter pencarian
    );

    // Periksa apakah pembaruan berhasil
    if (result.affectedRows === 0) {
      return { message: 'Patient data failed to update. Make sure the name is valid and there are changes.' };
    }

    return { message: 'Patient data successfully updated' };

  } catch (error) {
    throw new Error('Failed to update patient data: ' + error.message);
  }
};

// Fungsi untuk menghapus data pasien
const deletePatientData = async (name) => {
  try {
    // Menghapus data pasien berdasarkan ID
    const result = await queryDatabase('DELETE FROM patients WHERE name = ?', [name]);

    // Periksa apakah penghapusan berhasil
    if (result.affectedRows === 0) {
      return { message: 'Patient data failed to delete. Ensure that the ID is valid.' };
    }

    return { message: 'Patient data successfully deleted' };
  } catch (error) {
    throw new Error('Failed to delete patient data: ' + error.message);
  }
};

module.exports = {
  savePatientData,
  getPatient,
  updatePatientData,
  deletePatientData,
  getAllPatients
};
