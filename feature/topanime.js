const puppeteer = require('puppeteer');
const fs = require('fs');
const axios = require('axios');
const { MessageMedia } = require('whatsapp-web.js');
const { ceklimit } = require('./function');


const topanime = async (msg, sender) => {
    let browser;
    try {

        const chat = await msg.getChat();

        if(!chat.isGroup) {
            const limit = await ceklimit(sender);
            if(limit) return msg.reply('Jumlah pemakaian Private anda hari ini telah mencapai batas, anda dapat menggunakan command kembali besok. Masuk ke grup SeeuBot agar dapat menggunakan command kembali:\n\nhttps://chat.whatsapp.com/IX4rq2WWN72BOEcvk46wnv');
        }

        browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Set a user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36');

        await page.setViewport({
            width: 1920,
            height: 1280
        });

        await page.goto('https://www.bilibili.tv/id/trending');

        page.setDefaultTimeout(5000);

        // Ambil screenshot halaman sebelum navigasi
        await page.screenshot({ path: './database/screenshot_before.png' });

        // Tunggu hingga elemen muncul sebelum mengambil data
        await page.waitForSelector('div.trending-card__videolist > section > ul');

        // Mengambil data dari selector
        const data = await page.evaluate(() => {
            const ulElement = document.querySelector('div.trending-card__videolist > section > ul');
            const items = ulElement.querySelectorAll('div.bstar-video-card__text-wrap');
            const results = [];

            items.forEach((item) => {
                const title = item.querySelector('p');
                const view =  item.querySelector('span.videocard-slot__playinfo-text.videocard-slot__playinfo-vv')
                const comment =  item.querySelector('span.videocard-slot__playinfo-text.videocard-slot__playinfo-dm')
                
                results.push({title: title.textContent, view: view.textContent, comment: comment.textContent });
            });

            return results;
        });      
        let reply = `╓───▷「 *Top Anime* 」
║ 
║ _Sumber: Bstation_
║ `
        let no = 1;
        for (let item of data) {
            let title = item.title;
            if (title.length > 30) {
                title = title.slice(0, 30) + "...";
            }
            reply += `\n╟───「 *${ no }* 」
║ *${ title }*
║ *View:* ${ item.view } 
║ *Comment:* ${ item.comment } `;
            no += 1
        }
        msg.reply(reply + `\n╙───▷`)
        .catch(() => {
            chat.sendMessage(reply + `\n╙───▷`)
        })
        await browser.close();
    } catch (e) {
        msg.reply('Terjadi kesalahan saat mengambil data, coba kembali dalam beberapa menit')
        .catch(() => {
            chat.sendMessage('Terjadi kesalahan saat mengambil data, coba kembali dalam beberapa menit')
        })
        console.log(e);
        await browser.close();
    }
}

// scrape();
module.exports = {
    topanime
}
