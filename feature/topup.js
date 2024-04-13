const puppeteer = require('puppeteer');
const fs = require('fs');
const axios = require('axios');
const { MessageMedia } = require('whatsapp-web.js');
const col = require('colors');
const { ceklimit } = require('./function');

const topup_cek = async (msg, sender) => {

    console.log(`\nfrom\t\t:`.green + `${ sender }`.gray.bold);
    console.log(`fitur\t\t:`.green + `/topupml`.gray.bold);
    console.log(`pesan\t\t:`.green + `${ msg.body }`.gray.bold);

    let browser;

    try {

        const chat = await msg.getChat();
        msg.reply('[⏳] Tunggu sebentar...');

        browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.setViewport({
            width: 1600,
            height: 1800
        });

        // Set a user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36');

        await page.goto('https://www.codashop.com/id-id/mobile-legends');

        page.setDefaultTimeout(30000);

        // Ambil screenshot halaman sebelum navigasi
        await page.screenshot({ path: './database/screenshot_before.png' });

        // Tunggu hingga elemen muncul sebelum mengambil data
        await page.waitForSelector('#voucher > ul.denomination-card-group');

        // Mengambil data dari selector
        const items = await page.evaluate(() => {
            const ulElement = document.querySelector('#voucher > ul.denomination-card-group');
            const list = ulElement.querySelectorAll('li');
            let results = [];
            list.forEach((item) => {
                const jml_dm = item.querySelector('div.denom-section > div.denom-section__titles > div > span');
                const harga = item.querySelector('div.price-section > div.price-section__price > div');
                
                results.push({ dm: jml_dm.textContent, harga: harga.textContent });
            });
            return results;
        });
        
        let reply = `*Top up Mobile Legends*\n\n_*Items:*_`
        let no = 1;

        for(let i of items) {
            reply += `\n[${ no }] *Jumlah Diamond:* ${ i.dm }💎\n*Harga:* ${ i.harga }💰\n`
            no+=1;
        }

        await msg.reply(reply)
        .catch(() => {
            chat.sendMessage(reply);
        })
        await msg.reply('pilih items berdasarkan indeksnya\n\nlalu reply pesan ini dengan format */topup ml [id] [id_zone] [items] [email]*')
        .catch(() => {
            chat.sendMessage('pilih items berdasarkan indeksnya\n\nlalu reply pesan ini dengan format */topup ml [id] [id_zone] [items] [email]*')
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

const topup = async (msg, sender, id, zoneid, index_items, email, client) => {

    console.log(`\nfrom\t\t:`.green + `${ sender }`.gray.bold);
    console.log(`fitur\t\t:`.green + `/topupml`.gray.bold);
    console.log(`pesan\t\t:`.green + `${ msg.body }`.gray.bold);

    let browser;
    
    if(index_items == 1) {
        return msg.reply('item pertama tidak bisa dipilih silahkan pilih item lain');
    } 
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
            width: 1600,
            height: 1800
        });

        await page.goto('https://www.codashop.com/id-id/mobile-legends');

        console.log(`id: ${ id }\nid_zone: ${ zoneid }\nItems: ${ index_items }`);

        page.setDefaultTimeout(30000);

        // Ambil screenshot halaman sebelum navigasi
        await page.screenshot({ path: './database/screenshot_before.png' });

        // Mengetik teks ke dalam form input
        await page.waitForSelector('#userId');
        await page.type('#userId', id);
        await page.type('#zoneId', zoneid);
        await page.type("#email", email);

        // Tunggu hingga elemen muncul sebelum mengambil data
        await page.waitForSelector('#voucher > ul.denomination-card-group');
        // Mengambil data dari selector

        
        await page.evaluate((index_items) => {
            let pilihan = index_items - 1;
            console.log(pilihan)
            const ulElement = document.querySelector('#voucher > ul.denomination-card-group');
            const list = ulElement.querySelectorAll('li');
            list.forEach((item, index) => {
                if (index == pilihan) {
                    item.click();
                }
            });
        }, index_items);

        // pilih pembayaran qris
        await page.click("#paymentChannel_906");

        // submit
        await page.click("#mdn-submit");

        await page.waitForTimeout(5000);

        await page.waitForSelector("div.product__container > div > div > div > div.modal-body > div > span")
        const status = await page.evaluate(() => {
            const Element = document.querySelector("div.product__container > div > div > div > div.modal-body > div > span");

            let results;

            const username = Element.querySelector("div:nth-child(1) > div > div.second-col")
            const id = Element.querySelector("div:nth-child(2) > div > div.second-col")
            const payment = Element.querySelector("div:nth-child(3) > div > div.second-col")
            const harga = Element.querySelector("div:nth-child(4) > div > div.second-col")

            results = { username: username.textContent, id: id.textContent, payment: payment.textContent, harga: harga.textContent };

            return results;
        });
        await page.screenshot({ path: './database/screenshot_after.png' });

        await page.waitForSelector("div.product__container > div > div > div > div.modal-footer.bg-white > button.btn-default.btn-multiple")

        await page.click("div.product__container > div > div > div > div.modal-footer.bg-white > button.btn-default.btn-multiple")

        await page.waitForTimeout(5000);

        await page.screenshot({ path: './database/screenshot_after2.png' });

        await page.waitForSelector("#airtime_iframe")
        const frame = await page.frames().find(frame => frame.name() === 'airtime_iframe');
        const src = await frame.evaluate(() => {
            const imgElement = document.querySelector('#qrcode > img');
            return imgElement ? imgElement.src : null;
        });

        const details = status;
        console.log(details)

        download(src, sender)
        .then(result => {
            let timer = (1000 * 60) * 14;
            const listener = async (send) => {
                const pesan = send.body;
                
                if(send.fromMe && pesan.includes(`*Username:* ${ details.username }`) && pesan.includes('*Payment:*')) {
                    console.log('ini jalan');
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
            chat.sendMessage(media, { caption: `*Username:* ${ details.username }\n*ID:* ${ details.id }\n*Payment:* ${ details.payment }\n*Email:* ${ email }\n*Harga:* ${ details.harga }` })
            .then(() => {
                msg.reply('Cocokkan kembali data diatas dengan akun Mobile Legends kamu, QRCode hanya berlaku selama 15 Menit. Bukti pembayaran akan masuk ke email yang kamu kirim (Silahkan cek email jika telah melakukan pembayaran)\n\n*Note:*\n_Admin tidak bertanggung jawab atas segala kegagalan transaksi_')
                .catch(() => {
                    msg.reply('Cocokkan kembali data diatas dengan akun Mobile Legends kamu, QRCode hanya berlaku selama 15 Menit. Bukti pembayaran akan masuk ke email yang kamu kirim (Silahkan cek email jika telah melakukan pembayaran)\n\n*Note:*\n_Admin tidak bertanggung jawab atas segala kegagalan transaksi_')
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
        msg.reply('sepertinya data yang kamu masukkan salah, kirim kembali dengan format */topup ml [id] [zone_id] [item] [email]*')
        .catch(() => {
            chat.sendMessage('sepertinya data yang kamu masukkan salah, kirim kembali dengan format */topup ml [id] [zone_id] [item] [email]*');
        })
        await browser.close();
        console.log(e);
    }
    
}


const download = async (url, sender) => {
    return new Promise((resolve, reject) => {
        const path = `./database/topupml_${ sender }.png`;
        const base64Data = url.replace(/^data:image\/png;base64,/, '');
      
        const writeStream = fs.createWriteStream(path, { encoding: 'base64' });
        writeStream.write(base64Data, 'base64');
        writeStream.end();
      
        writeStream.on('finish', () => {
            resolve(path);
        });
      
        writeStream.on('error', (error) => {
            console.error(error);
            reject(error);
        });
    });
      
};

// scrape();
module.exports = {
    topup_cek, topup
}
