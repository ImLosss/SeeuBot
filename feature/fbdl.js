const puppeteer = require('puppeteer');
const fs = require('fs');
const axios = require('axios');
const { MessageMedia } = require('whatsapp-web.js');
const col = require('colors');
const { ceklimit } = require('./function');

const fbdl = async (msg, url, sender) => {

    console.log(`\nfrom\t\t:`.green + `${ sender }`.gray.bold);
    console.log(`fitur\t\t:`.green + `/fbdl`.gray.bold);
    console.log(`pesan\t\t:`.green + `${ msg.body }`.gray.bold);

    let browser;

    try {

        const chat = await msg.getChat();

        if(!chat.isGroup) {
            const limit = await ceklimit(sender);
            if(limit) return msg.reply('Jumlah pemakaian Private anda hari ini telah mencapai batas, anda dapat menggunakan command kembali besok. Masuk ke grup SeeuBot agar dapat menggunakan command kembali:\n\nhttps://chat.whatsapp.com/Jy1xiPwFMl6I5TaVciJA3P');
        }

        msg.reply('[⏳] Tunggu sebentar...');

        browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Set a user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36');

        await page.goto('https://id.savefrom.net');

        page.setDefaultTimeout(5000);

        // Ambil screenshot halaman sebelum navigasi
        await page.screenshot({ path: './database/screenshot_before.png' });

        // Mengetik teks ke dalam form input
        await page.type('#sf_url', url);

        await page.click('#sf_submit');

        // Tunggu hingga elemen muncul sebelum mengambil data
        await page.waitForSelector('#sf_result > div > div > div.info-box > div.link-box > div.def-btn-box > a');

        // Ambil screenshot halaman setelah navigasi
        await page.screenshot({ path: './database/screenshot_after.png' });

        // Mengambil data dari selector
        const data = await page.evaluate(() => {
            const ulElement = document.querySelector('#sf_result > div > div > div.info-box > div.link-box > div.def-btn-box > a');
            return ulElement.href;
        });
        download(data)
        .then(result => {
            if(result === "unknown_file") {
                msg.reply('terjadi kesalalahan saat melakukan download file')
                .catch(() => {
                    chat.sendMessage('terjadi kesalalahan saat melakukan download file');
                })
            } else {
                const media = MessageMedia.fromFilePath(result);
                chat.sendMessage(media, { sendMediaAsDocument: true, caption: "Unduhan selesai" })
                .then(() => {
                    fs.unlinkSync(result);
                })
                .catch(() => {
                    msg.reply('terjadi kesalahan saat mengirim file anda')
                    .catch(() => {
                        chat.sendMessage('terjadi kesalahan saat mengirim file anda')
                    })
                })
            }
        })
        await browser.close();
    } catch (e) {
        msg.reply('sepertinya url mu salah coba kirim kembali dengan format */fbdl [link]*')
        .catch(() => {
            chat.sendMessage('sepertinya url mu salah coba kirim kembali dengan format */fbdl [link]*');
        })
        await browser.close();
    }
}


const download = async (url) => {
    return new Promise((resolve, reject) => {
      const path = `./database/fbdl.mp4`;
      axios({
        method: 'GET',
        url: url,
        responseType: 'stream'
      })
        .then(response => {
            // const contentDisposition = response.headers['content-disposition'];
            // console.log(contentDisposition);
            // const filenameMatch = contentDisposition.match(/filename=(.*)$/);
            // const filename = filenameMatch ? filenameMatch[1].replace(/"/g, '') : 'unknown_file';
    
            response.data.pipe(fs.createWriteStream(path))
            .on('finish', () => {
                resolve(path);
            })
        })
        .catch(() => {
            msg.reply('Terjadi kesalahaan saat mengunduh file anda')
            .catch(() => {
                chat.sendMessage('Terjadi kesalahan saat mengunduh file anda')
            })
        });
    });
};

// scrape();
module.exports = {
    fbdl
}
