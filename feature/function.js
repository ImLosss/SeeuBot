const fs = require('fs');
const { getTime } = require('./function_chatGPT');
const archiver = require('archiver');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js')
const { EDEN_APIKEY } = require('../config');
const axios = require('axios');

let status_bugreport = false;

const message_update = `📣 *New Update!* 📣

🔸 Version: 2.1.3
🗓️ Date: 31/03/2024

▸ [🛠 *Fixed*] Crash saat menggunakan beberapa command.
▸ [🆕 *Fixed*] Fitur /animedl, memperbaiki bug saat mencoba mengambil link download, apabila terjadi error kembali setelah mencoba 1-3x, silahkan gunakan */bugreport [message]* sambil mereply pesan error agar dev SeeU segera memperbaikinya.
▸ [🔄 *Update*] Fitur /igdl, sekarang anda dapat mengunduh file diatas 30mb.

Yuk, langsung cobain fitur-fitur baru ini! Jangan lupa laporkan jika ada bug ya! 😉


📣 *New Update!* 📣

🔸 Version: 2.1.3
🗓️ Date: 31/03/2024

▸ [🛠 *Fixed*] Crash when using certain commands.
▸ [🆕 *Fixed*] Feature /animedl: Fixed a bug when trying to retrieve the download link. If an error persists after 1-3 attempts, please use /bugreport [message] while replying to the error message so that the SeeU developer can promptly fix it.
▸ [🔄 Update] Feature /igdl, now you can download files above 30mb.

Go ahead and give these new features a try! Don't forget to report if you come across any bugs! 😉`

async function ceklimit(from) {
    await resetLimit(from);
    const dir_data_user = `database/data_user/${ from }`;
    const fileData = fs.readFileSync(dir_data_user, 'utf-8');
    let data_user = JSON.parse(fileData);
    if(data_user[0].limit < 1) {
        fs.writeFileSync(dir_data_user, JSON.stringify(data_user));
        return true;
    } else {
        data_user[0].limit = data_user[0].limit - 1
        console.log(data_user)
        fs.writeFileSync(dir_data_user, JSON.stringify(data_user));
        return false;
    }

}

async function resetLimit(from) {
    const dir_data_user = `database/data_user/${ from }`;
    const fileData = fs.readFileSync(dir_data_user, 'utf-8');
    let data_user = JSON.parse(fileData);
    let time = await getTime();
    time = JSON.parse(time);

    if(data_user[0].day != time.date) {
        data_user[0].limit = 35;
        data_user[0].day = time.date;
        console.log(data_user)
        fs.writeFileSync(dir_data_user, JSON.stringify(data_user));
    }
}

async function ceklist_user(from) {
    const dir_data_user = `database/list_user`;
    const fileData = fs.readFileSync(dir_data_user, 'utf-8');
    let list_user = JSON.parse(fileData);
    for(i of list_user) {
        if (i == from || from == 'status@broadcast' || from == '120363140292386733@g.us') {
            return
        }
    }
    list_user.push(from)
    console.log(list_user);
    fs.writeFileSync(dir_data_user, JSON.stringify(list_user));
}

async function setName(sender, msg) {
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);
    let pesan = msg.body;
    pesan = pesan.split(' ');
    if(pesan.length < 2) {
        return msg.reply('Your format is incorrect. Please resend using the format */setName [name]*.');
    } else {
        pesan = pesan.slice(1, pesan.length);
        pesan = pesan.join(" ");
    }

    dataUser[0].name = pesan;

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser));
    return msg.reply('The name has been successfully set.');
}

async function setLang(sender, msg) {
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);
    let pesan = msg.body;
    pesan = pesan.split(' ');
    if(pesan.length < 2) {
        return msg.reply('Your format is incorrect. Please resend using the format */setLang [language]*.');
    } else {
        pesan = pesan.slice(1, pesan.length);
        pesan = pesan.join(" ");
    }

    dataUser[0].chatLanguage = pesan;

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser));
    return msg.reply('Chat language has been successfully set.');
}

async function limit(msg, from) {
    await resetLimit(from);
    const dir_data_user = `database/data_user/${ from }`;
    const fileData = fs.readFileSync(dir_data_user, 'utf-8');
    let data_user = JSON.parse(fileData);

    return msg.reply(`Sisa limit Private anda hari ini: ${ data_user[0].limit }`);
}

async function updateAPI(msg, from) {
    let api = msg.body;
    api = api.split(' ');

    if (api.length < 2 || api.length > 2) {
        return msg.reply('Format anda salah, kirim kembali dengan format */updateAPI [PasteApikeyHere]*. Ikuti link dibawah cara mendapatkan APIKEY OpenAI:\nhttps://youtu.be/R3yF02N1Oq4?si=2yCeBYOm5lxYV2tu\n\n==================================\n\nyour message format is wrong. Send it again with the format */updateAPI [PasteApikeyHere]*. Follow the link below how to get openai apikey:\nhttps://youtu.be/R3yF02N1Oq4?si=2yCeBYOm5lxYV2tu')
    }

    api = api[1];
    const dir_data_user = `database/data_user/${ from }`;
    const fileData = fs.readFileSync(dir_data_user, 'utf-8');
    let data_user = JSON.parse(fileData);

    data_user[0].API_KEY_OPENAI = api;
    console.log(data_user);
    fs.writeFileSync(dir_data_user, JSON.stringify(data_user));
    return msg.reply('API key anda berhasil di set, jika ingin menggunakan API key sharing yang disediakan oleh dev SeeU kirim pesan */delAPI*\n\n==================================\n\nYour API key has been successfully set, if you want to use the API key sharing provided by the SeeU dev, send a message */delAPI*')
}

async function delAPI(from, msg) {
    const dir_data_user = `database/data_user/${ from }`;
    const fileData = fs.readFileSync(dir_data_user, 'utf-8');
    let data_user = JSON.parse(fileData);

    if(data_user[0].API_KEY_OPENAI == undefined) return msg.reply('anda belum mengatur APIKEY anda, kirim pesan */updateAPI [PasteApikeyHere]* untuk mengatur/mengganti apikey anda\n\nIkuti link dibawah cara mendapatkan apikey openai:\nhttps://youtu.be/R3yF02N1Oq4?si=2yCeBYOm5lxYV2tu\n\n==================================\n\nyou haven\'t set your APIKEY, send a message */updateAPI [PasteApikeyHere]* to set/change your apikey\n\nFollow the link below how to get openai apikey:\nhttps://youtu.be/R3yF02N1Oq4?si=2yCeBYOm5lxYV2tu')

    data_user[0].API_KEY_OPENAI = undefined;
    fs.writeFileSync(dir_data_user, JSON.stringify(data_user));

    return msg.reply('Successfully reset apikey');
}

async function bugreport(msg, client) {
    if(status_bugreport) return msg.reply('Coba kembali setelah 30 detik');
    status_bugreport = true;
    let pesan = msg.body;
    pesan = pesan.split(' ');

    if(pesan.length < 2) return msg.reply('formatmu salah, kirim kembali dengan format /bugReport [pesan]')

    pesan = pesan.slice(1, pesan.length)
    pesan = pesan.join(' ');

    client.sendMessage('6282192598451@c.us', pesan)
    .then(() => {
        msg.reply('Report berhasil, dev SeeU akan segera mengatasi bug secepatnya')
    })
    setTimeout(() => {
        status_bugreport = false
    }, 30000)
}

async function newupdate(msg) {
    const chat = await msg.getChat();
    chat.sendMessage(message_update)
}

async function backup_database(sourceFolderPath, outputFilePath, msg) {
    const output = fs.createWriteStream(outputFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chat = await msg.getChat();

    output.on('close', () => {
        console.log('Compression completed.');
        const media = MessageMedia.fromFilePath(outputFilePath);
        chat.sendMessage(media, { caption: 'Berhasil' });
    });

    archive.on('error', (error) => {
        console.error('An error occurred:', error);
    });

    archive.pipe(output);

    async function addFilesToArchive(folderPath, parentFolderName) {
        const items = fs.readdirSync(folderPath);
        for (const item of items) {
            const itemPath = path.join(folderPath, item);
            const relativePath = path.join(parentFolderName, item);

            if (fs.statSync(itemPath).isDirectory()) {
                addFilesToArchive(itemPath, relativePath);
            } else {
                archive.append(fs.createReadStream(itemPath), { name: relativePath });
            }
        }
    }

    await addFilesToArchive(sourceFolderPath, path.basename(sourceFolderPath))
    archive.finalize();
}

async function sendupdate(client, msg) {
    const dir_data_user = `database/list_user`;
    const fileData = fs.readFileSync(dir_data_user, 'utf-8');
    let list_user = JSON.parse(fileData);
    let currentIndex = 0;
    const sendMessageInterval = setInterval(() => {
        if (currentIndex < list_user.length) {
            if (list_user[currentIndex] != "120363029281149446@g.us"){
                client.sendMessage(list_user[currentIndex], message_update);
                msg.reply(`berhasil mengirim pesan ke nomor: ${ list_user[currentIndex] }`);
                currentIndex++;
            } else console.log('skip');
        } else {
            clearInterval(sendMessageInterval); // Hentikan interval setelah semua pesan terkirim
            msg.reply('Pengiriman pesan selesai');
        }
    }, 5000);
}

function getMenu() {
    let dataUser = fs.readFileSync(`./database/data`, 'utf-8');
    dataUser = JSON.parse(dataUser);


    let str = `╓──▷「 Menu Command 」
║ Owner : Ryan_syah
║ Bot_name : SeeU`
    for(const key in dataUser) {
    if(key == "information" || key == "Note") console.log('skip');
    else {
        str+= `\n╟────「 ${ key } 」`
        dataUser[key].forEach(item => {
        if (item.status) str+= `\n║ ▹${ item.name }`;
        else str+= `\n║ ▹ ~${ item.name }~`;
        });
    }
    }

    str+= `\n╟─────「 Note 」
║ ▹ tanda [ ] pada command wajib di
║   isi
║ ▹ tanda ( ) pada command bisa
║   diabaikan
║ ▹ Tanda ~coret~ menandakan command
║   sedang tidak tersedia
║ ▹ Harap gunakan perintah dengan 
║   bijak
╙───────────────▷`

    return str;
}

function updatecmd(msg) {
    let cmd = msg.body;
    cmd = cmd.split(' ');
    const index = cmd.length - 1;

    let searchCmd = cmd.slice(1, index);
    searchCmd = searchCmd.join(" ");

    const dir = './database/data';

    let data = fs.readFileSync(dir, 'utf-8');
    data = JSON.parse(data);

    if(cmd[index] != 'of' && cmd[index] != 'on') return msg.reply('sepertinya formatmu salah, kirim kembali dengan format /updatecmd [command] [on/of]');

    for(const key in data) {
        if(key == "information" || key == "Note") console.log('skip');
        else {
            data[key].forEach(item => {
                if(item.name.includes(searchCmd)) {
                    if (cmd[index] == 'on') item.status = true;
                    else if (cmd[index] == 'of') item.status = false;
                } 
            });
        }
    }

    fs.writeFileSync(dir, JSON.stringify(data, null, 2));

    return msg.reply('berhasil mengupdate command');
}

async function getApiEden() {
    for (const apikey of EDEN_APIKEY) {
        const url = 'https://api.edenai.run/v2/text/chat';
        const headers = {
            'accept': 'application/json',
            'authorization': `Bearer ${apikey}`,
            'content-type': 'application/json'
        };

        const data = {
            response_as_dict: true,
            attributes_as_list: false,
            show_base_64: true,
            show_original_response: false,
            temperature: 0,
            max_tokens: 1000,
            tool_choice: "auto",
            providers: [
                "openai/gpt-3.5-turbo-0125",
            ],
            text: "halo"
        };

        try {
            const response = await axios.post(url, data, { headers, timeout: 120000 });
            return apikey; // Return true if a valid API key is found
        } catch (error) {

        }

        // Optional: Add a delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500)); // Delay for 1 second
    }

    return false; // Return false if no valid API key is found
}

async function getInfoYt(url) {
    let repeat = 0;
    let info = await getInfo();
    return info;
    async function getInfo() {
        if(repeat >= 5) return 'gagal';
        try {
            const agentForARandomIP = ytdl.createAgent(undefined, {
                localAddress: getRandomIPv6("2001:2::/48"),
            });

            const info = await ytdl.getInfo(url, { agentForARandomIP });

            return info
        } catch (e) {
            console.log(`Gagal mengambil agent: ${ e.message }`);
            repeat+=1;
            return await getInfo();
        }
    }
}

module.exports = {
    bugreport, ceklimit, limit, newupdate, setName, setLang, resetLimit, backup_database, sendupdate, ceklist_user, updateAPI, delAPI, getMenu, updatecmd, getApiEden, getInfoYt
}