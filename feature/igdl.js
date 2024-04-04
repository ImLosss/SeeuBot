const puppeteer = require('puppeteer');
const fs = require('fs');
const axios = require('axios');
const { MessageMedia } = require('whatsapp-web.js');
const { ceklimit } = require('./function');
const mime = require('mime-types');
const drive = require('./drive');


const igdl = async (msg, url, sender, client) => {
    let browser;
    try {
        let file_name = [];

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
                console.log(result);
                let filename = `${ no }${ result.filename }`
                let fileSize = result.filesize;
                fileSize = isNaN(fileSize) ? 'None' : fileSize;
                const delPath = result.path;
                if (fileSize <= 30) {
                    const base64Data = Buffer.from(result.buffer, 'binary').toString('base64');
                    const media = new MessageMedia(result.mimetype, base64Data, filename, result.filesize);
                    if(result.mimetype == 'image/jpeg' || result.mimetype == 'image/png') msg.reply(media, { caption: '✅Berhasil', sendMediaAsDocument:true }).catch(() => { chat.sendMessage(media, { caption: '✅Berhasil'}); })  
                    else msg.reply(media, { caption: '✅Berhasil', sendMediaAsDocument:true }).catch(() => { chat.sendMessage(media, { caption: '✅Berhasil', sendMediaAsDocument:true }); })  
                } else {
                    drive.uploadFile(result.path, filename)
                    .then((result) => {
                        fs.unlinkSync(delPath);
                        drive.generatePublicURL(result)
                        .then((result) => {
                            console.log(result);
                            let timer = (1000 * 60) * 60;
                            const listener = async (send) => {
                                const pesan = send.body;
                                if(send.fromMe && pesan == `*${ filename }*\n\nIkuti link berikut untuk mengunduh file anda:\n${ result.webViewLink }\n\n_Link hanya berlaku selama 1 jam_\n_File size: ${ fileSize }mb_`) {
                                    setTimeout(async => {
                                        send.delete(true);
                                    }, timer);
                                }
                            };
                            // Menambahkan listener ke chat
                            client.addListener('message_create', listener);
                            // Mengatur waktu tunggu maksimum
                            setTimeout(() => {
                                // Timeout tercapai, menghentikan listener dan membersihkan listener
                                client.removeListener('message_create', listener);
                                console.log(`info\n\n: berhasil menghapus listener yang dibuat`);
                            }, timer + 1000); // 20 detik (dalam milidetik)
                            chat.sendMessage(`*${ filename }*\n\nIkuti link berikut untuk mengunduh file anda:\n${ result.webViewLink }\n\n_Link hanya berlaku selama 1 jam_\n_File size: ${ fileSize }mb_`);
                            setTimeout(() => {
                                drive.deleteFile(result.id)
                                .then(() => {
                                    console.log(`info\n\n: berhasil hapus data`);
                                })
                                .catch((err) => {
                                    console.log(err.message);
                                })
                            }, timer);
                        })
                    })
                }
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
            if (fileSize <= 30) {
                resolve({
                    filename: `igdl.${ extension }`,
                    mimetype: mimetype,
                    filesize: fileSize,
                    buffer: response.data
                })
            } else {
                // Menyimpan file ke folder
                const path = `./database/igdl.${ extension }`;
                fs.writeFileSync(path, response.data, 'binary');
                resolve({
                    filename: `igdl.${ extension }`,
                    mimetype: mimetype,
                    filesize: fileSize,
                    path: path
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
