const puppeteer = require('puppeteer');
const fs = require('fs');
const axios = require('axios');
const { MessageMedia } = require('whatsapp-web.js');
const { ceklimit } = require('./function');
const mime = require('mime-types');


const igdl = async (msg, url, sender) => {
    let browser;
    try {
        let file_name = [];

        const chat = await msg.getChat();

        if(!chat.isGroup) {
            const limit = await ceklimit(sender);
            if(limit) return msg.reply('Jumlah pemakaian Private anda hari ini telah mencapai batas, anda dapat menggunakan command kembali besok. Masuk ke grup SeeuBot agar dapat menggunakan command kembali:\n\nhttps://chat.whatsapp.com/IX4rq2WWN72BOEcvk46wnv');
        }

        msg.reply('[⏳] Tunggu sebentar...');

        browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Set a user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36');

        await page.goto('https://igdownloader.app/id');

        page.setDefaultTimeout(5000);

        await page.waitForTimeout(5000);

        // Ambil screenshot halaman sebelum navigasi
        await page.screenshot({ path: './database/screenshot_before.png' });

        // Mengetik teks ke dalam form input
        await page.type('#s_input', url);

        await page.click('#search-form > div > div > button');

        await page.waitForTimeout(5000);

        // Ambil screenshot halaman setelah navigasi
        await page.screenshot({ path: './database/screenshot_after.png' });

        // Tunggu hingga elemen muncul sebelum mengambil data
        await page.waitForSelector('#download-result > ul');

        // Mengambil data dari selector
        const data = await page.evaluate(() => {
            const ulElement = document.querySelector("#download-result > ul");
            const items = ulElement.querySelectorAll("li");
            const results = [];

            items.forEach((item) => {
                const element = item.querySelector("a");
                results.push({ url: element.href, ex: element.textContent});
            });
            return results;
        });

        console.log(data);

        let ex = "";
        let no = 1;
        data.forEach(async (item) => {
            await download(item.url)
            .then (result => {
                let filename = `${ no }${ result.filename }`
                const base64Data = Buffer.from(result.buffer, 'binary').toString('base64');
                const media = new MessageMedia(result.mimetype, base64Data, filename, result.filesize);
                if(result.mimetype == 'image/jpeg' || result.mimetype == 'image/png') msg.reply(media, { caption: '✅Berhasil', sendMediaAsDocument:true }).catch(() => { chat.sendMessage(media, { caption: '✅Berhasil'}); })  
                else msg.reply(media, { caption: '✅Berhasil', sendMediaAsDocument:true }).catch(() => { chat.sendMessage(media, { caption: '✅Berhasil', sendMediaAsDocument:true }); })  
                no += 1;  
            })
            .catch( e => {
                msg.reply(e).catch(() => { chat.sendMessage(e) });
            })
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
                    filename: `igdl.${ extension }`,
                    mimetype: mimetype,
                    filesize: fileSize,
                    buffer: response.data
                })
            }
        })
        .catch(err => {
            console.log(err.message)
            reject('Terjadi kesalahan saat mengunduh file anda...');
        });
    })
}

// scrape();
module.exports = {
    igdl
}
