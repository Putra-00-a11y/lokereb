const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'https://lokerdigital.vercel.app',
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json()); // parsing JSON body dari frontend
app.use('/data', express.static('data')); // biar file json bisa diakses kalau mau

app.post('/api/submit-loker', (req, res) => {
  try {
    const {
      namaLengkap, ttl, jenisKelamin, noHP, noDarurat,
      email, agama, pendidikan, alamat
    } = req.body;

    // Validasi data (wajib semua)
    if (!namaLengkap || !ttl || !jenisKelamin || !noHP || !noDarurat ||
        !email || !agama || !pendidikan || !alamat) {
      return res.status(400).json({ message: 'Data tidak lengkap!' });
    }

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
