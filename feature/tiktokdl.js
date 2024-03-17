const puppeteer = require('puppeteer');
const mime = require('mime-types');
const fs = require('fs');
const axios = require('axios');
const { MessageMedia } = require('whatsapp-web.js');
const { ceklimit } = require('./function');


const tiktokdl = async (msg, sender) => {
    let browser;
    try {

        const chat = await msg.getChat();

        if(!chat.isGroup) {
            const limit = await ceklimit(sender);
            if(limit) return msg.reply('Jumlah pemakaian Private anda hari ini telah mencapai batas, anda dapat menggunakan command kembali besok. Masuk ke grup SeeuBot agar dapat menggunakan command kembali:\n\nhttps://chat.whatsapp.com/Jy1xiPwFMl6I5TaVciJA3P');
        }

        let url = msg.body;
        url = url.split(' ');
        console.log(url.length);
        if(url.length <= 1) return msg.reply('Format anda salah, kirim kembali dengan format /tiktokdl [link]').catch(() => { chat.sendMessage('Format anda salah, kirim kembali dengan format /tiktokdl [link]') });
        url = url[1];

        msg.reply('[⏳] Tunggu sebentar...');

        browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Set a user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36');
        await page.setViewport({
            width: 1600,
            height: 1800
        });

        await page.goto('https://snaptik.app');

        page.setDefaultTimeout(5000);

        await page.waitForTimeout(5000);

        // Ambil screenshot halaman sebelum navigasi
        await page.screenshot({ path: './database/screenshot_before.png' });

        // Mengetik teks ke dalam form input
        await page.type('#url', url);

        await page.click('#hero > div > form > button');

        await page.waitForTimeout(5000);

        // Ambil screenshot halaman setelah navigasi
        await page.screenshot({ path: './database/screenshot_after.png' });

        // Tunggu hingga elemen muncul sebelum mengambil data
        await page.waitForSelector('#download > div > div.video-links');

        // Mengambil data dari selector
        const data = await page.evaluate(() => {
            const ulElement = document.querySelector("#download > div > div.video-links");
            const items = ulElement.querySelectorAll("a");
            // const results = [];
            const results = []

            items.forEach((item) => {
                // results.push({ url: item.href, ex: item.textContent});
                if(item.textContent == 'Download' || item.textContent == 'Download Server 02') {
                    results.push({ url: item.href, ex: item.textContent});
                }
            });

            return results;
        });

        console.log(data);

        await download(data[0].url)
        .then(result => {
            const base64Data = Buffer.from(result.buffer, 'binary').toString('base64');
            const media = new MessageMedia(result.mimetype, base64Data, result.filename, result.filesize);

            msg.reply(media, { caption: '✅Berhasil', sendMediaAsDocument:true }).catch(() => { chat.sendMessage(media, { caption: '✅Berhasil', sendMediaAsDocument:true }); })
        })
        .catch( e => {
            msg.reply(e).catch(() => { chat.sendMessage(e) });
        })
        await browser.close();
    } catch (e) {
        msg.reply('sepertinya url mu salah coba kirim kembali dengan format */igdl [link]*');
        console.log(e);
        await browser.close();
    }
}

const download = async (url) => {
    return new Promise((resolve, reject) => {
        axios({
            method: 'GET',
            url: url,
            responseType: 'arraybuffer'
        })
        .then(response => {
            let fileSize = (response.headers['content-length'] / 1000000).toFixed(2);
            const mimetype = response.headers['content-type'];
            const extension = mime.extension(mimetype);
            console.log(fileSize, mimetype);
            if(fileSize > 30) {
                resolve(`File terlalu besar (Ukuran file anda : ${ fileSize })`);
            } else {
                resolve({
                    filename: `tiktokdl.${ extension }`,
                    mimetype: mimetype,
                    filesize: fileSize,
                    buffer: response.data
                })
            }
        })
        .catch(error => {
            reject(error);
        });
    })
}

// scrape();
module.exports = {
    tiktokdl
}
