const http = require('http');
const url = require('url');

let motivations = [
  {
    id: 1,
    nama: "Budi",
    asal: "Indonesia",
    tanggal: "2024-10-17",
    suka: 10,
    text_motivasi: "Jangan pernah menyerah!"
  }
]; // Data awal dengan satu motivasi

// Fungsi untuk merespons dengan JSON
const respondWithJSON = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

// Fungsi untuk menambah motivasi baru
const createMotivation = (req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    const { nama, asal, tanggal, text_motivasi } = JSON.parse(body);
    if (nama && asal && tanggal && text_motivasi) {
      const newMotivation = {
        id: motivations.length + 1,  // ID otomatis berdasarkan panjang array
        nama,
        asal,
        tanggal,
        suka: 0, // Default like dimulai dari 0
        text_motivasi
      };
      motivations.push(newMotivation);
      respondWithJSON(res, 201, newMotivation);
    } else {
      respondWithJSON(res, 400, { message: 'Data tidak lengkap!' });
    }
  });
};

// Fungsi untuk membaca seluruh motivasi
const readMotivations = (res) => {
  respondWithJSON(res, 200, motivations);
};

// Fungsi untuk melihat detail motivasi berdasarkan id
const readMotivationById = (res, id) => {
  const motivation = motivations.find(m => m.id === parseInt(id));
  if (motivation) {
    respondWithJSON(res, 200, motivation);
  } else {
    respondWithJSON(res, 404, { message: 'Motivasi tidak ditemukan!' });
  }
};

// Fungsi untuk menambah like pada motivasi
const addLike = (res, id) => {
  const motivation = motivations.find(m => m.id === parseInt(id));
  if (motivation) {
    motivation.suka += 1;
    respondWithJSON(res, 200, motivation);
  } else {
    respondWithJSON(res, 404, { message: 'Motivasi tidak ditemukan!' });
  }
};

// Fungsi untuk mengubah motivasi berdasarkan id
const updateMotivation = (req, res, id) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    const { nama, asal, tanggal, text_motivasi } = JSON.parse(body);
    const motivationIndex = motivations.findIndex(m => m.id === parseInt(id));
    if (motivationIndex !== -1) {
      motivations[motivationIndex] = {
        id: parseInt(id),
        nama,
        asal,
        tanggal,
        suka: motivations[motivationIndex].suka, // Tetap menyimpan jumlah like
        text_motivasi
      };
      respondWithJSON(res, 200, motivations[motivationIndex]);
    } else {
      respondWithJSON(res, 404, { message: 'Motivasi tidak ditemukan!' });
    }
  });
};

// Fungsi untuk menghapus motivasi
const deleteMotivation = (res, id) => {
  const motivationIndex = motivations.findIndex(m => m.id === parseInt(id));
  if (motivationIndex !== -1) {
    motivations.splice(motivationIndex, 1);
    respondWithJSON(res, 200, { message: 'Motivasi berhasil dihapus!' });
  } else {
    respondWithJSON(res, 404, { message: 'Motivasi tidak ditemukan!' });
  }
};

// Membuat server HTTP
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname } = parsedUrl;

  // Menambahkan rute untuk berbagai operasi
  if (req.method === 'POST' && pathname === '/motivations') {
    createMotivation(req, res);
  } else if (req.method === 'GET' && pathname === '/motivations') {
    readMotivations(res);
  } else if (req.method === 'GET' && pathname.startsWith('/motivations/')) {
    const id = pathname.split('/')[2];
    readMotivationById(res, id);
  } else if (req.method === 'PUT' && pathname.startsWith('/motivations/like/')) {
    const id = pathname.split('/')[3];
    addLike(res, id);
  } else if (req.method === 'PUT' && pathname.startsWith('/motivations/')) {
    const id = pathname.split('/')[2];
    updateMotivation(req, res, id);
  } else if (req.method === 'DELETE' && pathname.startsWith('/motivations/')) {
    const id = pathname.split('/')[2];
    deleteMotivation(res, id);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Rute tidak ditemukan!' }));
  }
});

// Memulai server di port 3000
server.listen(3000, () => {
  console.log('Server berjalan di http://localhost:3000');
});
