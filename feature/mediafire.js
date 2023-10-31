const axios = require('axios');
const fs = require('fs');

async function mediafire(msg, sender) {
    let link = msg.body;
    link = link.split(' ');
    if (link.length < 2) return msg.reply('Format anda salah kirim kembali dengan format */mediafire [link]*'); 
    if(!link[1].includes('mediafire.com')) return msg.reply("Sepertinya link yang kamu kirim salah, cek kembali lalu kirim dengan format */mediafire [link]*")

    link = link[1];

    await download(link)
    .then((result) => {
        console.log(result.buffer);
        console.log(result);
    })
    .catch((e) => {
        return msg.reply('terjadi kesalahan saat mencoba mengunduh data anda...')
    })
}

const download = async (url) => {
    return new Promise((resolve, reject) => {
        console.log(url);
        axios({
            method: 'GET',
            url: url,
            responseType: 'stream'
        })
        .then(response => {
            // Menggunakan stream untuk menulis file
            response.data.pipe(fs.createWriteStream('tess.apk'));
    
            // Event handler untuk menangani selesai unduhan
            response.data.on('end', () => {
            resolve('Unduhan selesai');
            });
    
            // Event handler untuk menangani kesalahan unduhan
            response.data.on('error', err => {
            reject('Kesalahan unduhan:', err.message);
            });
        })
        .catch((e) => {
            reject(e.message);
        });
    });
};

module.exports = {
    mediafire
}