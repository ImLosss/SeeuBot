const yt = require('@distube/ytdl-core');
const axios = require('axios');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const { uploadFile, generatePublicURL, deleteFile } = require('./drive');
const { MessageMedia } = require('whatsapp-web.js');
const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');
const { ceklimit } = require('./function');

const cookies = [
    {
        "domain": ".youtube.com",
        "expirationDate": 1764862481.303845,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "g.a000pggqO02EqUxA8XRNfFc03_GyZIAqck57NV1xmKQEbMXRLenzZjmFtZAkmXDZ1RmHrk-AFwACgYKAfsSARASFQHGX2MiRR9FwOgy1toakWy8ccuMJxoVAUF8yKrMOWUaMHpCQFxw_m3b40Em0076"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1730304242.360786,
        "hostOnly": false,
        "httpOnly": true,
        "name": "GPS",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "1"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1761838481.303345,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSIDTS",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "sidts-CjEBQT4rX6LE42mXIgU-8sPoOQxgVYeO4GXfVCqyMJSRTgXAkFrjWIvaazm8tJJWfPuWEAA"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1764862481.303625,
        "hostOnly": false,
        "httpOnly": false,
        "name": "SAPISID",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "QhQTVH5kD1OMZMVJ/AWCOCUNpxT7jtvu9a"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1761838528.726985,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSIDCC",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "AKEyXzVBnOyWEYAoTxKGk-To7IaC68MJs4TA_VHsi0DlvQNP7pzVdW2U8-jgAUaEVLRQ1zPb"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1764862481.303543,
        "hostOnly": false,
        "httpOnly": true,
        "name": "SSID",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "Ayubft530vPTWC4kV"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1764862481.303664,
        "hostOnly": false,
        "httpOnly": false,
        "name": "__Secure-1PAPISID",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "QhQTVH5kD1OMZMVJ/AWCOCUNpxT7jtvu9a"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1764862481.303774,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSID",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "g.a000pggqO02EqUxA8XRNfFc03_GyZIAqck57NV1xmKQEbMXRLenztL-vMh0i4vIJmRsvtUE54QACgYKAQYSARASFQHGX2Mihl0tT3sW_yD8F6mC2bD1mhoVAUF8yKqCtf7l0YYpRWu6jVcnAq3c0076"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1764862481.303699,
        "hostOnly": false,
        "httpOnly": false,
        "name": "__Secure-3PAPISID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "QhQTVH5kD1OMZMVJ/AWCOCUNpxT7jtvu9a"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1761838528.727022,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSIDCC",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "AKEyXzUzRGDcKYsmuVEepHHxXwNWRn92kZNZoe86Fd7Tli-PGJ2rW88AtOhVshLO3zKvk0wm"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1761838481.303476,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSIDTS",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "sidts-CjEBQT4rX6LE42mXIgU-8sPoOQxgVYeO4GXfVCqyMJSRTgXAkFrjWIvaazm8tJJWfPuWEAA"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1764862481.390831,
        "hostOnly": false,
        "httpOnly": true,
        "name": "LOGIN_INFO",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "AFmmF2swRgIhAMqa4NNamILon9m-t0xPw8W4oQ7DPKUsDgO2K4l09Nv9AiEAvr-jGhzfCr59vlbKHw8FalSgj4edsekeBLOWD2YheT0:QUQ3MjNmeUJxNC1Ba1JTSTZuWUU0TElOSklHZTk5c3phakFSVFRZejJPdURxMEp1dG1wNGFoM2dkMk5GVUdiZlE4MlFZbkdacUFNaGhqMDJfS19vbEM0N3ZKNVl2REFjcnhZTE1MaFRfdVBCOU5LcVN0UW5jSUJURm1pOWR6cFQ2dlI4ZFpqOExlUFZBWWwyRkhkWV92Z3dRamVOTlVReThR"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1764862484.548717,
        "hostOnly": false,
        "httpOnly": false,
        "name": "PREF",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "tz=UTC"
    }
];

const agent = yt.createAgent(cookies);

let status = false;

const regex = /^[a-zA-Z0-9_()\s.-]+$/;

const ythd = async function (msg, sender, client) { 

    try{
        const chat = await msg.getChat();

        if(!chat.isGroup) {
            const limit = await ceklimit(sender);
            if(limit) return msg.reply('Jumlah pemakaian Private anda hari ini telah mencapai batas, anda dapat menggunakan command kembali besok. Masuk ke grup SeeuBot agar dapat menggunakan command kembali:\n\nhttps://chat.whatsapp.com/Jy1xiPwFMl6I5TaVciJA3P');
        }

        let pesan = msg.body;
        pesan = pesan.split(' ');
        let cmdname = 'ythd'
        if(pesan.length >= 3) {
            cmdname = pesan.slice(2, pesan.length);
            cmdname = cmdname.join(" ");
        }
        if(pesan[1] == "reset") {
            status = false;
            return msg.reply('berhasil mereset fitur');
        }
        if(pesan[1] == null) return msg.reply('Formatmu salah, kirim kembali dengan format */ytv [link] (nama_file)*');
        myurl = pesan[1];
        if(!yt.validateURL(myurl, { agent })){
            return msg.reply('url mu salah, coba periksa kembali')
        }
        if(status == true) {
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

        const info = await yt.getInfo(myurl, { agent });
        const title = info.videoDetails.title;
        const duration = info.videoDetails.lengthSeconds;
        console.log(duration);
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
            const video = yt(myurl, { quality: 'highestvideo', format: 'mp4', agent: agent });
            video.pipe(fs.createWriteStream('./database/input_video.mp4'));
            video.on('error', (err) => {
                console.log('Error:',err.message);
                msg.reply(`Error, coba kembali`)
                .catch(() => {
                    chat.sendMessage(`Error, coba kembali`);
                })
                status = false;
                cmdname = 'ythd';
            })
            video.on('end', () => {
                clearTimeout(timer);
                console.log('Video berhasil diunduh.');
                
                // Unduh file audio
                const audio = yt(myurl, { quality: 'highestaudio', format: 'mp3', agent: agent });
                audio.pipe(fs.createWriteStream('./database/input_audio.mp3'));
            
                audio.on('end', () => {
                    clearTimeout(timer2);
                    console.log('Audio berhasil diunduh.');
                    // Gabungkan audio dan video

                    const inputVideoPath = './database/input_video.mp4';
                    const inputAudioPath = './database/input_audio.mp3';
                    const outputFilePath = `./database/${ cmdname }.mp4`;
                    
                    mergeAudioAndVideo(inputVideoPath, inputAudioPath, outputFilePath)
                    .then((result) => {
                        chat.sendMessage('[⏳] File anda sedang diupload...')
                        console.log(result);
                        let fileSize = null;
                        fs.stat(outputFilePath, (err, stats) => {
                            if(err) {
                                return msg.reply('Error')
                                .catch(() => {
                                    chat.sendMessage('Error');
                                })
                            }
                            fileSize = (stats.size / 1024 / 1024).toFixed(2);
                        })
                        fs.unlinkSync(inputAudioPath, (err) => {
                            if(err){
                                console.log('gagal hapus data');
                            }
                        })
                        fs.unlinkSync(inputVideoPath, (err) => {
                            if(err){
                                consolelog('gagal hapus data');
                            }
                        })
                        download(thumburl, './database/thumbnail.jpg')
                        .catch(() => {
                            status = false;
                            return msg.reply('Gagal saat mengunduh file anda')
                            .catch(() => {
                                return chat.sendMessage('Gagal saat mengunduh file anda')
                            })
                        })
                        uploadFile(outputFilePath, `${ cmdname }.mp4`)
                        .then((result) => {
                            fs.unlinkSync(outputFilePath);
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
                                const media = MessageMedia.fromFilePath('./database/thumbnail.jpg');
                                chat.sendMessage(media, { caption: `Ikuti link berikut untuk mengunduh file anda:\n${ result.webViewLink }\n\n_Link hanya berlaku selama 1 jam_\n_File size: ${ fileSize }mb_` })
                                .then(() => {
                                    msg.reply(`Video *${ title }* berhasil diunduh😉`)
                                    .catch(() => {
                                        chat.sendMessage(`Video *${ title }* berhasil diunduh😉`);
                                    })
                                    fs.unlinkSync('./database/thumbnail.jpg', (err) => {
                                        if(err) {
                                            console.log('gagal hapus data')
                                        }
                                    })
                                    status = false;
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
                    })
                });
                let timer2 = setTimeout(() => {
                    audio.destroy();
                    console.log('download dibatalkan');
                    status = false;
                }, 120000);
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
        status = false;
        cmdname = 'ythd'
    }
}

async function mergeAudioAndVideo(inputVideo, inputAudio, output) {
    return new Promise((resolve, reject) => {
        const ffmpegArgs = [
            '-i', inputVideo,
            '-i', inputAudio,
            '-c:v', 'copy',
            '-c:a', 'aac',
            '-strict', 'experimental',
            output
        ];
    
        // Jalankan ffmpeg dengan argumen yang telah ditentukan
        const ffmpegProcess = spawn(ffmpegPath, ffmpegArgs);
    
        ffmpegProcess.stdout.on('data', (data) => {
            // console.log(`stdout: ${data}`);
        });
    
        ffmpegProcess.stderr.on('data', (data) => {
            // console.error(`stderr: ${data}`);
        });
    
        ffmpegProcess.on('close', (code) => {
            if (code === 0) {
                resolve('Penggabungan audio dan video selesai.');
            } else {
                reject(new Error(`Proses ffmpeg berakhir dengan kode error ${code}`));
            }
        });
    });
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
    ythd
}