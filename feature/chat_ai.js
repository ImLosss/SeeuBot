const axios = require('axios');
const fs = require('fs');
const { API_KEY_OPEN_AI } = require('../config');
const { getTime, getAnimeById, searchAnime, getFeature, setNameGPT, setLangGPT, getAnimeRecommended, musicinfoGPT } = require('./function_chatGPT');

const col = require('colors');
const { ceklimit, setLang } = require('./function');

const profil = `
Namamu adalah SeeU. kamu adalah tipe tsundere, selalu aplikasikan sifat tsundere ke pesan yang kamu kirim!!!

gunakan biodata dibawah ini untuk menggambarkan tentang diri kamu, jangan pernah mengatakan bahwa biodata kamu itu di setting, 
biodata :
nama : SeeU
jenis kelamin:perempuan
umur:rahasia
status:single
notelp:088809606244(tehubung di whatsapp)
hobby:cosplayer, main game
anime favorit:oregairu
type karakter:ceria, penyayang, rajin, lucu, imut
catatan: 
- jangan pernah mengatakan bahwa profil atau biodatamu itu di setting atau diberikan.
- kamu adalah asisten virtual. selalu perkenalkan dirimu dengan profil atau biodata diatas
- selalu gunakan profil ini saat ada yang mempertanyakan tentang dirimu.
- sebenarnya kamu adalah perempuan berumur 30 tahun lebih tapi jangan pernah memberitahukan umurmu dan cukup sebut bahwa kamu berumur 17 tahun dan masih sekolah. 
- Kamu tidak suka ketika ada yang menanyakan tentang umurmu. 
- jangan pernah menerima apabila ada yang memanggil dengan sebutan nama lain yang berbeda dari profil kamu.
- kamu adalah tipe tsundere, selalu aplikasikan sifat tsundere ke pesan yang kamu kirim!!!
- gambarkan perasaan kamu dengan emoji whatsapp, seperti : 😄, 😅, 😡, dll.
- akan ada dataset yang terdapat pada pertanyaan user seperti nama atau informasi waktu saat ini gunakan data tersebut untuk menjawab pertanyaan user tanpa mengembalikannya lagi.
- jika nama yang tertera pada user adalah 'Undefined User' berarti nama belum di atur atau tidak diketahui.
- gunakanlah bahasa sesuai pertanyaan user.
`;

const genres = {
    "action": 1,
    "comedy": 4,
    "horror": 14,
    "sports": 30,
    "adventure": 2,
    "drama": 8,
    "mystery": 7,
    "supernatural": 37,
    "fantasy": 10,
    "romance": 22,
    "suspense": 41,
    "sci-fi": 24,
    "slice of life / SOL": 36,
    "ecchi": 9,
    "hentai": 12,
    "military": 38,
    "music": 19,
    "reverse harem": 73,
    "time travel": 78,
    "harem": 35,
    "isekai": 62,
    "vampire": 32,
    "mecha": 18,
    "pyschological": 40,
    "samurai": 21,
    "super power": 31,
    "school": 23,
    "survival": 76,
    "reincarnation": 72
}


const ChatAIHandler = async (text, msg, sender) => {
    const chat = await msg.getChat();

    const dir_data_user = `./database/data_user/${ sender }`;

    let apikey = API_KEY_OPEN_AI;
    let data_user = fs.readFileSync(dir_data_user, 'utf-8');
    data_user = JSON.parse(data_user);

    let apiprivate = false;
    if(data_user[0].API_KEY_OPENAI != undefined) {
        apikey = data_user[0].API_KEY_OPENAI;
        apiprivate = true;
    }
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

    dataset = JSON.stringify(dataset)

    if(!chat.isGroup) {
        const limit = await ceklimit(sender);
        if(limit) return msg.reply('Jumlah pemakaian Private anda hari ini telah mencapai batas, anda dapat menggunakan command kembali besok. Masuk ke grup SeeuBot agar dapat menggunakan command kembali:\n\nhttps://chat.whatsapp.com/IX4rq2WWN72BOEcvk46wnv');
    }

    let cmd = text.split(' ');
    
    let question;
    if(cmd.length == 2){
        question = cmd[1];
    } else if(cmd.length >= 3) {
        cmd = cmd.slice(1,cmd.length);
        question = cmd.join(" ");
    }

    console.log('\nfrom\t\t:'.green + `+${ sender }`.gray);
    console.log('fitur\t\t:'.green + `ask?`.gray.bold);
    console.log('pesan\t\t:'.green + `${ text }`.gray);
    console.log('question\t:'.green + `${ question }`.gray);
    if (apiprivate) console.log('info:\t\t'.green + `${ data_user[0].API_KEY_OPENAI }(Private API)`);

    const response = await chapGPT(question, msg.from, sender, dataset, apikey, apiprivate)

    msg.reply(response)
    .catch(() => {
        chat.sendMessage(response);
    })
}

const chapGPT = async (prompt, from, sender, dataset, apikey, apiprivate) => {

    // Header yang diperlukan, termasuk kunci API
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ apikey }`,
    };

    let functions = [
        {
            "name": "getFeature",
            "description": "Mengambil data fitur/command apa saja yang bisa digunakan oleh Seeu/bot",
            "parameters": {
                "type": "object",
                "properties": {
                    "param": {
                        "type": "string",
                        "description": "kosongkang saja",
                    }
                }
            },
        },
        {
            "name": "getAnimeRecommended",
            "description": "Melakukan pencarian anime menggunakan filter",
            "parameters": {
                "type": "object",
                "properties": {
                    "order_by": {
                        "type": "string",
                        "enum": ["popularity", "rank", "score"]
                    },
                    "genres": {
                        "type": "string",
                        "description": `Filter by genre(s) IDs. Can pass multiple with a comma(,) as a delimiter. ex. if you want to find anime with genres school and isekai the parameters is '23, 62'. here's genres IDs : ${ JSON.stringify(genres) }`
                    },
                    "start_date": {
                        "type": "string",
                        "description": "Filter by starting date. Format: YYYY-MM-DD."
                    },
                    "status": {
                        "type": "string",
                        "enum": ["airing", "complete", "upcoming"]
                    },
                }
            },
        },
        {
            "name": "searchAnime",
            "description": "Melakukan pencarian anime berdasarkan title untuk mendapatkan informasi lengkap dengan sumber dari MyAnimeList",
            "parameters": {
                "type": "object",
                "properties": {
                    "search": {
                        "type": "string",
                        "description": "pencarian",
                    },
                    "type": {
                        "type": "string",
                        "enum": ["tv", "movie", "ova", "special", "ona"],
                    }
                },
                "required": ["search"],
            },
        },
        {
            "name": "getAnimeById",
            "description": "Get Anime info like Title, Genres, Score, Synopsis, etc",
            "parameters": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "string",
                        "description": "The ID's of anime",
                    }
                },
                "required": ["id"],
            },
        },
        {
            "name": "getTime",
            "description": "Mengambil tanggal dan waktu sekarang dalam zona WITA Indonesia",
            "parameters": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "string",
                        "description": "kosongkan saja",
                    }
                },
            },
        },
        {
            "name": "setNameGPT",
            "description": "Fungsi untuk mengatur atau mengganti nama user, agar selalu di ingat oleh SeeU",
            "parameters": {
                "type": "object",
                "properties": {
                    "from": {
                        "type": "string",
                        "description": `Gunakan ${ sender } sebagai parameter`,
                    },
                    "name": {
                        "type": "string",
                        "description": "nama yang mau diatur"
                    }
                },
                "required": ["from", "name"],
            },
        },
        {
            "name": "setLangGPT",
            "description": "Fungsi untuk mengatur atau mengganti chatLanguage yang digunakan untuk chat dengan SeeU, gunakan fungsi ini jika user ingin chat dalam bahasa tertentu atau chatLanguage masih null pada dataset",
            "parameters": {
                "type": "object",
                "properties": {
                    "from": {
                        "type": "string",
                        "description": `Gunakan ${ sender } sebagai parameter`,
                    },
                    "language": {
                        "type": "string",
                        "description": "Bahasa yang mau diatur, gunakan bahasa sesuai yang digunakan oleh user"
                    }
                },
                "required": ["from", "language"],
            },
        },
        {
            "name": "musicinfoGPT",
            "description": "Fungsi untuk mencari informasi lagu berdasarkan judul yang ingin dicari",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": `Judul dari lagu yang ingin dicari, sertakan nama artis bila perlu agar lagu yang dicari sesuai`,
                    },
                },
                "required": ["title"],
            },
        }
    ];

    const dir_history_chat = `database/data_chat/${ from }`;

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
        try {
            let chatHistory = [];

            if(fs.existsSync(dir_history_chat)) {
                // mengambil data history chat pada database
                const fileData = fs.readFileSync(dir_history_chat, 'utf-8');
                chatHistory = JSON.parse(fileData);
            } else {
                chatHistory = [{role: "system", content: profil}];
            }

            chatHistory.push({ role: "user", content: `${ dataset } (dataset) : ${ prompt }` });  // Update the chat history

            // Melakukan permintaan ke API menggunakan Axios
            const response = await axios.post("https://api.openai.com/v1/chat/completions", {
                model: 'gpt-3.5-turbo-16k',
                messages: chatHistory,
                functions: functions,
                function_call: "auto"
            }, { headers, timeout: 120000 })

            const response_message = response.data.choices[0].message;

            console.log(response_message);

            if(response_message.function_call) {
                try{
                    available_functions = {
                        "getAnimeById" : getAnimeById,
                        "getTime": getTime,
                        "searchAnime": searchAnime,
                        "getFeature": getFeature,
                        "setNameGPT": setNameGPT,
                        "setLangGPT": setLangGPT,
                        "getAnimeRecommended": getAnimeRecommended,
                        "musicinfoGPT": musicinfoGPT
                    } 

                    chatHistory.push(response_message);

                    // Cek fungsi yang dipanggil
                    const function_name = response_message["function_call"]["name"]
                    const function_to_call = available_functions[function_name]
                    const function_args = JSON.parse(response_message["function_call"]["arguments"])
                    
                    const function_response = await function_to_call(function_args)

                    console.log(function_response);

                    chatHistory.push({
                        role: "function",
                        name: function_name,
                        content: function_response
                    });

                    // Melakukan permintaan ke API menggunakan Axios
                    const second_response = await axios.post("https://api.openai.com/v1/chat/completions", {
                        model: 'gpt-3.5-turbo-16k-0613',
                        messages: chatHistory
                    }, { headers, timeout: 120000 })

                    const answer = second_response.data.choices[0].message.content;

                    chatHistory.push({ role: "assistant", content: answer });

                    let jml_tokens = second_response.data.usage.total_tokens;
                    console.log(jml_tokens);

                    if (jml_tokens > 10000) chatHistory.splice(1, 6);

                    fs.writeFileSync(dir_history_chat, JSON.stringify(chatHistory));

                    return answer;
                } catch(err) {
                    console.log(err.message);
                    return err.message;
                }
            } else {
                const answer = response.data.choices[0].message.content;

                chatHistory.push({ role: "assistant", content: answer });

                let jml_tokens = response.data.usage.total_tokens;
                console.log(jml_tokens);
                
                if (jml_tokens > 10000) chatHistory.splice(1, 6);

                fs.writeFileSync(dir_history_chat, JSON.stringify(chatHistory));

                return answer;
            }
        } catch (error) {
            const err = error.message;
            if(err.includes('timeout')) {
                return 'Request Timeout, coba kembali...';
            } else {
                const errinfo = error.response.data.error.code || "Timeout, coba kembali...";
                console.log(errinfo)
                if(errinfo == "invalid_api_key" && apiprivate) return 'APIKEY anda salah pastikan apikey yang anda masukkan benar, update api key anda dengan mengirim pesan *updateAPI [PasteApikeyHere]*\n\n_Note:_\nIkuti link dibawah cara mendapatkan APIKEY OPENAI\nwww.youtube.com\n\n==================================\n\nYour APIKEY is wrong, make sure the apikey you entered is correct, update your api key by sending the message *updateAPI [PasteApikeyHere]*\n\n_Note:_\nFollow the link below how to get the OPENAI APIKEY\nwww.youtube.com';
                else if(errinfo == "insufficient_quota" && apiprivate) return 'Saldo APIKEY OPENAI anda telah habis, silahkan buat akun OPENAI yang baru untuk mendapatkan APIKEY yang baru\n\n_Note:_\nIkuti link dibawah cara mendapatkan APIKEY yang baru\nwww.youtube.com\n\n==================================\n\nYour OPENAI APIKEY balance has run out, please create a new OPENAI account to get a new APIKEY\n\n_Note:_\nFollow the link below how to get a new APIKEY\nwww.youtube.com';
                else if(errinfo == "insufficient_quota") return 'Saldo APIKEY sharing dari admin telah habis, cobalah untuk menggunakan Private APIKEY anda dengan mengirim pesan */updateAPI [PasteApikeyHere]*. Ikuti link dibawah cara mendapatkan APIKEY ChatGPT :\nwww.youtube.com\n\n==================================\n\nThe APIKEY sharing balance from the admin has run out, try to use your Private APIKEY by sending the message */updateAPI [PasteApikeyHere]*. Follow the link below to get APIKEY ChatGPT:\nwww.youtube.com'
                else return 'SeeU is busy, try again after 1 minute...';
            }
        }
    }
};


module.exports = {
    ChatAIHandler
}