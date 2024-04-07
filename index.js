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
    webVersionCache: {
        type: 'remote',
        remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${wwebVersion}.html`,
    },
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

        if (prefix.some(pre => text.startsWith(`${pre}ask`)) || prefix.some(pre => text.startsWith(`${pre}seeu`))) {
            cmd[0] = cmd[0].toLowerCase();
            if(prefix.some(pre => cmd[0] === `${pre}seeu`) && cmd[1] != null || prefix.some(pre => cmd[0] === `${pre}ask`) && cmd[1] != null) {
                await ChatAIHandler(text, msg, sender);
            } else if (cmd[1] == null && prefix.some(pre => cmd[0] === `${pre}seeu`) || cmd[1] == null && prefix.some(pre => cmd[0] === `${pre}ask`)) {
                msg.reply('tchh, pertanyaannya mana???');
            } else {
                msg.reply('sepertinya formatmu salah, kirim kembali dengan format */ask [pertanyaan]*');
            }
        } else if (prefix.some(pre => text == `${pre}menu`)) {
            const menu = fungsi.getMenu();
            msg.reply(menu);
        } else if (prefix.some(pre => text.startsWith(`${pre}bgr`))) await EditPhotoHandler(text, msg, sender);
        
        else if (prefix.some(pre => text.startsWith(`${pre}sapa`)) && chat.isGroup) {
            let text = "";
            let mentions = [];

            const participants = chat.participants;
            const randomIndex = Math.floor(Math.random() * participants.length);

            const randomParticipant = participants[randomIndex];
            const contact = await client.getContactById(randomParticipant.id._serialized);

            mentions.push(contact);
            text += `@${randomParticipant.id.user} `;

            await chat.sendMessage(text, {
                mentions
            });
        } else if(prefix.some(pre => text.startsWith(`${pre}yts`))) await yts(msg);
        else if (prefix.some(pre => text.startsWith(`${pre}yta`))) await yta(msg, sender, client);
        else if (prefix.some(pre => text.startsWith(`${pre}ytv`))) await ytv(msg, sender, client);
        else if (prefix.some(pre => text.startsWith(`${pre}ythd`))) await ythd(msg, sender, client);
        else if (prefix.some(pre => text === `${pre}s`)) await stiker(msg, sender, client);
        else if (prefix.some(pre => text === `${pre}deldrive`)) await emptyTrash(msg);
        else if(prefix.some(pre => text.startsWith(`${pre}gombal` && chat.isGroup))){
            if(prefix.some(pre => cmd[0] === `${pre}gombal`)) {
                const mentionedIds = msg.mentionedIds;
                console.log("ini :",mentionedIds);
                for(let participant of chat.participants){
                    let text = "";
                    let mentions = [];
                    if(participant.id._serialized == mentionedIds){
                        const contact = await client.getContactById(participant.id._serialized);
                        mentions.push(contact);
                        text += `@${participant.id.user} `;
                        await gombal(msg, text, mentions);
                    }
                }
            }
        } else if (prefix.some(pre => text === `${pre}everyone`) && chat.isGroup && isAdmin){
            let text = "";
            let mentions = [];
        
            for (let participant of chat.participants) {
                const contact = await client.getContactById(participant.id._serialized);
        
                mentions.push(contact);
                text += `@${participant.id.user} `;
            }
        
            await chat.sendMessage(text, { mentions });          
        } else if(prefix.some(pre => text.startsWith(`${ pre }absen`) || text.startsWith(`${ pre }hadir`) || text.startsWith(`${ pre }hadirc`)  || text == `${ pre }close`) && chat.isGroup) await absensiHandler(msg, sender, isAdmin)
        else if(prefix.some(pre => text.startsWith(`${pre}animesearch`))){
            if(chat.isGroup){
                sender = msg.author;
            } else {
                sender = msg.from;
            }
            if(prefix.some(pre => cmd[0] === `${pre}animesearch`) && cmd[1] != null) {
                await animesearch(msg, sender);
            } else {
                msg.reply('sepertinya formatmu salah, kirim kembali dengan format */animesearch [search]*');
            }
        } else if(prefix.some(pre => text.startsWith(`${pre}animeinfo`))){
            if(chat.isGroup){
                sender = msg.author;
            } else {
                sender = msg.from;
            }
            if(prefix.some(pre => cmd[0] === `${pre}animeinfo`) && cmd[1] != null) {
                await animeinfo(msg, sender);
            } else {
                msg.reply('sepertinya formatmu salah, kirim kembali dengan format */animeinfo [id_anime]*');
            }
        } else if (prefix.some(pre => text.startsWith(`${pre}igdl`))) {
            let url = msg.body;
            url = url.split(' ');
            url = url[1];
            if(prefix.some(pre => cmd[0] === `${pre}igdl`) && cmd[1] != null) {
                await igdl(msg, url, sender, client);
            } else {
                msg.reply('sepertinya formatmu salah, kirim kembali dengan format */igdl [link]*');
            }
        } else if (prefix.some(pre => text.startsWith(`${pre}tiktokdl`))) await tiktokdl(msg, sender);
        else if (prefix.some(pre => text === (`${pre}topanime`))) await topanime(msg, sender);
        else if (prefix.some(pre => text.startsWith(`${pre}fbdl`))) {
            let url = msg.body;
            url = url.split(' ');
            url = url[1];
            if(prefix.some(pre => cmd[0] === `${pre}fbdl`) && cmd[1] != null) {
                await fbdl(msg, url, sender);
            } else {
                msg.reply('sepertinya formatmu salah, kirim kembali dengan format */fbdl [link]*');
            }
        } else if (prefix.some(pre => text.startsWith(`${pre}audtotext`))) await audtotext(msg, sender);
        else if (prefix.some(pre => text.startsWith(`${pre}pinterest`))) {
            if(prefix.some(pre => cmd[0] === `${pre}pinterest`) && cmd[1] != null) {
                await pinterest(msg, msg.from);
            } else {
                msg.reply('sepertinya formatmu salah, kirim kembali dengan format */pinterest [search]*');
            }
        } else if (prefix.some(pre => text === `${pre}next`)) await pint_send(msg, msg.from);
        else if (prefix.some(pre => text.startsWith(`${pre}antitoxic`)) && chat.isGroup) {
            if(prefix.some(pre => cmd[0] === `${pre}antitoxic`) && cmd[1] != null) {
                if (isAdmin) {
                    for(let participant of chat.participants) {
                        if(participant.id._serialized === msg.author) {
                            if(participant.isAdmin){
                                await antitoxic(text, msg, msg.from);
                            }else if(cmd[1] == 'list') {
                                await antitoxic(text, msg, msg.from);
                            } else {
                                msg.reply('command khusus Admin');
                            }
                        }
                    }
                } else {
                    msg.reply(`Sebelum menggunakan command ini, jadiin ${ client.info.pushname } admin dlu dong...`);  
                }
            } else {
                msg.reply('sepertinya formatmu salah, kirim kembali dengan format */antitoxic [on/off/add/list]*');
            }
        } else if (prefix.some(pre => msg.body.startsWith(`${pre}hidetag`)) && chat.isGroup) {
            const authorId = msg.author;
            let pesan = msg.body;
            pesan = pesan.split(' ');
            if (pesan.length >= 2) {
                pesan = pesan.slice(1,pesan.length);
                pesan = pesan.join(" ");
            }

            if (pesan[1] == null) {
                return msg.reply('pesannya mana?');
            }
            for(let participant of chat.participants) {
                if(participant.id._serialized === authorId) {
                    let text = "";
                    let mentions = [];
                
                    for (let participant of chat.participants) {
                    const contact = await client.getContactById(participant.id._serialized);
                
                    mentions.push(contact);
                    text += `@${participant.id.user} `;
                    }
                
                    await chat.sendMessage(pesan, { mentions })
                    .then(async () => {
                        msg.delete(true);
                    })
                    break;
                }
            }
        } else if (prefix.some(pre => text.startsWith(`${pre}topup ml`))) {
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
        } else if (prefix.some(pre => text == `${pre}topdf`)) topdf(msg, sender);
        else if (prefix.some(pre => text == `${pre}todocx`)) todocx(msg, sender);
        else if(prefix.some(pre => text.startsWith(`${pre}bugreport`))) await bugreport(msg, client);
        else if(prefix.some(pre => text == `${pre}limit`)) await limit(msg, sender);
        else if(prefix.some(pre => text == `${pre}update`)) await newupdate(msg);
        else if(prefix.some(pre => text.startsWith(`${pre}setname`))) await setName(sender, msg);
        else if(prefix.some(pre => text.startsWith(`${pre}setlang`))) await setLang(sender, msg);
        else if(prefix.some(pre => text.startsWith(`${pre}ai`))) await ai(msg, sender, client);
        else if(prefix.some(pre => text.startsWith(`${pre}musicinfo`))) await musicinfo(msg, sender);
        else if(prefix.some(pre => text == `${pre}animedl`)) await animedl(msg, client, sender);
        else if (prefix.some(pre => text === `${pre}backup`) && sender == "6282192598451@c.us") await backup_database('database', 'database.zip', msg);
        else if (prefix.some(pre => text === `${pre}sendupdate`) && sender == "6282192598451@c.us") await sendupdate(client, msg);
        else if (prefix.some(pre => text.startsWith(`${pre}updatecmd`)) && sender == "6282192598451@c.us") fungsi.updatecmd(msg);
        else if(prefix.some(pre => text.startsWith(`${pre}updateapi`))) await updateAPI(msg, sender);
        else if(prefix.some(pre => text == `${pre}delapi`)) await delAPI(sender, msg);
        // else if (prefix.some(pre => text.startsWith(`${ pre }tess`))) await mediafire(msg, sender);
        else if (prefix.some(pre => text.startsWith(`${ pre }eden`))) await edenHandler(text, msg, sender);
        else if(chat.isGroup) {
            for(let participant of chat.participants) {
                if(participant.id._serialized === '6288809606244@c.us' && participant.isAdmin) {
                    const file_member_warning = `./database/antitoxic/${ msg.from }_warning`;
                    const file_grup_dir = `./database/antitoxic/data_grup`;
                    const fileData = fs.readFileSync(file_grup_dir, 'utf-8');
                    let data_grup = JSON.parse(fileData);
                    let founded_grup = data_grup.findIndex(item => item.id_grup === msg.from);
                    if (founded_grup >= 0) {
                        const fileData2 = fs.readFileSync(file_member_warning, 'utf-8');
                        let warn = JSON.parse(fileData2);
                        let founded = warn.findIndex(item => item.user === msg.author);
                        if (founded === -1) {
                            warn.push({ user: msg.author, teguran: 0, status: 'unmute' });
                            fs.writeFileSync(file_member_warning, JSON.stringify(warn));
                        }
                        const contact = await client.getContactById(msg.author);
                        mentions = [];
                        mentions.push(contact);
                        await cek_word(text, msg, mentions, contact);
                    }
                }
            }
        } else if(!chat.isGroup && msg.body != '' && !msg.hasQuotedMsg) {
            msg.reply(wrong_format)
            .catch(() => {
                chat.sendMessage(wrong_format);
            })
        }
        
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
    for (const item of notification.recipientIds) {
        let contact = await client.getContactById(item);
        contacts.push(contact);
    }

    if ((notification.type === 'add' || notification.type === 'invite') && (chat.isGroup && contact.id.user == "6288809606244")) {
        const author = await client.getContactById(notification.author);
        let mentions = [];
        mentions.push(author);
        chat.sendMessage(`🤖 *Halo! Saya adalah SeeU, Asisten Bot Grup ini!*\n\nSaya di invite oleh @${ author.id.user }! Saya di sini untuk membantu dan memiliki sejumlah fitur yang dapat digunakan. Kirim */menu* untuk melihat daftar command yang dapat digunakan. Terima kasih! 🌟`, { mentions });
    } else if (notification.type === 'add' || notification.type === 'invite' && chat.isGroup) {
        for (const item of contacts) {
            let mentions = [item];
            chat.sendMessage(`hello @${ item.id.user } Selamat bergabung di grup ${ chat.name }.`, { mentions })
        }
    }
});

client.initialize();