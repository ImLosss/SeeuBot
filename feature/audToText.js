const axios = require('axios');
const fs = require('fs');
const { API_KEY_OPEN_AI } = require('../config.js');
const { ceklimit } = require('./function.js');

let status = false;

async function audtotext(msg, sender) {
    const chat = await msg.getChat();

    if(!chat.isGroup) {
        const limit = await ceklimit(sender);
        if(limit) return msg.reply('Jumlah pemakaian Private anda hari ini telah mencapai batas, anda dapat menggunakan command kembali besok. Masuk ke grup SeeuBot agar dapat menggunakan command kembali:\n\nhttps://chat.whatsapp.com/IX4rq2WWN72BOEcvk46wnv');
    }

    const path = './database/totext.mp3';

    try {
        if(status) return msg.reply('Fitur sedang digunakan, coba kembali setelah 1 menit');
        let lang = msg.body;

        console.log('\nfrom\t\t:'.green + `+${ sender }`.gray);
        console.log('fitur\t\t:'.green + `/audToText`.gray.bold);
        console.log('pesan\t\t:'.green + `${ lang }`.gray);

        lang = lang.split(' ');
        let media = null;
        if(lang.length < 2) {
            lang = ''
        } else {
            lang = lang[1];
        }
        if(msg.hasMedia && msg._data.mimetype == 'audio/aac' || msg._data.mimetype == 'audio/ogg; codecs=opus' || msg._data.mimetype == 'audio/mpeg') {
            if(msg._data.size > 15 * 1024 * 1024) return msg.reply('Ukuran file terlalu besar (maks: 15mb)');
            media = await msg.downloadMedia();
            status = true;
            fs.writeFileSync(path, media.data, 'base64');
        } else if(msg.hasQuotedMsg) {
            const reply = await msg.getQuotedMessage();
            if(reply.hasMedia && reply._data.mimetype == 'audio/aac' || reply._data.mimetype == 'audio/ogg; codecs=opus' || reply._data.mimetype == 'audio/mpeg') {
                if(reply._data.size > 15 * 1024 * 1024) return msg.reply('Ukuran file terlalu besar (maks: 15mb)');
                status = true;
                media = await reply.downloadMedia();
                fs.writeFileSync(path, media.data, 'base64');
            } else {
                return msg.reply('Audionya mana???');
            }
        } else {
            return msg.reply('Audionya mana???');
        }

        const formData = {
            file: fs.ReadStream(path),
            model: 'whisper-1',
            response_format: 'text',
            language: lang
        };

        const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${API_KEY_OPEN_AI}`,
            },
            timeout: 60000
        });

        return msg.reply(response.data)
        .catch(() => {
            chat.sendMessage(response.data)
            .then(() => {
                status = false;
            })
        })
        .then(() => {
            status = false;
        })
    } catch (error) {
        let err = 'Error: ' + (error.response ? error.response.data : error.message)
        console.error(err);
        return msg.reply(err)
        .catch(() => {
            chat.sendMessage(err)
            .then(() => {
                status = false;
            })
        })
        .then(() => {
            status = false;
        })
    }
}

module.exports = {
    audtotext
}
