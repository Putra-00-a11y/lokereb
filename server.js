const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const dataPath = path.join(__dirname, 'data', 'pelamar.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle form-data (dari FormData di frontend)
const upload = multer();

// Endpoint POST: Simpan data ke JSON
app.post('/api/submit-loker', upload.none(), (req, res) => {
  const formData = req.body;

  // Baca data lama
  let data = [];
  if (fs.existsSync(dataPath)) {
    const fileData = fs.readFileSync(dataPath, 'utf-8');
    try {
      data = JSON.parse(fileData);
    } catch (err) {
      console.error('Error parsing JSON:', err);
    }
  }

  // Tambahkan data baru
  data.push({
    id: Date.now(),
    ...formData,
  });

  // Tulis ke file JSON
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');

  res.status(200).json({ message: 'Data berhasil disimpan!' });
});

// Endpoint GET: Tampilkan semua data
app.get('/pelamar', (req, res) => {
  if (!fs.existsSync(dataPath)) {
    return res.json([]);
  }

  const raw = fs.readFileSync(dataPath, 'utf-8');
  try {
    const data = JSON.parse(raw);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Gagal membaca data pelamar.' });
  }
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
