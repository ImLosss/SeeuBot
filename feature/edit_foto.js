const axios = require('axios');
const { API_KEY_RM_BG } = require('../config');
const { ceklimit } = require('./function');

//color set
const reset = '\x1b[0m';
const red = '\x1b[31m';
const green = '\x1b[32m';
const abu = '\x1b[90m';
const abubold = '\x1b[90m\x1b[1m'

const EditPhotoHandler = async (text, msg, sender) => {

    const chat = await msg.getChat();
    if(!chat.isGroup) {
        const limit = await ceklimit(sender);
        if(limit) return msg.reply('Jumlah pemakaian Private anda hari ini telah mencapai batas, anda dapat menggunakan command kembali besok. Masuk ke grup SeeuBot agar dapat menggunakan command kembali:\n\nhttps://chat.whatsapp.com/Jy1xiPwFMl6I5TaVciJA3P');
    }

    console.log(green + '\nfrom\t:' + reset, abu + `+${ sender }`);
    console.log(green + 'fitur\t:' + reset, abubold + `/bgr [color]` + reset);

    const cmd = text.split(' ');
    if (cmd.length < 2) {
        return msg.reply('Format Salah. ketik */bgr [color]*');
    }

    if (msg.hasMedia) {
        if (msg.type != 'image') {
            return msg.reply('hanya bisa edit dengan format image.');
        }

        msg.reply('sedang diproses, tunggu bentar ya.');

        const media = await msg.downloadMedia();

        if (media) {
            const color = cmd[1];
            const newPhoto = await EditPhotoRequest(media.data, color)

            if (!newPhoto.success) {
                return msg.reply('Terjadi kesalahan.');
            }

            const chat = await msg.getChat();
            media.data = newPhoto.base64;
            chat.sendMessage(media, { caption: 'ini hasilnya' })
        }
    } else {
        msg.reply('gambarnya mana???');
    }
}

const EditPhotoRequest = async (base64, bg_color) => {

    const result = {
        success: false,
        base64: null,
        message: "",
    }

    return await axios({
        method: 'post',
        url: 'https://api.remove.bg/v1.0/removebg',
        data: {
            image_file_b64: base64,
            bg_color: bg_color
        },
        headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
            "X-Api-Key": API_KEY_RM_BG,
        },
    })
        .then((response) => {
            if (response.status == 200) {
                result.success = true;
                result.base64 = response.data.data.result_b64
            } else {
                result.message = "Failed response";
            }

            return result;
        })
        .catch((error) => {
            result.message = "Error : " + error.message;
            console.log(red + 'error\t:' + reset, abubold + error.message + reset);
            return result;
        });
}


module.exports = {
    EditPhotoHandler
}
