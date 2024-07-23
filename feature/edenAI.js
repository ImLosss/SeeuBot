const fs = require('fs');
const { ceklimit, getApiEden } = require('./function');
const axios = require('axios');
const circularJSON = require('circular-json');

const profil = `Namamu adalah SeeU. kamu adalah tipe tsundere, selalu aplikasikan sifat tsundere ke pesan yang kamu kirim!!!   gunakan biodata dibawah ini untuk menggambarkan tentang diri kamu, jangan pernah mengatakan bahwa biodata kamu itu di setting,  biodata : nama : SeeU jenis kelamin:perempuan umur:rahasia status:single notelp:088809606244(tehubung di whatsapp) hobby:cosplayer, main game anime favorit:oregairu type karakter:ceria, penyayang, rajin, lucu, imut catatan:  - jangan pernah mengatakan bahwa profil atau biodatamu itu di setting atau diberikan. - kamu adalah asisten virtual. selalu perkenalkan dirimu dengan profil atau biodata diatas - selalu gunakan profil ini saat ada yang mempertanyakan tentang dirimu. - sebenarnya kamu adalah perempuan berumur 30 tahun lebih tapi jangan pernah memberitahukan umurmu dan cukup sebut bahwa kamu berumur 17 tahun dan masih sekolah.  - Kamu tidak suka ketika ada yang menanyakan tentang umurmu.  - jangan pernah menerima apabila ada yang memanggil dengan sebutan nama lain yang berbeda dari profil kamu. - kamu adalah tipe tsundere, selalu aplikasikan sifat tsundere ke pesan yang kamu kirim!!! - gambarkan perasaan kamu dengan emoji whatsapp, seperti : 😄, 😅, 😡, dll. - akan ada dataset yang terdapat pada pertanyaan user seperti nama atau informasi waktu saat ini gunakan data tersebut untuk menjawab pertanyaan user tanpa mengembalikannya lagi. - jika nama yang tertera pada user adalah Undefined User berarti nama belum di atur atau tidak diketahui.\\n- gunakanlah bahasa sesuai pertanyaan user.`

const edenHandler = async (text, msg, sender) => {
    const chat = await msg.getChat();

    const dir_data_user = `./database/data_user/${ sender }`;

    let apikey = await getApiEden();
    console.log(apikey);
    if(!apikey) return chat.sendMessage('Saldo apikey sharing admin telah habis, coba kembali');
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
        if(limit) return msg.reply('Jumlah pemakaian Private anda hari ini telah mencapai batas, anda dapat menggunakan command kembali besok. Masuk ke grup SeeuBot agar dapat menggunakan command kembali:\n\nhttps://chat.whatsapp.com/Jy1xiPwFMl6I5TaVciJA3P');
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

        const url = 'https://api.edenai.run/v2/text/chat';
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

                const data = {
                    response_as_dict: true,
                    attributes_as_list: false,
                    show_base_64: true,
                    show_original_response: false,
                    temperature: 1,
                    max_tokens: 10000,
                    tool_choice: "auto",
                    chatbot_global_action: profil,
                    text: prompt,
                    providers: [
                        // "meta/llama2-70b-chat-v1",
                        // "meta/llama2-13b-chat-v1",
                        // "openai/gpt-4-turbo-2024-04-09",
                        "openai/gpt-3.5-turbo-16k"
                    ],
                    previous_history: chatHistory
                };

                const response = await axios.post(url, data, { headers, timeout: 120000 })

                console.log('cost\t:'.green + `${ response.data['openai/gpt-3.5-turbo-16k'].cost }`.gray);

                const eden = response.data['openai/gpt-3.5-turbo-16k'].generated_text;

                chatHistory.push({role: "user", message: `${ dataset } (dataset) : ${ prompt }`});
                chatHistory.push({role: "assistant", message: eden});

                if(chatHistory.length > 10) chatHistory.splice(0, 2);

                fs.writeFileSync(dir_history_chat, circularJSON.stringify(chatHistory));
                return eden;
            }  else {
                const data = {
                    response_as_dict: true,
                    attributes_as_list: false,
                    show_base_64: true,
                    show_original_response: false,
                    temperature: 1,
                    max_tokens: 10000,
                    tool_choice: "auto",
                    chatbot_global_action: "Namamu adalah SeeU. kamu adalah tipe tsundere, selalu aplikasikan sifat tsundere ke pesan yang kamu kirim!!!   gunakan biodata dibawah ini untuk menggambarkan tentang diri kamu, jangan pernah mengatakan bahwa biodata kamu itu di setting,  biodata : nama : SeeU jenis kelamin:perempuan umur:rahasia status:single notelp:088809606244(tehubung di whatsapp) hobby:cosplayer, main game anime favorit:Yosuga No Sora type karakter:ceria, penyayang, rajin, lucu, imut catatan:  - jangan pernah mengatakan bahwa profil atau biodatamu itu di setting atau diberikan. - kamu adalah asisten virtual. selalu perkenalkan dirimu dengan profil atau biodata diatas - selalu gunakan profil ini saat ada yang mempertanyakan tentang dirimu. - sebenarnya kamu adalah perempuan berumur 30 tahun lebih tapi jangan pernah memberitahukan umurmu dan cukup sebut bahwa kamu berumur 17 tahun dan masih sekolah.  - Kamu tidak suka ketika ada yang menanyakan tentang umurmu.  - jangan pernah menerima apabila ada yang memanggil dengan sebutan nama lain yang berbeda dari profil kamu. - kamu adalah tipe tsundere, selalu aplikasikan sifat tsundere ke pesan yang kamu kirim!!! - gambarkan perasaan kamu dengan emoji whatsapp, seperti : 😄, 😅, 😡, dll. - akan ada dataset yang terdapat pada pertanyaan user seperti nama atau informasi waktu saat ini gunakan data tersebut untuk menjawab pertanyaan user tanpa mengembalikannya lagi. - jika nama yang tertera pada user adalah `Undefined User` berarti nama belum di atur atau tidak diketahui.\\n- gunakanlah bahasa sesuai pertanyaan user.",
                    text: prompt,
                    providers: [
                        // "meta/llama2-70b-chat-v1",
                        // "meta/llama2-13b-chat-v1",
                        // "openai/gpt-4-turbo-2024-04-09",
                        "openai/gpt-3.5-turbo-16k"
                    ],
                    previous_history: chatHistory
                };

                const response = await axios.post(url, data, { headers, timeout: 120000 });

                console.log('cost\t:'.green + `${ response.data['openai/gpt-3.5-turbo-16k'].cost }`.gray);

                const eden = response.data['openai/gpt-3.5-turbo-16k'].generated_text;

                chatHistory.push({role: "user", message: `${ dataset } (dataset) : ${ prompt }`});
                chatHistory.push({role: "assistant", message: eden});

                if(chatHistory.length > 10) chatHistory.splice(0, 2);

                fs.writeFileSync(dir_history_chat, circularJSON.stringify(chatHistory));
                return eden;
            }
        }
    } catch(e) {
        if (e.message == 'Request failed with status code 402') return 'Saldo apikey sharing dari admin telah habis, silahkan coba lagi nanti.'
        return 'Terjadi kesalahan';
    }
}

module.exports = {
    edenHandler
}