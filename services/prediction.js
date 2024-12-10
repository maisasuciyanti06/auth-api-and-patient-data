const path = require('path'); // Untuk mengambil ekstensi file
const tf = require('@tensorflow/tfjs-node');
const InputError = require('../exceptions/InputError');
const { Storage } = require('@google-cloud/storage');
const queryDatabase = require('../config/db'); // Pastikan queryDatabase berisi konfigurasi koneksi ke MySQL

// Fungsi untuk menyimpan prediksi ke MySQL
async function savePrediction(patientId, xray_image_url, accuracy, classification) {
  const query = 'INSERT INTO patients (patient_id, xray_image_url, accuracy, classification) VALUES (?, ?, ?, ?)';

  try {
    // Eksekusi query dan tunggu hasilnya menggunakan promise
    const [results] = await queryDatabase.execute(query, [patientId, xray_image_url, accuracy, classification]);
    console.log('Prediction saved:', results);
  } catch (err) {
    console.error('Error inserting data:', err);
  }
}

// Fungsi prediksi klasifikasi
async function predictClassification(model, image, patientId) {
  try {
    // Memproses input gambar menjadi tensor
    const tensor = tf.node
      .decodeJpeg(image)
      .resizeNearestNeighbor([150, 150]) // Sesuaikan dengan dimensi model Anda
      .expandDims()
      .toFloat();

    // Prediksi menggunakan model
    const prediction = model.predict(tensor);
    const scores = await prediction.array(); // Mendapatkan array skor prediksi

    // Definisi kelas tumor
    const tumorClasses = [
      "Meningioma",  // Tumor jenis 1
      "Glioma",      // Tumor jenis 2
      "Pituitary",   // Tumor jenis 3
      "Notumor"      // Non-tumor
    ];

    // Menentukan label dengan skor tertinggi
    const maxScoreIndex = scores[0].indexOf(Math.max(...scores[0])); // Mengambil indeks dengan skor tertinggi
    const label = tumorClasses[maxScoreIndex];
    const accuracy = (scores[0][maxScoreIndex] * 100).toFixed(2); // Akurasi dengan 2 desimal

    // Menyusun saran berdasarkan label
    const suggestion = label === "Notumor"
      ? "Tidak ada tumor terdeteksi."
      : `Jenis tumor terdeteksi: ${label}. Segera lakukan pemeriksaan lanjut.`;

    // Mengunggah gambar ke Cloud Storage dan mendapatkan URL-nya
    const imageUrl = await uploadImageToCloud(image);

    // Menyimpan hasil prediksi ke dalam database MySQL
    await savePrediction(patientId, imageUrl, accuracy, label);

    // Mengembalikan hasil prediksi dan saran
    return { label, accuracy, suggestion };
  } catch (error) {
    console.error("Error during prediction:", error.message);
    if (error.message.includes('Payload content length greater than maximum allowed')) {
      return {
        status: 'fail',
        message: 'Payload content length greater than maximum allowed: 1000000',
        code: 413
      };
    }
    throw new InputError("Terjadi kesalahan dalam melakukan prediksi", 400);
  }
}

module.exports = predictClassification;
