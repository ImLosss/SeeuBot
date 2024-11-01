const puppeteer = require('puppeteer');
const { MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');

const cekTranskrip = async (msg, client, sender) => {
    let browser, dialogHandler;
    const chat = await msg.getChat();
    try {
        let url = msg.body;
        url = url.split(' ');
        if(url.length <= 1) return msg.reply('Format anda salah, kirim kembali dengan format /cektranskrip [stb/nim]').catch(() => { chat.sendMessage('Format anda salah, kirim kembali dengan format /cektranskrip [stb/nim]') });
        url = url[1];
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox'],
            executablePath: '/usr/bin/chromium-browser'
         });

        // Membuat URL baru dengan parameter pencarian
        const newUrl = `https://siaka.undipa.ac.id/print.transkrip.php?stb=${encodeURIComponent(url)}`;

        console.log(newUrl);

        const page = await browser.newPage();

        // Mencegah dialog cetak
        dialogHandler = async (dialog) => {
            console.log(`Dialog message: ${dialog.message()}`);
            await dialog.dismiss();
        };

        // Mencegah dialog cetak
        page.on('dialog', dialogHandler);

        // Set header User-Agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36');

        await page.setDefaultTimeout(15000);

        
        await page.goto(newUrl);

        await page.waitForSelector('body > div > table:nth-child(3) > tbody > tr:nth-child(2) > td > table.table-common > tbody > tr:nth-child(3)')

        // Ambil screenshot halaman sebelum navigasi
        await page.screenshot({ path: './database/transkrip.png', fullPage:true });

        const media = MessageMedia.fromFilePath('./database/transkrip.png')

        chat.sendMessage(media, "Berhasil🔥")
        .then(() => {
            fs.unlinkSync('./database/transkrip.png');
        })

        // Hapus listener dialog setelah tidak diperlukan lagi
        page.off('dialog', dialogHandler);

        return await browser.close();
    } catch (err) {
        console.log(err)
        msg.reply('Tidak menemukan data atau siaka sedang down').catch(() => { chat.sendMessage('Terjadi kesalahan atau siaka sedang down') });
        page.off('dialog', dialogHandler);
        return await browser.close();
    }
}

module.exports = {
    cekTranskrip
}