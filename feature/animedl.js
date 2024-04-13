const puppeteer = require('puppeteer');
const axios = require('axios')
const fs = require('fs');
const { ceklimit } = require('./function');

const animedl = async (msg, client, sender) => {
    let browser;
    try {
        browser = await puppeteer.launch();
        const page = await browser.newPage();
        let data;
        let no;
        let input;
        let anime;
        let link;

        const chat = await msg.getChat();

        if(!chat.isGroup) {
            const limit = await ceklimit(sender);
            if(limit) return msg.reply('Jumlah pemakaian Private anda hari ini telah mencapai batas, anda dapat menggunakan command kembali besok. Masuk ke grup SeeuBot agar dapat menggunakan command kembali:\n\nhttps://chat.whatsapp.com/Jy1xiPwFMl6I5TaVciJA3P');
        }

        let search = await promptUser(client, msg, '*Masukkan judul Anime:*\n\n_Note:_\n_Reply pesan ini_')

        console.log(search)

        if(!search) {
            await browser.close();
            return msg.reply('Waktu habis, silahkan coba kembali!').catch(() => { chat.sendMessage('Waktu habis, silahkan coba kembali!') })
        }

        // Membuat URL baru dengan parameter pencarian
        const newUrl = `https://otakudesu.cloud/?s=${encodeURIComponent(search)}&post_type=anime`;

        console.log(newUrl)

        // Set header User-Agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36');
        await page.setViewport({
            width: 1600,
            height: 1800
        });

        page.setDefaultTimeout(60000);

        await page.goto(newUrl);

        await page.waitForSelector('div.venser > div > div > ul')

        data = await page.evaluate(() => {
            const ulElement = document.querySelector('div.venser > div > div > ul');
            const items = ulElement.querySelectorAll('h2');
            let results = [];
            if (items.length < 1) return false;

            items.forEach((item) => {
                const link = item.querySelector('a');
                results.push({title: item.textContent, link: link.href })
            });

            return results;
        });

        if(!data) {
            await browser.close();
            return msg.reply('Anime tidak ditemukan').catch(() => { chat.sendMessage('Anime tidak ditemukan') })
        };

        input = "*Pilih Anime:*\n"
        no = 0;

        data.forEach((item) => {
            input += `[${ no + 1 }] ${ item.title }\n\n`
            no+=1;
        })

        input += "\n_Note:_\n_Reply pesan ini berdasarkan indeks diatas!_"
        // Minta input pengguna untuk indeks item yang akan diklik
        let pilAnime = await promptUser(client, msg, input);

        if (!pilAnime){
            await browser.close();
            return msg.reply('Waktu habis, silahkan coba kembali!').catch(() => { chat.sendMessage('Waktu habis, silahkan coba kembali!') })
        } else if(isNaN(pilAnime) || pilAnime <= 0 || pilAnime > data.length) {
            await browser.close();
            return msg.reply('Reply pesan sesuai dengan indeks! Coba kembali...').catch(() => { chat.sendMessage('Reply pesan sesuai dengan indeks!, Coba kembali...') })
        }

        link = data[pilAnime - 1].link;

        console.log('anime link: ', link);

        await page.goto(data[pilAnime - 1].link);

        await page.waitForSelector('#venkonten > div.venser > div:nth-child(8) > ul');

        await page.screenshot({ path: './database/screenshot_before.png' });

        data = await page.evaluate(() => {
            const ulElement = document.querySelector('#venkonten > div.venser > div:nth-child(8) > ul');
            const items = ulElement.querySelectorAll('span > a');
            const result = [];

            items.forEach((item) => {
                result.push({ title: item.textContent, link: item.href })
            });

            return result;
        });

        input = "*Pilih Episode:*\n"
        no = 0;

        data.forEach((item) => {
            input += `[${ no + 1 }] ${ item.title }\n\n`
            no+=1;
        })

        input += "\n_Note:_\n_Reply pesan ini berdasarkan indeks diatas!_"

        // Minta input pengguna untuk indeks item yang akan diklik
        pilAnime = await promptUser(client, msg, input);

        // Konversi input pengguna menjadi angka (pastikan valid)
        pilAnime = parseInt(pilAnime);

        if (!pilAnime){
            await browser.close();
            return msg.reply('Waktu habis, silahkan coba kembali!').catch(() => { chat.sendMessage('Waktu habis, silahkan coba kembali!') })
        } else if(isNaN(pilAnime) || pilAnime <= 0 || pilAnime > data.length) {
            await browser.close();
            return msg.reply('Reply pesan sesuai dengan indeks! Coba kembali...').catch(() => { chat.sendMessage('Reply pesan sesuai dengan indeks!, Coba kembali...') })
        }

        anime = data[pilAnime - 1].title;

        link = data[pilAnime - 1].link;

        console.log('episode link: ', data);
        console.log(link);
        console.log(pilAnime);

        console.log('menuju link');

        console.log('mengambil screenshot');

        await page.waitForTimeout(10000);

        await page.screenshot({ path: './database/screenshot_before.png' });
        
        data = await page.evaluate(() => {
            const ulElement = document.querySelector('#venkonten > div.venser > div.venutama > div.download > ul:nth-child(2)');
            const items = ulElement.querySelectorAll('li:nth-child(3) > a');
            let result = false;
            let link = "";

            items.forEach((item) => {
                let strLink = ['AceFile', 'aceFile', 'Acefile', 'AceFile ', 'aceFile ', 'Acefile ', ' AceFile', ' aceFile', ' Acefile', ' AceFile ', ' aceFile ', ' Acefile ']
                if (strLink.some(pre => item.textContent == `${ pre }`)) {
                    link += item.href;
                    result = true
                } 
            });

            if (result) return link
            else return result
        });

        console.log(data);

        if (!data) {
            await browser.close();
            return msg.reply('Tidak menemukan link download. Hanya bisa mendownload anime terbaru atau release mulai tahun 2023 - sekarang').catch(() => { chat.sendMessage('Tidak menemukan link download. Hanya bisa mendownload anime terbaru atau release mulai tahun 2023 - sekarang') })
        }

        // Set header Cookie
        const cookies = [{
                name: '_ga',
                value: 'GA1.2.28378388.1668954499',
                domain: '.acefile.co',
            },
            {
                name: 'ps_sess',
                value: 'e9a8mr550lm4v2thij8pftlm73bq0e7u',
                domain: '.acefile.co',
            },
            {
                name: 'ace_csrf',
                value: '0988a6a09ac7070a4ca51afb88856169',
                domain: '.acefile.co',
            },
            {
                name: '_gid',
                value: 'GA1.2.1610077827.1696596708',
                domain: '.acefile.co',
            },
            {
                name: 'cf_clearance',
                value: 'Hibw042.5V4aVmFPja_fZ7vOr5HbPocCvR1F6AFb7yM-1696596716-0-1-c3d6dc84.f1185eee.fa326bd-0.2.1696596716',
                domain: '.acefile.co',
            },
            {
                name: '_gat',
                value: '1',
                domain: '.acefile.co',
            },
            {
                name: '_ga_J8KFR8K0NQ',
                value: 'GS1.2.1696600523.28.1.1696600825.0.0.0',
                domain: '.acefile.co',
            },
            // Tambahkan cookie lainnya sesuai kebutuhan
        ];

        await page.setCookie(...cookies);

        // Navigasi ke halaman web Acefile.co
        await page.goto(data);

        // Menambahkan event listener untuk mengambil URL unduhan saat unduhan dimulai
        let status = false;
        page.on('response', async (response) => {
            const url = response.url();
            if (response.request().resourceType() === 'document' && response.status() === 200) {
                // Ini adalah tanggapan untuk halaman web yang dapat Anda periksa atau lanjutkan interaksi
                status = true;
                console.log(`Link download: ${ url }`);
                if (url.includes('accounts.google.com') || url.includes('acefile.co')) status = 'gagal'
                else if (url.includes('https://c.adsco.re/')) console.log(`Skip link: ${ url }`);
                else {
                    msg.reply(`*${ anime } 720p*\n\nIkuti link dibawah untuk mulai mendownload:\n${ url }\n\n_Note:_\n_Link hanya berlaku dalam beberapa menit kedepan_`).catch(() => { chat.sendMessage(`*${ anime } 720p*\n\nIkuti link dibawah untuk mulai mendownload:\n${ url }\n\n_Note:_\n_Link hanya berlaku dalam beberapa menit kedepan_`) })
                }
            } else if (response.request().resourceType() === 'other' && response.status() === 200) {
                // kode jika ada link yang terbuka setelah melakukan klik page
            }
        });

        await page.click("body > div.container > div > div:nth-child(17) > button")

        if (status == true) return await browser.close()
        else if(status == 'gagal') {
            await browser.close();
            return msg.reply('Error: Gagal saat mencoba mengambil link Download, coba kembali...').catch(() => { chat.sendMessage('Error: Gagal saat mencoba mengambil link Download, coba kembali...') })
        }

        await page.waitForTimeout(8000)

        // Ambil screenshot halaman sebelum navigasi
        await page.screenshot({ path: './database/screenshot_before.png' });

        await page.click('#uc-download-link')

        if(status == 'gagal'){
            await browser.close();
            return msg.reply('Error: Gagal saat mencoba mengambil link Download, coba kembali...').catch(() => { chat.sendMessage('Error: Gagal saat mencoba mengambil link Download, coba kembali...') })        }

        // Tutup browser
        return await browser.close();
    } catch (err) {
        const chat = await msg.getChat();
        console.log(err)
        await browser.close();
        return msg.reply('Error: Terjadi kesalahan').catch(() => { chat.sendMessage('Error: terjadi kesalahan') })
    }
}

const download = async (url) => {
    return new Promise((resolve, reject) => {
        const path = `./vid.mp4`;
        axios({
            method: 'GET',
            url: url,
            responseType: 'stream'
        })
        .then(response => {
            response.data.pipe(fs.createWriteStream(path))
            .on('finish', () => {
                resolve(path);
            });
        })
        .catch(error => {
            reject(error);
        });
    })
}

function promptUser(client, msg, question) {
    return new Promise(async (resolve) => {
        const chat = await msg.getChat()
        let timer;
        let sesi;

        client.on('message_create', async msg2 => {
            if(msg2.body == question) sesi = msg2;
            if(msg2.hasQuotedMsg){
                const reply = await msg2.getQuotedMessage();
                const content = reply.body;
                if (content.includes(question)) {
                    clearTimeout(timer);
                    const answer = msg2.body;
                    resolve(answer);
                }
            }
        })
        msg.reply(question).catch(() => { chat.sendMessage(question) })

        timer = setTimeout(() => {
            sesi.delete(true);
            resolve(false);
        }, 30000);
    });
}

module.exports = {
    animedl
}
