const puppeteer = require('puppeteer');
const fs = require('fs');
const axios = require('axios');
const { MessageMedia } = require('whatsapp-web.js');
const col = require('colors');
const { ceklimit } = require('./function');

const pinterest = async (msg, sender) => {
    let browser;
    msg.reply('[⏳] Tunggu sebentar...');
    
    const chat = await msg.getChat();

    if(!chat.isGroup) {
        const limit = await ceklimit(sender);
        if(limit) return msg.reply('Jumlah pemakaian Private anda hari ini telah mencapai batas, anda dapat menggunakan command kembali besok. Masuk ke grup SeeuBot agar dapat menggunakan command kembali:\n\nhttps://chat.whatsapp.com/Jy1xiPwFMl6I5TaVciJA3P');
    }

    let message = msg.body;
    let searchString = message.split(' ');

    searchString = searchString.slice(1,searchString.length);
    searchString = searchString.join(" ");
  try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
         });
        const page = await browser.newPage();

        // Set a user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36');

        await page.setViewport({
            width: 1920,
            height: 1280
        });

        const searchQuery = searchString;
        const baseUrl = 'https://id.pinterest.com/search/pins/?q=';

        const modifiedUrl = baseUrl + encodeURIComponent(searchQuery) + '&rs=typed';

        await page.goto(modifiedUrl, { waitUntil: 'networkidle0' });

        console.log(`\nfrom\t\t:`.green + `${ sender }`.gray.bold);
        console.log(`pencarian\t:`.green + `${ searchQuery }`.gray.bold);
        console.log(`fitur\t\t:`.green + `/pinterest`.gray.bold);
        console.log(`pesan\t\t:`.green + `${ message }`.gray.bold);
        page.setDefaultTimeout(10000);
        await page.waitForTimeout(5000);

        // Ambil screenshot halaman sebelum navigasi
        await page.screenshot({ path: './database/screenshot_before.png' });

        // // Scrolling web
        // const random = Math.floor(Math.random() * 5) + 1;
        // console.log(`info_scrol\t:`.green + `${ random }`.gray.bold);
        // let scroll = 2000;
        // for (let i = 0; i <= random; i++) {
        //     const { scrollHeight, arg } = await page.evaluate(async (arg) => {
        //       window.scrollBy(0, arg); 
        //       const scrollHeight = document.body.scrollHeight;
        //       return { scrollHeight, arg };
        //     }, scroll);
      
        //     await page.waitForTimeout(2000);
        //     console.log(`info_scrol\t:`.green + `${ scrollHeight }`.gray.bold);
      
        //     scroll += 1000;
        // }

        // await page.screenshot({ path: './database/screenshot_after.png' });

        // Tunggu hingga elemen muncul sebelum mengambil data
        await page.waitForSelector('img');

        // Mengambil data dari selector
        let data = await page.evaluate((search) => {
            const images = document.querySelectorAll('img');
            const results = Array.from(images).map(img => {
                const src = img.getAttribute('src');
                return { search:search, src: src };
            }).filter(img => img.src); // filter out images without src attribute
            return results;
        }, searchQuery);
        
        fs.writeFileSync(`./database/data_pinterest/${ sender }`, JSON.stringify(data));

        msg.reply(`Menemukan ${ data.length } gambar`)
        .catch(() => {
            chat.sendMessage(`Menemukan ${ data.length } gambar`)
        })
        const random2 = Math.floor(Math.random() * data.length);
        const url = await change_link(data[random2], 'originals', sender, data[random2].search);
        await download(msg, url.url, sender, url.search);
        
        await browser.close();
    } catch (e) {
        console.log(`Error\t\t:`.red + `${ e.message }`.gray.bold);
        msg.reply('kesalahan jaringan atau tidak menemukan gambar')
        .catch(() => {
            chat.sendMessage('kesalahan jaringan atau tidak menemukan gambar')
        })
        await browser.close();
    }
}

const download = async (msg, url, sender, search) => {
    const chat = await msg.getChat();
    const path = `./database/data_pinterest/${ sender }.jpg`;
    axios({
        method: 'GET',
        url: url,
        responseType: 'arraybuffer'
    })
        .then(response => {
            const base64Data = Buffer.from(response.data, 'binary').toString('base64');
            const media = new MessageMedia('image/png', base64Data);
            chat.sendMessage(media, { caption:`*${ search }*\n\nKirim */next* untuk gambar berikutnya` });
        })
        .catch(async error => {
            console.log(`Error `.red + `tidak memiliki otorisasi, mengambil gambar lain...`.gray.bold);
            pint_send(msg, sender);
        });
}

const pint_send = async (msg, sender) => {
    const chat = await msg.getChat();

    if(!chat.isGroup) {
        const limit = await ceklimit(sender);
        if(limit) return msg.reply('Jumlah pemakaian Private anda hari ini telah mencapai batas, anda dapat menggunakan command kembali besok. Masuk ke grup SeeuBot agar dapat menggunakan command kembali:\n\nhttps://chat.whatsapp.com/Jy1xiPwFMl6I5TaVciJA3P');
    }

    const path = `./database/data_pinterest/${ sender }`;
    console.log(`\nfrom\t\t:`.green + `${ sender }`.gray.bold);
    console.log(`fitur\t\t:`.green + `/next`.gray.bold);
    console.log(`pesan\t\t:`.green + `${ msg.body }`.gray.bold);
    if (fs.existsSync(path)) {
        const fileData = fs.readFileSync(path, 'utf-8');
        let data_img = JSON.parse(fileData);
        if(data_img.length > 0) {
            const random2 = Math.floor(Math.random() * data_img.length);
            const url = await change_link(data_img[random2], 'originals', sender, data_img[random2].search);
            await download(msg, url.url, sender, url.search);
        }
        if(data_img.length === 0) {
            msg.reply('telah mengirim semua gambar, lakukan pencarian kembali dengan mengirim */pinterest [search]*');
            fs.unlinkSync(path);

        }
    } else {
        msg.reply('anda belum melakukan pencarian, kirim pesan */pinterest [search]*')
    }
}

function change_link(link, res, sender, search){
    const path = `./database/data_pinterest/${ sender }`;
    let url = link.src;
    url = url.split('/');
    url[3] = res;
    url = url.join('/');

    console.log(`link_img\t:`.green + `${ url }`.gray.bold);

    const fileData = fs.readFileSync(path, 'utf-8');
    let data_img = JSON.parse(fileData);
    for (let i of data_img){
        if (i.src == link.src){
            let index = data_img.findIndex(item => item.src === link.src);
            data_img.splice(index, 1);
            fs.writeFileSync(path, JSON.stringify(data_img));
            break;
        }
    }
    return {url: url, search: search};
}

module.exports = {
    pinterest,
    pint_send
}
