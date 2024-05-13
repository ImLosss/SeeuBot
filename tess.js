const readline = require('readline');

// Membuat interface pembacaan dari stdin
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Meminta input dari pengguna
rl.question('Masukkan nama Anda: ', (nama) => {
  console.log(`Halo, ${nama}!`);
  rl.close(); // Menutup interface readline setelah pengguna memberikan input
});