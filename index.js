const qr = require('qrcode');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const {Client, LocalAuth, Buttons, MessageMedia } = require('whatsapp-web.js');
const { EditPhotoHandler } = require('./feature/edit_foto');
const { ChatAIHandler } = require('./feature/chat_ai');
const { yta } = require('./feature/yta.js');
const { ytv } = require('./feature/ytv.js');
const { stiker } = require ('./feature/stiker.js');
const { gombal } = require ('./feature/gombal.js');
const { yts } = require('./feature/yts');
const { absensiHandler } = require('./feature/absen');
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
const { bugreport, limit, newupdate, setName, setLang, resetLimit, backup_database, sendupdate, ceklist_user, delAPI, updateAPI } = require('./feature/function');
const { getTime } = require('./feature/function_chatGPT');
const { ai } = require('./feature/prodia');
const { emptyTrash } = require('./feature/drive');
const { musicinfo } = require('./feature/musicinfo');
const { animedl } = require('./feature/animedl');
const { mediafire } = require('./feature/mediafire');
const { edenHandler } = require('./feature/edenAI.js');
const { todocx } = require('./feature/pdfToDocx.js');
const fungsi = require('./feature/function.js');

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

const wwebVersion = '2.2407.3';
const client = new Client({
    ffmpeg: ffmpegPath,
    authStrategy: new LocalAuth(),
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    webVersionCache: {
        type: 'remote',
        remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${wwebVersion}.html`,
    },
    puppeteer: {
        headless: true,
        args: ['--no-sandbox'],
        executablePath: "/usr/bin/chromium-browser"
    }
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

        if (prefix.some(pre => text === `${pre}test`)) {
            const media = MessageMedia.fromFilePath('./database/thumbyta.jpg');

            chat.sendMessage(media);
        }

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

    let contacts = [];
    let fromMe = false;
    for (const item of notification.recipientIds) {
        let contact = await client.getContactById(item);
        contacts.push(contact);
        if(contact.id.user == "6288809606244") fromMe = true;
    }

    if ((notification.type === 'add' || notification.type === 'invite') && (chat.isGroup && fromMe)) {
        const author = await client.getContactById(notification.author);
        let mentions = [];
        mentions.push(author);
        chat.sendMessage(`🤖 *Halo! Saya adalah SeeU, Asisten Bot Grup ini!*\n\nSaya di invite oleh @${ author.id.user }! Saya di sini untuk membantu dan memiliki sejumlah fitur yang dapat digunakan. Kirim */menu* untuk melihat daftar command yang dapat digunakan. Terima kasih! 🌟`, { mentions });
    } else if (notification.type === 'add' || notification.type === 'invite' && chat.isGroup) {
        for (const item of contacts) {
            let mentions = [item];
            chat.sendMessage(`hello @${ item.id.user } Selamat bergabung di grup *${ chat.name }*.`, { mentions })
        }
    }
});

client.initialize();