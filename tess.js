const qr = require('qrcode');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const {Client, LocalAuth, Buttons, MessageMedia } = require('whatsapp-web.js');
const { EditPhotoHandler } = require('./feature/edit_foto');
const { ChatAIHandler, ChatAI } = require('./feature/chat_ai');
const { yta } = require('./feature/yta.js');
const { ytv } = require('./feature/ytv.js');
const { stiker } = require ('./feature/stiker.js');
const { gombal } = require ('./feature/gombal.js');
const { yts } = require('./feature/yts');
const { absen } = require('./feature/absen');
const { animesearch } = require('./feature/animesearch');
const { animeinfo } = require('./feature/animeinfo');
const { igdl } = require('./feature/igdl');
const { pinterest, pint_send } = require('./feature/pinterest');
const { antitoxic, cek_word } = require('./feature/antitoxic');
const { tiktokdl } = require('./feature/tiktokdl');
const { fbdl } = require('./feature/fbdl');
const { topanime } = require('./feature/topanime');
const { topup_cek, topup } = require('./feature/topup');
const { topup_cek_genshin, topup_genshin } = require('./feature/topup_genshin');
const { ythd } = require('./feature/ythd');
const ffmpegPath = require('ffmpeg-static');
const { topdf } = require('./feature/topdf');
const { audtotext } = require('./feature/audToText');
const { bugreport, limit, newupdate, setName, setLang, resetLimit, backup_database, sendupdate, ceklist_user, updateAPI, delAPI } = require('./feature/function');
const { getTime } = require('./feature/function_chatGPT');
const { ai } = require('./feature/prodia');
const { emptyTrash } = require('./feature/drive');
const { musicinfo } = require('./feature/musicinfo');
const { animedl } = require('./feature/animedl');
const { mediafire } = require('./feature/mediafire');

const menu2 = `╓──▷「 *Menu Command* 」
║ Author : Ryan_syah
║ Bot_name : Seeu
╟────「 *List Command* 」
║ ▹/menu
║ ▹/bgr [color]
║ ▹/seeu [question]
║ ▹/s
║ ▹/ai [prompt]
║ ▹/animesearch [title]
║ ▹/pinterest [search]
║ ▹/topanime
║ ▹/topup ML
║ ▹/topup Genshin
║ ▹/toPdf
║ ▹/audtotext (language)
║ ▹/musicInfo [title]
║ ▹/bugReport [Message]
║ ▹/limit
║ ▹/update
╟───「 *Content Downloader* 」
║ ▹/yta [link] (file_name)
║ ▹/ytv [link] (file_name)
║ ▹/ythd [link] (file_name)
║ ▹/yts [search]
║ ▹/igdl [link]
║ ▹/fbdl [link]
║ ▹/tiktokdl [link]
║ ▹/animedl
╟───「 *Command Group* 」
║ ▹/hidetag [pesan]
║ ▹/antitoxic [on/off/add/list/remove]
║ ▹/everyone
║ ▹/absen (menit)
╟─────「 *example* 」
║ ▹/yta https://www.youtube.com
║ ▹/s (send with image)
║ ▹/ask haloo
║ ▹/yts lemon kobasolo
╟─────「 *How to use* 」
║ Kamu bisa menanyakan cara 
║ penggunaan tiap Command
║ dengan mengirim pesan
║ */seeu cara menggunakan*
║ *fitur [command]*
╟─────「 *Note* 」
║ ▹ tanda [ ] pada command *wajib* di
║   isi
║ ▹ tanda ( ) pada command bisa
║   diabaikan
║ ▹ Harap gunakan perintah dengan 
║   bijak
╙───────────────▷`

const wrong_format = `Maaf, pesan Anda tidak dapat dipahami. Berikut adalah menu command yang dapat Anda gunakan:

- /menu
- /bgr [color]
- /seeu [question]
- /s
- /yta [link] (file_name)
- /ytv [link] (file_name)
- /ythd [link] (file_name)
- /yts [search]
- /ai [prompt]
- /animesearch [title]
- /igdl [link]
- /fbdl [link]
- /tiktokdl [link]
- /pinterest [search]
- /topanime
- /topup ML
- /topup Genshin
- /toPdf
- /audtotext (language)
- /musicInfo [title]
- /animedl
- /bugReport [Message]
- /limit
- /update

Jika Anda memiliki pertanyaan tentang cara menggunakan fitur tertentu, Anda dapat mengirim pesan dengan format /seeu cara menggunakan [command].`


const client = new Client({
    ffmpeg: ffmpegPath,
    authStrategy: new LocalAuth()
});

client.on('qr', qrdata => {
    qrcode.generate(qrdata, {
        small: true
    })
    // Generate QR code as a data URI
    qr.toDataURL(qrdata, (err, url) => {
        if (err) {
            console.error('Failed to generate QR code:', err);
            return;
        }
    
        // Save QR code data URI as an image file
        const qrCodeFilePath = 'qrcode.png';
        const dataUri = url.split(',')[1];
        const buffer = Buffer.from(dataUri, 'base64');
        
        fs.writeFile(qrCodeFilePath, buffer, (err) => {
        if (err) {
            console.error('Failed to save QR code as an image:', err);
        } else {
            console.log('QR code successfully saved as', qrCodeFilePath);
        }
        });
    });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async msg => {
    try {
        const chat = await msg.getChat();

        ceklist_user(msg.from);

        const prefix = ['!', '/', '.'];

        chat.sendSeen();
        client.sendPresenceAvailable();

        const text = msg.body.toLowerCase() || '';

        let cmd = text.split(' ');

        chat.sendSeen;

        const authorId = msg.author;
        let isAdmin = false;
        let sender = msg.from;

        if(chat.isGroup) {
            sender = msg.author;
            for(let participant of chat.participants) {
                if(participant.id._serialized === authorId && participant.isAdmin) {
                    isAdmin = true;
                    break;
                }
            }
        }

        const dir_data_user = `./database/data_user/${ sender }`
        if(!fs.existsSync(dir_data_user)) {
            let time = await getTime();
            time = JSON.parse(time);
            console.log(time)
            console.log(time.date)
            let data_user = [{
                name: null,
                limit: 35,
                chatLanguage: null,
                aiModel: "anythingV5_PrtRE.safetensors [893e49b9]",
                day: time.date,
                level: null
            }]
            fs.writeFileSync(dir_data_user, JSON.stringify(data_user));
        }

        console.log(text)

        if(prefix.some(pre => text.startsWith(`${pre}test`))) await ChatAIHandler(text, msg, sender);
        else if(prefix.some(pre => text.startsWith(`${pre}updateapi`))) await updateAPI(msg, sender);
        else if(prefix.some(pre => text == `${pre}delapi`)) await delAPI(sender, msg);
        else if (prefix.some(pre => text.startsWith(`${ pre }tess`))) await mediafire(msg, sender);
    } catch(err) {
        console.log(err)
        msg.reply('Error')
        .catch(() => {
            client.sendMessage(msg.from, 'Error');
        })
    }

});

client.on('group_leave', async (notification) => {
    const contact = await client.getContactById(notification.id.participant);
    const chat = await notification.getChat();
    mentions = [];
    mentions.push(contact);
    if (notification.type === 'leave' && chat.isGroup) {
        chat.sendMessage(`Member @${contact.id.user} telah keluar dari grup.`, { mentions });
    } else if (notification.type === 'remove' && chat.isGroup) {
        chat.sendMessage(`Member @${contact.id.user} telah dikick dari grup.`, { mentions });
    }
});

client.on('group_join', async (notification) => {
    const chat = await notification.getChat();
    const contact = await client.getContactById(notification.id.participant);
    mentions = [];

    mentions.push(contact);
    if (notification.type === 'add' || notification.type === 'invite' && chat.isGroup) {
        const chat = await notification.getChat();
        chat.sendMessage(`hello @${ contact.id.user } Selamat bergabung di grup ${ chat.name }.`, { mentions });
    }
});

client.initialize();