const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'https://lokerdigital.vercel.app',
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

const dataFolder = path.join(__dirname, 'data');
const dataPath = path.join(dataFolder, 'pelamar.json');

// Pastikan folder data ada
if (!fs.existsSync(dataFolder)) {
  fs.mkdirSync(dataFolder);
}

app.use('/data', express.static(dataFolder));

app.post('/api/submit-loker', (req, res) => {
  try {
    const {
      namaLengkap, ttl, jenisKelamin, noHP, noDarurat,
      email, agama, pendidikan, alamat
    } = req.body;

    if (!namaLengkap || !ttl || !jenisKelamin || !noHP || !noDarurat ||
        !email || !agama || !pendidikan || !alamat) {
      return res.status(400).json({ message: 'Data tidak lengkap!' });
    }

    let pelamarList = [];

    try {
      if (fs.existsSync(dataPath)) {
        const raw = fs.readFileSync(dataPath);
        pelamarList = JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Gagal parse JSON, pakai array kosong.');
      pelamarList = [];
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
      tanggalDaftar: new Date()
    });

    fs.writeFileSync(dataPath, JSON.stringify(pelamarList, null, 2));

    res.json({ message: 'Data berhasil disimpan!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error!' });
  }
});

app.listen(PORT, () => {
  console.log(`Server nyala di http://localhost:${PORT}`);
});
