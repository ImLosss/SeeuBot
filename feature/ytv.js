const yt = require('ytdl-core');
const axios = require('axios');
const fs = require('fs');
const { uploadFile, generatePublicURL, deleteFile } = require('./drive');
const { MessageMedia } = require('whatsapp-web.js');
const col = require('colors');
const { ceklimit } = require('./function');

let status = false;

const regex = /^[a-zA-Z0-9_()\s.-]+$/;

const ytv = async function (msg, sender, client) { 

    try{
        const chat = await msg.getChat();

        if(!chat.isGroup) {
            const limit = await ceklimit(sender);
            if(limit) return msg.reply('Jumlah pemakaian Private anda hari ini telah mencapai batas, anda dapat menggunakan command kembali besok. Masuk ke grup SeeuBot agar dapat menggunakan command kembali:\n\nhttps://chat.whatsapp.com/Jy1xiPwFMl6I5TaVciJA3P');
        }

        let pesan = msg.body;
        pesan = pesan.split(' ');
        let cmdname = 'ytv'
        if(pesan.length >= 3) {
            cmdname = pesan.slice(2, pesan.length);
            cmdname = cmdname.join(" ");
        }
        if(pesan[1] == "reset") {
            status = false;
            cmdname = 'ytv'
            return msg.reply('berhasil mereset fitur');
        }
        if(pesan[1] == null) return msg.reply('Formatmu salah, kirim kembali dengan format */ytv [link] (nama_file)*');
        myurl = pesan[1];
        if(!yt.validateURL(myurl)){
            cmdname = 'ytv';
            return msg.reply('url mu salah, coba periksa kembali')
        }
        if(status == true) {
            cmdname = 'ytv'
            return msg.reply('ada unduhan yang sedang berjalan, coba kembali setelah 1-3 menit');
        }

        if(!regex.test(cmdname)) {
            cmdname = 'ytv';
            status = false;
            return msg.reply(`Penamaan file tidak boleh mengandung karakter yang dilarang *(\ / : * ? ” < > | etc“)*`)
            .catch(() => {
                return chat.sendMessage(`Penamaan file tidak boleh mengandung karakter yang dilarang *(\ / : * ? ” < > | etc“)*`)
            })
        }

        console.log(`from\t\t:`.green + `${ sender }`.gray);
        console.log(`fitur\t\t:`.green + `/ytv`.gray);
        console.log(`Pesan\t\t:`.green + `${ pesan }`.gray);

        const path = `./database/${ cmdname }.mp4`

        const info = await yt.getInfo(myurl);
        const title = info.videoDetails.title;
        const duration = info.videoDetails.lengthSeconds;
        let min = 60 * 60;
        let thumburl = undefined;

        for(i = 4; i > 0; i--) {
            try{
                thumburl = info.player_response.videoDetails.thumbnail.thumbnails[i].url;
            } catch(err) {
                console.log('gagal mengambil thumbnail link ke', i);
                console.log('Mencoba mengambil link ke', i - 1);
            }
            if(thumburl != undefined) {
                break;
            }
        }

        if(duration <= min) {
            status = true;
            msg.reply('[⏳] Mulai mengunduh...')
            const video = yt(myurl, { quality: '18', format: 'mp4'});
            video.pipe(fs.createWriteStream(path));
            video.on('error', (err) => {
                console.log('Error1:',err);
                msg.reply(`Error, coba kembali`)
                .catch(() => {
                    chat.sendMessage(`Error, coba kembali`);
                })
                status = false;
                cmdname = 'ytv';
            })
            video.on('end', () => {
                clearTimeout(timer);
                let fileSize = fs.statSync(path);
                fileSize = (fileSize.size / 1024 / 1024).toFixed(2);
                console.log(fileSize);
                if(fileSize <= 30) {
                    msg.reply('[⏳] File anda sedang dikirim...');
                    const media = MessageMedia.fromFilePath(path);
                    chat.sendMessage(media, { sendMediaAsDocument: true, caption: `Video *${ title }* berhasil diunduh😉` })
                    .then(() => {
                        fs.unlinkSync(path, (err) => {
                            if(err){
                                consolelog('gagal hapus data');
                            }
                        })
                        status = false;
                        cmdname = 'ytv';
                    })
                } else {
                    chat.sendMessage('[⏳] File anda sedang diupload...');
                    let fileSize = fs.statSync(path);
                    fileSize = (fileSize.size / 1024 / 1024).toFixed(2);
                    download(thumburl, './database/thumbytv.jpg')
                    .catch(() => {
                        status = false;
                        return msg.reply('Gagal saat mengunduh file anda')
                        .catch(() => {
                            return chat.sendMessage('Gagal saat mengunduh file anda')
                        })
                    })
                    uploadFile(path, `${ cmdname }.mp4`)
                    .then((result) => {
                        fs.unlinkSync(path);
                        generatePublicURL(result)
                        .then((result) => {
                            console.log(result);
                            let timer = (1000 * 60) * 60;
                            const listener = async (send) => {
                                const pesan = send.body;
                                if(send.fromMe && pesan == `Ikuti link berikut untuk mengunduh file anda:\n${ result.webViewLink }\n\n_Link hanya berlaku selama 1 jam_\n_File size: ${ fileSize }mb_`) {
                                    setTimeout(async => {
                                        send.delete(true);
                                    }, timer);
                                }
                            };
                            // Menambahkan listener ke chat
                            client.addListener('message_create', listener);
                            // Mengatur waktu tunggu maksimum
                            setTimeout(() => {
                                // Timeout tercapai, menghentikan listener dan membersihkan listener
                                client.removeListener('message_create', listener);
                                console.log(`info\n\n:`.green + 'berhasil menghapus listener yang dibuat'.gray);
                            }, timer + 1000); // 20 detik (dalam milidetik)
                            const media = MessageMedia.fromFilePath('./database/thumbytv.jpg');
                            chat.sendMessage(media, { caption: `Ikuti link berikut untuk mengunduh file anda:\n${ result.webViewLink }\n\n_Link hanya berlaku selama 1 jam_\n_File size: ${ fileSize }mb_` })
                            .then(() => {
                                msg.reply(`Video *${ title }* berhasil diunduh😉`)
                                .catch(() => {
                                    chat.sendMessage(`Video *${ title }* berhasil diunduh😉`);
                                })
                                fs.unlinkSync('./database/thumbytv.jpg', (err) => {
                                    if(err) {
                                        console.log('gagal hapus data')
                                    }
                                })
                                status = false;
                                cmdname = 'ytv';
                            })
                            setTimeout(() => {
                                deleteFile(result.id)
                                .then(() => {
                                    console.log(`info\n\n:`.green + `berhasil hapus data`.gray);
                                })
                                .catch((err) => {
                                    console.log(err.message);
                                })
                            }, timer);
                        })
                    })
                }
            });
            let timer = setTimeout(() => {
                video.destroy();
                console.log('download dibatalkan');
                status = false;
            }, 120000);
        } else {
            msg.reply('Video terlalu panjang (Maks: 60 menit)')
            .catch(() => {
                chat.sendMessage('Video terlalu panjang (Maks: 60 menit)')
            })
        }
    } catch (err) {
        console.log(err);
        msg.reply('Error, coba kembali')
        .catch(() => {
            chat.sendMessage('Error, coba kembali');
        })
    }
}

const download = async (url, path) => {
    try {
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'stream'
        });

        response.data.pipe(fs.createWriteStream(path));

        return new Promise((resolve, reject) => {
            response.data.on('end', () => {
                resolve(path);
            });

            response.data.on('error', (err) => {
                reject(err);
            });
        });
    } catch (err) {
        throw new Error(err);
    }
};

module.exports = {
    ytv
}