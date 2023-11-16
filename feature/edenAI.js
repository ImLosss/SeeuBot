const { EDEN_APIKEY } = require('../config');
const fs = require('fs');
const { ceklimit } = require('./function');
const axios = require('axios');
const circularJSON = require('circular-json');

const profil = `Namamu adalah Eden. kamu adalah Asisten virtual yang bisa diandalkan, Jawablah pertanyaan user dengan tepat, gunakanlah bahasa sesuai pertanyaan user, akan ada dataset yang terdapat pada pertanyaan user seperti nama atau informasi waktu saat ini gunakan data tersebut untuk menjawab pertanyaan user tanpa mengembalikannya lagi, gambarkan perasaan kamu dengan emoji whatsapp, seperti : 😄, 😅, 😡, dll`

const edenHandler = async (text, msg, sender) => {
    const chat = await msg.getChat();

    const dir_data_user = `./database/data_user/${ sender }`;

    let apikey = EDEN_APIKEY;
    let data_user = fs.readFileSync(dir_data_user, 'utf-8');
    data_user = JSON.parse(data_user);

    // Buat objek Date
    const date = new Date();

    // Atur zona waktu ke WITA (GMT+8)
    date.setUTCHours(date.getUTCHours() + 8);

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    const formattedTime = `${ hours }:${ minutes }:${ seconds }`

    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);
    if(dataUser[0].name == null) return msg.reply('Before using this command, set your name first using the following format:\n\n*/setName [yourName]*');

    let hasQmsg = false
    let Qmsg = undefined;
    if(msg.hasQuotedMsg) {
        const reply = await msg.getQuotedMessage();
        Qmsg = reply.body;
        hasQmsg = true;
    } 
    let dataset;
    if (chat.isGroup){
        dataset = {
            name: dataUser[0].name,
            time: `${ formattedTime } WITA`,
            chatIn: 'Group',
            chatLanguage: dataUser[0].chatLanguage,
            userIDs: sender,
            hasQuotedMsg: hasQmsg,
            quotedMsg: Qmsg
        }
    } else {
        dataset = {
            name: dataUser[0].name,
            time: `${ formattedTime } WITA`,
            chatIn: 'privateChat',
            chatLanguage: dataUser[0].chatLanguage,
            memberIDs: sender,
            hasQuotedMsg: hasQmsg,
            quotedMsg: Qmsg
        }
    }

    dataset = circularJSON.stringify(dataset)

    if(!chat.isGroup) {
        const limit = await ceklimit(sender);
        if(limit) return msg.reply('Jumlah pemakaian Private anda hari ini telah mencapai batas, anda dapat menggunakan command kembali besok. Masuk ke grup SeeuBot agar dapat menggunakan command kembali:\n\nhttps://chat.whatsapp.com/IX4rq2WWN72BOEcvk46wnv');
    }

    let cmd = text.split(' ');
    
    let question;
    if(cmd[1] == null) return msg.reply ('Sepertinya formatmu salah, kirim kembali dengan format */eden [question]*');
    else if(cmd.length == 2){
        question = cmd[1];
    } else if(cmd.length >= 3) {
        cmd = cmd.slice(1,cmd.length);
        question = cmd.join(" ");
    }

    console.log('\nfrom\t\t:'.green + `+${ sender }`.gray);
    console.log('fitur\t\t:'.green + `/eden`.gray.bold);
    console.log('pesan\t\t:'.green + `${ text }`.gray);
    console.log('question\t:'.green + `${ question }`.gray);

    const response = await edenAI(question, msg.from, sender, dataset, apikey)

    msg.reply(response)
    .catch(() => {
        chat.sendMessage(response);
    })
}

const edenAI = async (prompt, from, sender, dataset, apikey) => {
    try {
        const headers = {
            'accept': 'application/json',
            'authorization': `Bearer ${ apikey }`,
            'content-type': 'application/json'
        };

        const dir_history_chat = `database/data_chat_eden/${ from }`;

        if(prompt == "reset"){
            if (fs.existsSync(dir_history_chat)){
                fs.unlink(`./${ dir_history_chat }`, (err) => {
                    if (err) {
                        console.error(err);
                    } 
                });
                return 'berhasil menghapus riwayat chat';
            } else {
                return 'Gagal : Tidak menemukan riwayat chat';
            }
        } else {
            let chatHistory = [];

            if(fs.existsSync(dir_history_chat)) {
                // mengambil data history chat pada database
                const fileData = fs.readFileSync(dir_history_chat, 'utf-8');
                chatHistory = JSON.parse(fileData);

                const response = await axios.post('https://api.edenai.run/v2/text/chat/stream', {
                    "response_as_dict": true,
                    "attributes_as_list": false,
                    "show_original_response": false,
                    "temperature": 0,
                    "max_tokens": 3500,
                    "fallback_type": "continue",
                    "providers": "openai",
                    "text": prompt,
                    "previous_history": chatHistory,
                    "chatbot_global_action": profil  
                }, {headers, timeout: 120000 });

                chatHistory.push({role: "user", message: `${ dataset } (dataset) : ${ prompt }`});
                
                if(chatHistory.length > 4) chatHistory.splice(0, 2);
                console.log(chatHistory);
                fs.writeFileSync(dir_history_chat, circularJSON.stringify(chatHistory));
                return response
            }  else {
                const response = await axios.post('https://api.edenai.run/v2/text/chat/stream', {
                    "response_as_dict": true,
                    "attributes_as_list": false,
                    "show_original_response": false,
                    "temperature": 0,
                    "max_tokens": 3500,
                    "fallback_type": "continue",
                    "providers": "openai",
                    "text": `${ dataset } (dataset) : ${ prompt}`,
                    "chatbot_global_action": profil  
                }, {headers, timeout: 120000 });

                chatHistory.push({role: "user", message: `${ dataset } (dataset) : ${ prompt }`});

                if(chatHistory.length > 4) chatHistory.splice(0, 2);

                console.log(chatHistory);
                fs.writeFileSync(dir_history_chat, circularJSON.stringify(chatHistory));
                return response;
            }
        }
    } catch(e) {
        console.log(e);
        return 'Terjadi kesalahan';
    }
}

module.exports = {
    edenHandler
}