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
const { cekTranskrip } = require('./feature/cekTranskrip.js');

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
    authStrategy: new LocalAuth(),
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

        console.log(msg.from);

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
        if (prefix.some(pre => text.startsWith(`${pre}topup ml`))) {
            if(prefix.some(pre => text === `${pre}topup ml`)) {
                topup_cek(msg);
            } else if(prefix.some(pre => text.startsWith(`${pre}topup ml`)) && cmd.length == 6) {
                await topup(msg, sender, cmd[2], cmd[3], cmd[4], cmd[5], client);
            }
        } else if (prefix.some(pre => text.startsWith(`${pre}topup genshin`))) {
            if(prefix.some(pre => text === `${pre}topup genshin`)) {
                topup_cek_genshin(msg);
            } else if(prefix.some(pre => text.startsWith(`${pre}topup genshin`)) && cmd.length == 6) {
                let timer = null;
                const listener = async (msg2) => {
                    const pesan = msg2.body
                    if (msg2.hasQuotedMsg) {
                        const reply = await msg2.getQuotedMessage();
                        const msg_reply = reply.body;
                        if((pesan == 1 || pesan == 2) && msg_reply.includes('Silahkan pilih metode pembayaran :')) {
                            clearTimeout(timer);
                            reply.delete(true);
                            let payment = undefined;
                            if(pesan == 1) {
                                payment = '#paymentChannel_227';
                            } else if (pesan == 2) {
                                payment = '#paymentChannel_233';
                            }
                            await topup_genshin(msg, sender, cmd[2], cmd[3], cmd[4], cmd[5], payment, client);
                        } else if (msg_reply.includes('Silahkan pilih metode pembayaran :')) {
                            msg.reply('harap reply pesan sesuai indeks diatas');
                        }
                    }
                    if(pesan.includes("Silahkan pilih metode pembayaran :")) {
                        timer = setTimeout(async => {
                            msg2.delete(true);
                        },29000)
                    }
                };
                // Menambahkan listener ke chat
                client.addListener('message_create', listener);
                // Mengatur waktu tunggu maksimum
                setTimeout(() => {
                    // Timeout tercapai, menghentikan listener dan membersihkan listener
                    client.removeListener('message_create', listener);
                }, 30000); // 30 detik (dalam milidetik)
                msg.reply('Silahkan pilih metode pembayaran :\n[1] Gopay\n[2] Shopeepay\n\n_*Reply pesan ini sesuai Indeks*_')
            }
        } 
        else if(prefix.some(pre => text == `${pre}animedl`)) await animedl(msg, client, sender);
        else if (prefix.some(pre => text === (`${pre}topanime`))) await topanime(msg, sender);
        else if(prefix.some(pre => text.startsWith(`${pre}cektranskrip`))) await cekTranskrip(msg, sender, client);
        
        //kick member
        // else if (text.startsWith("/kickme") && chat.isGroup) {
        //     const authorId = msg.author;
        //     let participantIds = [`${ authorId }`];
        //     for (let participant of chat.participants) {
        //         if (participant.id._serialized === authorId) {
        //             chat.removeParticipants(participantIds);
        //             console.log('Anda telah dikeluarkan dari grup.');
        //             break; // Berhenti setelah menemukan pengguna yang sesuai
        //         }
        //     }
        // }
    } catch(err) {
        console.log(err)
        msg.reply('Error')
        .catch(() => {
            client.sendMessage(msg.from, 'Error');
        })
    }

});

client.initialize();