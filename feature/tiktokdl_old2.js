const puppeteer = require('puppeteer');
const fs = require('fs');
const axios = require('axios');
const { MessageMedia } = require('whatsapp-web.js');
const col = require('colors');
const { ceklimit } = require('./function');

const tiktokdl = async (msg, url, sender) => {

    console.log(`\nfrom\t\t:`.green + `${ sender }`.gray.bold);
    console.log(`fitur\t\t:`.green + `/tiktokdl`.gray.bold);
    console.log(`pesan\t\t:`.green + `${ msg.body }`.gray.bold);

    let browser;

    try {

        const chat = await msg.getChat();

        if(!chat.isGroup) {
            const limit = await ceklimit(sender);
            if(limit) return msg.reply('Jumlah pemakaian Private anda hari ini telah mencapai batas, anda dapat menggunakan command kembali besok. Masuk ke grup SeeuBot agar dapat menggunakan command kembali:\n\nhttps://chat.whatsapp.com/IX4rq2WWN72BOEcvk46wnv');
        }

        msg.reply('[⏳] Tunggu sebentar...');

        browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Set a user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36');

        page.setDefaultTimeout(5000);

        const cookies = [
            { name: 'lang', value: 'id', domain: '.savefrom.net', path: '/' },
            { name: 'uid', value: '1ed0f2b5a02df10d', domain: '.savefrom.net', path: '/' },
            { name: 'x-requested-with', value: '', domain: '.savefrom.net', path: '/' },
            { name: '_ga_52DE8HHGTB', value: 'GS1.2.1688575255.2.1.1688575658.0.0.0', domain: '.savefrom.net', path: '/' },
            { name: 'country', value: 'ID', domain: '.savefrom.net', path: '/' },
            { name: 'sfHelperDist', value: '18', domain: '.savefrom.net', path: '/' },
            { name: 'apkHelperDist', value: '82', domain: '.savefrom.net', path: '/' },
            { name: 'reference', value: '82', domain: '.savefrom.net', path: '/' },
            { name: 'sfHelper', value: '60', domain: '.savefrom.net', path: '/' },
            { name: 'clickads-e2', value: '63', domain: '.savefrom.net', path: '/' },
            { name: 'errorClickAds', value: '21', domain: '.savefrom.net', path: '/' },
            { name: 'poropellerAdsPush-e', value: '93', domain: '.savefrom.net', path: '/' },
            { name: 'koreanBanners', value: '39', domain: '.savefrom.net', path: '/' },
            { name: 'promoBlock', value: '85', domain: '.savefrom.net', path: '/' },
            { name: 'helperWidget', value: '42', domain: '.savefrom.net', path: '/' },
            { name: 'helperBanner', value: '85', domain: '.savefrom.net', path: '/' },
            { name: 'partnersBlock', value: '41', domain: '.savefrom.net', path: '/' },
            { name: 'inpagePush2', value: '15', domain: '.savefrom.net', path: '/' },
            { name: 'popupInOutput', value: '3', domain: '.savefrom.net', path: '/' },
            { name: 'popupAfterDownload', value: '45', domain: '.savefrom.net', path: '/' },
            { name: '_gid', value: 'GA1.2.1598264182.1697552617', domain: '.savefrom.net', path: '/' },
            { name: '_ga_R9MDK3K29K', value: 'GS1.2.1697565311.5.1.1697565311.0.0.0', domain: '.savefrom.net', path: '/' },
            { name: '_ga_9ZMEKK0DW7', value: 'GS1.1.1697565314.6.0.1697565318.0.0.0', domain: '.savefrom.net', path: '/' },
            { name: '_ga', value: 'GA1.2.2047289230.1688552422', domain: '.savefrom.net', path: '/' },
            { name: '_ga_R1P8SYKKYC', value: 'GS1.2.1697565319.5.0.1697565319.0.0.0', domain: '.savefrom.net', path: '/' },
            { name: '_ga_YZBZRGCYS9', value: 'GS1.2.1697565306.5.1.1697566457.0.0.0', domain: '.savefrom.net', path: '/' }
        ];

        await page.setCookie(...cookies);

        await page.goto('https://id.savefrom.net/247/');

        await page.waitForTimeout(5000);

        // Ambil screenshot halaman sebelum navigasi
        await page.screenshot({ path: './database/screenshot_before.png' });

        // Mengetik teks ke dalam form input
        // await page.type('#sf_url', url);

        // await page.click('#sf_submit');

        await page.focus('#sf_url');

        await page.keyboard.type(url);

        await page.waitForTimeout(5000);

        await page.keyboard.press('Enter');

        await page.waitForTimeout(5000);

        // Ambil screenshot halaman setelah navigasi
        await page.screenshot({ path: './database/screenshot_after.png' });

        // Tunggu hingga elemen muncul sebelum mengambil data
        await page.waitForSelector('#sf_result > div > div > div.info-box > div.link-box > div.def-btn-box > a');

        // Ambil screenshot halaman setelah navigasi
        await page.screenshot({ path: './database/screenshot_after2.png' });

        // Mengambil data dari selector
        const data = await page.evaluate(() => {
            const ulElement = document.querySelector('#sf_result > div > div > div.info-box > div.link-box > div.def-btn-box > a');
            return ulElement.href;
        });
        download(data)
        .then(result => {
            console.log(result);
            if(result.file_size > 31457280) return msg.reply(`Ukuran file terlalu besar (Maks: 30mb)`).catch(() => { chat.sendMessage('Ukuran file terlalu besar (Maks: 30mb)') })
            const base64Data = Buffer.from(result.buffer, 'binary').toString('base64');
            const media = new MessageMedia(result.mimeType, base64Data, result.file_name);

            return chat.sendMessage(media, { caption: '✅Unduhan selesai', sendMediaAsDocument: true });
        })
        .catch(e => {
            msg.reply('terjadi kesalalahan saat melakukan download file')
            .catch(() => {
                chat.sendMessage('terjadi kesalalahan saat melakukan download file');
            })
        })
        await browser.close();
    } catch (e) {
        msg.reply('sepertinya url mu salah coba kirim kembali dengan format */tiktokdl [link]*')
        .catch(() => {
            chat.sendMessage('sepertinya url mu salah coba kirim kembali dengan format */tiktokdl [link]*');
        })
        console.log(e)
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
            const file_size = response.headers['content-length'];
            const mimeType = response.headers['content-type'];
            let file_name = response.headers['content-disposition'];
            file_name = file_name.match(/filename="([^"]+)"/);
            file_name = file_name ? file_name[1] : 'tiktokdl.mp4';
            console.log(file_name)

            let data = {
                file_name : file_name,
                file_size : file_size,
                mimeType: mimeType,
                buffer: response.data
            }
            resolve(data);
        })
        .catch((e) => {
            console.log(e);
            reject('error');
        });
    })
};

// scrape();
module.exports = {
    tiktokdl
}
