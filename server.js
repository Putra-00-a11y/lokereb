// server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Setup storage untuk multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Folder berbeda buat CV dan foto
    if (file.fieldname === 'cvUpload') cb(null, './uploads/cv/');
    else if (file.fieldname === 'fotoWajah') cb(null, './uploads/foto/');
    else cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueName + ext);
  }
});

const upload = multer({ storage: storage });

// Middleware buat parsing form data multipart (file + text)
const cpUpload = upload.fields([
  { name: 'cvUpload', maxCount: 1 },
  { name: 'fotoWajah', maxCount: 1 }
]);

app.post('/api/submit-loker', cpUpload, (req, res) => {
  try {
    const {
      namaLengkap, ttl, jenisKelamin, noHP, noDarurat,
      email, agama, pendidikan, alamat
    } = req.body;

    // File info ada di req.files
    const cvFile = req.files['cvUpload'] ? req.files['cvUpload'][0].filename : null;
    const fotoFile = req.files['fotoWajah'] ? req.files['fotoWajah'][0].filename : null;

    // Simple validation (optional)
    if (!namaLengkap || !ttl || !jenisKelamin || !noHP || !noDarurat || !email || !agama || !pendidikan || !alamat || !cvFile || !fotoFile) {
      return res.status(400).json({ message: 'Data tidak lengkap!' });
    }

    // Simpan data ke JSON (misal data pelamar.json)
    const dataPath = './data/pelamar.json';
    let pelamarList = [];
    if (fs.existsSync(dataPath)) {
      const raw = fs.readFileSync(dataPath);
      pelamarList = JSON.parse(raw);
    }

    pelamarList.push({
      namaLengkap,
      ttl,
      jenisKelamin,
      noHP,
      noDarurat,
      email,
      agama,
      pendidikan,
      alamat,
      cvFile,
      fotoFile,
      tanggalDaftar: new Date()
    });

    fs.writeFileSync(dataPath, JSON.stringify(pelamarList, null, 2));

    res.json({ message: 'Data berhasil disimpan!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error!' });
  }
});

app.use('/uploads', express.static('uploads')); // biar file bisa diakses (optional)

app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});