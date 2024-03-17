const puppeteer = require('puppeteer');
const fs = require('fs');
const axios = require('axios');
const { MessageMedia } = require('whatsapp-web.js');
const col = require('colors');
const { ceklimit } = require('./function');

const topup_cek_genshin = async (msg, sender) => {

    console.log(`\nfrom\t\t:`.green + `${ sender }`.gray.bold);
    console.log(`fitur\t\t:`.green + `/tiktokdl`.gray.bold);
    console.log(`pesan\t\t:`.green + `${ msg.body }`.gray.bold);

    let browser;

    try {

        const chat = await msg.getChat();
        msg.reply('[⏳] Tunggu sebentar...');

        browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Set a user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36');

        await page.goto('https://www.codashop.com/id-id/genshin-impact');

        page.setDefaultTimeout(5000);

        // Ambil screenshot halaman sebelum navigasi
        await page.screenshot({ path: './database/screenshot_before.png' });

        // Tunggu hingga elemen muncul sebelum mengambil data
        await page.waitForSelector('#voucher > ul.form-section__denom-group');

        // Mengambil data dari selector
        const items = await page.evaluate(() => {
            const ulElement = document.querySelector('#voucher > ul.form-section__denom-group');
            const list = ulElement.querySelectorAll('li');
            let results = [];
            list.forEach((item) => {
                const jml_dm = item.querySelector('div.form-section__denom-data-section > span');
                const harga = item.querySelector('p > span.starting-price-value');
                
                results.push({ dm: jml_dm.textContent, harga: harga.textContent });
            });
            return results;
        });
        
        let reply = `*Top up Genshin Impact*\n\n_*Items:*_`
        let no = 1;

        for(let i of items) {
            reply += `\n[${ no }] *Item:* ${ i.dm }💎\n*Harga:* ${ i.harga }💰\n`
            no+=1;
        }

        reply += '\n_*Server:*_\n[1] America\n[2] Europe\n[3] Asia\n[4] TW, HK, MO'

        await msg.reply(reply)
        .catch(() => {
            chat.sendMessage(reply);
        })
        await msg.reply('pilih items dan server berdasarkan indeksnya\n\nlalu reply pesan ini dengan format */topup genshin [uid] [server] [items] [email]*')
        .catch(() => {
            chat.sendMessage('pilih items dan server berdasarkan indeksnya\n\nlalu reply pesan ini dengan format */topup genshin [uid] [server] [items] [email]*')
        })

        
        await browser.close();
    } catch (e) {
        msg.reply('sepertinya url mu salah coba kirim kembali dengan format */topup ML*')
        .catch(() => {
            chat.sendMessage('sepertinya url mu salah coba kirim kembali dengan format */topup ML*');
        })
        await browser.close();
        console.log(e);
    }
}

const topup_genshin = async (msg, sender, uid, server, index_items, email, payment, client) => {

    console.log(`\nfrom\t\t:`.green + `${ sender }`.gray.bold);
    console.log(`fitur\t\t:`.green + `/tiktokdl`.gray.bold);
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

        await page.setViewport({
            width: 1920,
            height: 1280
        });

        await page.goto('https://www.codashop.com/id-id/genshin-impact');

        await page.waitForTimeout(5000);

        console.log(`uid: ${ uid }\nServer: ${ server }`);

        page.setDefaultTimeout(10000);

        // Ambil screenshot halaman sebelum navigasi
        await page.screenshot({ path: './database/screenshot_before.png' });

        // Mengetik teks ke dalam form input
        await page.waitForSelector('#userId');
        await page.type('#userId', uid);
        await page.type("#email", email);
        await page.waitForTimeout(10000);
        await page.waitForSelector('div:nth-child(2) > span > div > div > div > div > div > i');
        await page.click('div:nth-child(2) > span > div > div > div > div > div > i');
        await page.click('div:nth-child(2) > span > div > div > div > div > div > i');

        await page.screenshot({ path: './database/screenshot_before2.png' });

        await page.waitForSelector('div:nth-child(2) > span > div > div > div > div > div > div.dropdown-select__result-list');
        const server_choice = await page.evaluate((server) => {
            let pilihan = server - 1;
            console.log(pilihan)
            const ulElement = document.querySelector('div:nth-child(2) > span > div > div > div > div > div > div.dropdown-select__result-list');
            const list = ulElement.querySelectorAll('div');
            let server_ = ""
            list.forEach((item, index) => {
                if (index == pilihan) {
                    item.click();
                    server_ = item.textContent;
                }
            });
            return server_;
        }, server);

        console.log(server_choice);

        // Tunggu hingga elemen muncul sebelum mengambil data
        await page.waitForSelector('#voucher > ul.form-section__denom-group');
        // Mengambil data dari selector

        
        await page.evaluate((index_items) => {
            let pilihan = index_items - 1;
            console.log(pilihan)
            const ulElement = document.querySelector('#voucher > ul.form-section__denom-group');
            const list = ulElement.querySelectorAll('li');
            list.forEach((item, index) => {
                if (index == pilihan) {
                    item.click();
                }
            });
        }, index_items);

        // pilih pembayaran qris
        await page.click(payment);

        // submit
        await page.click("#mdn-submit");

        await page.waitForTimeout(5000);

        await page.waitForSelector("div.product__container > div > div > div > div.modal-body > div > span")
        const status = await page.evaluate(() => {
            const Element = document.querySelector("div.product__container > div > div > div > div.modal-body > div > span");

            let results;

            const username = Element.querySelector("div:nth-child(1) > div > div.second-col")
            const id = Element.querySelector("div:nth-child(2) > div > div.second-col")
            const harga = Element.querySelector("div:nth-child(3) > div > div.second-col")
            const payment = Element.querySelector("div:nth-child(4) > div > div.second-col")

            results = { username: username.textContent, id: id.textContent, harga: harga.textContent, payment: payment.textContent };

            return results;
        });

        await page.waitForSelector("div.product__container > div > div > div > div.modal-footer.bg-white > button.btn-default.btn-multiple")

        await page.click("div.product__container > div > div > div > div.modal-footer.bg-white > button.btn-default.btn-multiple")

        await page.waitForTimeout(5000);

        await page.waitForSelector("#airtime_iframe")
        const frame = await page.frames().find(frame => frame.name() === 'airtime_iframe');
        const src = await frame.evaluate(() => {
            const imgElement = document.querySelector('#qrcode > img');
            return imgElement ? imgElement.src : null;
        });

        await download(src, sender)
        .then(result => {
            let timer = (1000 * 60) * 15;
            const listener = async (send) => {
                const pesan = send.body;
                
                if(send.fromMe && pesan.includes(`*Username:* ${ status.username }`) && pesan.includes('*Payment:*')) {
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
                console.log('berhasil menghapus listener yang dibuat');
            }, timer + 1000); // 20 detik (dalam milidetik)

            const media = MessageMedia.fromFilePath(result);
            chat.sendMessage(media, { caption: `*Username:* ${ status.username }\n*ID:* ${ status.id }\n*Payment:* ${ status.payment }\n*Email:* ${ email }\n*Harga:* ${ status.harga }` })
            .then(() => {
                msg.reply('Cocokkan kembali data diatas dengan akun Genshin kamu, QRCode hanya berlaku selama 15 menit. Bukti pembayaran akan masuk ke email yang kamu kirim (Silahkan cek email jika telah melakukan pembayaran)\n\n*Note:*\n_Admin tidak bertanggung jawab atas segala kegagalan transaksi_')
                .catch(() => {
                    msg.reply('Cocokkan kembali data diatas dengan akun Genshin kamu, QRCode hanya berlaku selama 15 menit. Bukti pembayaran akan masuk ke email yang kamu kirim (Silahkan cek email jika telah melakukan pembayaran)\n\n*Note:*\n_Admin tidak bertanggung jawab atas segala kegagalan transaksi_')
                })
                fs.unlinkSync(result);
            })
        })
        .catch((e) => {
            msg.reply('terjadi kesalahan, coba kembali setelah 1 menit')
            .catch(() => {
                chat.sendMessage('terjadi kesalahan, coba kembali setelah 1 menit')
            })
            console.log(e);
        })
        
        await browser.close();
    } catch (e) {
        msg.reply('sepertinya data yang kamu masukkan salah, kirim kembali dengan format */topup genshin [uid] [server] [item] [email]*')
        .catch(() => {
            chat.sendMessage('sepertinya data yang kamu masukkan salah, kirim kembali dengan format */topup genshin [uid] [server] [item] [email]*');
        })
        await browser.close();
        console.log(e);
    }
    
}

const download = async (url, sender) => {
    return new Promise((resolve, reject) => {
        const path = `./database/topupgenshin_${ sender }.png`;
      axios({
        method: 'GET',
        url: url,
        responseType: 'stream'
      })
        .then(response => {
    
            response.data.pipe(fs.createWriteStream(path))
            .on('finish', () => {
                resolve(path);
            })
        })
        .catch((e) => {
            reject(e);
        });
    });
};
// scrape();
module.exports = {
    topup_cek_genshin, topup_genshin
}
