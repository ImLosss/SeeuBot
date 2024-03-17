const col = require('colors');
const fs = require('fs');
const { MessageMedia } = require('whatsapp-web.js');
const { ceklimit } = require('./function');

const stiker = async (msg, sender, client) => {
    const chat = await msg.getChat();

    if(!chat.isGroup) {
        const limit = await ceklimit(sender);
        if(limit) return msg.reply('Jumlah pemakaian Private anda hari ini telah mencapai batas, anda dapat menggunakan command kembali besok. Masuk ke grup SeeuBot agar dapat menggunakan command kembali:\n\nhttps://chat.whatsapp.com/Jy1xiPwFMl6I5TaVciJA3P');
    }

    console.log('\nfrom\t\t:'.green + `+${ sender }`.gray);
    console.log('fitur\t\t:'.green + `!s`.gray.bold);
     // Mendapatkan nama file dari URL media
     const filename = 'gambar.jpeg';
     let media = undefined;

    if(msg.hasMedia && msg.type == 'image') {
        media = await msg.downloadMedia();
    } else if(msg.hasQuotedMsg) {
        const reply = await msg.getQuotedMessage();
        if(reply.hasMedia && reply.type == 'image') {
            media = await reply.downloadMedia();
        } else {
            return msg.reply('Gambarnya mana???');
        }
    } else {
        return msg.reply('Gambarnya mana???');
    }
    msg.reply('[⏳] Tunggu sebentar...');
    try {
        client.sendMessage(msg.from, media, {
                sendMediaAsSticker: true
            })
            .then(() => {
                chat.sendMessage("*[✅]* Successfully!");
            });
    } catch(error) {
        chat.sendMessage("*[❎]* Failed!");
        console.log('error\t\t:'.red + `${ error.message }`.gray);
    }
}

module.exports = {
    stiker
}