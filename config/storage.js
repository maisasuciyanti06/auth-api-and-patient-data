const { Storage } = require('@google-cloud/storage');
require('dotenv').config(); 

// Setup Google Cloud Storage
const storage = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME;  
const bucket = storage.bucket(bucketName);

module.exports = { bucket };
