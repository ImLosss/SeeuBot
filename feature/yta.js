const yt = require('@distube/ytdl-core');
const axios = require('axios');
const fs = require('fs');
const { uploadFile, generatePublicURL, deleteFile } = require('./drive');
const { MessageMedia } = require('whatsapp-web.js');
const col = require('colors');
const { spawn } = require('child_process');
const ffmpegStatic = require('ffmpeg-static');
const NodeID3 = require('node-id3');
const { CLOUD_MERSIVE_API } = require('../config');
const { ceklimit, getInfoYt } = require('./function');

var CloudmersiveImageApiClient = require('cloudmersive-image-api-client');
var defaultClient = CloudmersiveImageApiClient.ApiClient.instance;

// Configure API key authorization: Apikey
var Apikey = defaultClient.authentications['Apikey'];
Apikey.apiKey = CLOUD_MERSIVE_API;

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

var apiInstance = new CloudmersiveImageApiClient.ConvertApi();

let status = false;

const regex = /^[a-zA-Z0-9_()\s.-]+$/;

const yta = async function (msg, sender, client) { 

    try{
        const chat = await msg.getChat();

        if(!chat.isGroup) {
            const limit = await ceklimit(sender);
            if(limit) return msg.reply('Jumlah pemakaian Private anda hari ini telah mencapai batas, anda dapat menggunakan command kembali besok. Masuk ke grup SeeuBot agar dapat menggunakan command kembali:\n\nhttps://chat.whatsapp.com/Jy1xiPwFMl6I5TaVciJA3P');
        }

        let pesan = msg.body;
        pesan = pesan.split(' ');
        let cmdname = 'yta'
        if(pesan.length >= 3) {
            cmdname = pesan.slice(2, pesan.length);
            cmdname = cmdname.join(" ");
        }
        myurl = pesan[1];
        if(pesan[1] == null) return msg.reply('Formatmu salah, kirim kembali dengan format */yta [link] (nama_file)*');
        if(pesan[1] == "reset") {
            status = false;
            cmdname = 'yta'
            return msg.reply('berhasil mereset fitur');
        }
        if(!yt.validateURL(myurl)){
            cmdname = 'yta';
            status = false;
            return msg.reply('url mu salah, coba periksa kembali')
        }
        if(status == true) {
            cmdname = 'yta'
            return msg.reply('ada unduhan yang sedang berjalan, coba kembali setelah 1-3 menit');
        }

        if(!regex.test(cmdname)) {
            cmdname = 'yta';
            status = false;
            return msg.reply(`Penamaan file tidak boleh mengandung karakter yang dilarang *(\ / : * ? ” < > | etc“)*`)
            .catch(() => {
                return chat.sendMessage(`Penamaan file tidak boleh mengandung karakter yang dilarang *(\ / : * ? ” < > | etc“)*`)
            })
        }

        status = true;

        console.log(`from\t\t:`.green + `${ sender }`.gray);
        console.log(`fitur\t\t:`.green + `/yta`.gray);
        console.log(`Pesan\t\t:`.green + `${ pesan }`.gray);

        const path = `./database/${ cmdname }.mp4`
        const path2 = `./database/${ cmdname }.mp3`

        const info = await yt.getInfo(myurl, { agent });
        if (info == 'gagal') {
            status = false;
            return chat.sendMessage('Gagal mengambil info video, coba lagi...');
        }
        const title = info.videoDetails.title;
        const channel = info.videoDetails.author.name;
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

        await download(thumburl, './database/thumbyta.webp')
        .then((result) => { console.log(result) })
        .catch((err) => {
            console.log(err);
            status = false;
            cmdname = 'yta'
            return msg.reply('Gagal saat mengunduh file anda')
            .catch(() => {
                return chat.sendMessage('Gagal saat mengunduh file anda')
            })
        })

        if(duration <= min) {
            msg.reply('[⏳] Mulai mengunduh...')
            const video = yt(myurl, { quality: '18', format:'mp4', agent: agent });
            video.pipe(fs.createWriteStream(path));
            video.on('error', (err) => {
                console.log('Error:',err);
                fs.unlinkSync(path, (err) => {
                    if(err){
                        console.log('gagal hapus data');
                    }
                })
                status = false;
                cmdname = 'yta';
                return msg.reply(`Error, coba kembali`)
                .catch(() => {
                    return chat.sendMessage(`Error, coba kembali`);
                })
            })
            video.on('end', async() => {
                clearTimeout(timer);
                let fileSize = fs.statSync(path);
                fileSize = (fileSize.size / 1024 / 1024).toFixed(2);
                console.log(fileSize);
                await convertMP4AToMP3(path, path2)
                await changeTitleAndCover(cmdname, channel, path2)
                fs.unlinkSync(path);
                if(fileSize <= 30) {
                    msg.reply('[⏳] File anda sedang dikirim...');
                    const media = MessageMedia.fromFilePath(path2);
                    chat.sendMessage(media, { sendMediaAsDocument: true, caption: `Audio *${ title }* berhasil diunduh😉` })
                    .then(() => {
                        fs.unlinkSync(path2, (err) => {
                            if(err){
                                consolelog('gagal hapus data');
                            }
                        })
                        fs.unlinkSync('./database/thumbyta.jpg', (err) => {
                            if(err){
                                consolelog('gagal hapus data');
                            }
                        })
                        status = false;
                        cmdname = 'yta';
                    })
                } else {
                    chat.sendMessage('[⏳] File anda sedang diupload...');
                    let fileSize = fs.statSync(path2);
                    fileSize = (fileSize.size / 1024 / 1024).toFixed(2);
                    uploadFile(path2, `${ cmdname }.mp3`)
                    .then((result) => {
                        fs.unlinkSync(path2);
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
                            const media = MessageMedia.fromFilePath('./database/thumbyta.jpg');
                            chat.sendMessage(media, { caption: `Ikuti link berikut untuk mengunduh file anda:\n${ result.webViewLink }\n\n_Link hanya berlaku selama 1 jam_\n_File size: ${ fileSize }mb_` })
                            .then(() => {
                                msg.reply(`Audio *${ title }* berhasil diunduh😉`)
                                .catch(() => {
                                    chat.sendMessage(`Audio *${ title }* berhasil diunduh😉`);
                                })
                                fs.unlinkSync('./database/thumbyta.jpg', (err) => {
                                    if(err) {
                                        console.log('gagal hapus data')
                                    }
                                })
                                status = false;
                                cmdname = 'yta';
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
                cmdname = 'yta';
            }, 120000);
        } else {
            status = false;
            cmdname = 'yta';
            msg.reply('Video terlalu panjang (Maks: 60 menit)')
            .catch(() => {
                chat.sendMessage('Video terlalu panjang (Maks: 60 menit)')
            })
        }
    } catch (err) {
        console.log(err);
        status = false;
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
                setTimeout(() => {
                    tojpg()
                    .then((result) => {
                        if (result != './database/nothumb.jpeg') fs.unlinkSync(result);
                        resolve(result)
                    })
                }, 100);
            });

            response.data.on('error', (err) => {
                reject(err);
            });
        });
    } catch (err) {
        throw new Error(err);
    }
};

async function convertMP4AToMP3(inputFile, outputFile) {
    return new Promise((resolve, reject) => {
      const ffmpegArgs = [
        '-i', inputFile,
        '-c:a', 'libmp3lame',
        '-q:a', '2', // Kualitas audio (0 - 9, 2 adalah kualitas yang baik)
        outputFile
      ];
  
      // Jalankan ffmpeg dengan argumen yang telah ditentukan
      const ffmpegProcess = spawn(ffmpegStatic, ffmpegArgs);
  
      ffmpegProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });
  
      ffmpegProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
      });

      ffmpegProcess.stderr.on('error', (err) => {
        console.log(err)
      });
  
      ffmpegProcess.on('close', (code) => {
        if (code === 0) {
          resolve('Konversi MP4A ke MP3 selesai.');
        } else {
          reject(new Error(`Proses ffmpeg berakhir dengan kode error ${code}`));
        }
      });
    });
}

async function changeTitleAndCover(title, artist, filePath) {
    try {
      
      // Baca berkas gambar sampul album
      const coverArt = fs.readFileSync('./database/thumbyta.jpg');
      console.log(getRandomNumber());
  
      const tags = {
        title: title,
          artist: artist,
          album: getRandomNumber(),
          image: {
            mime: "image/jpeg",
            type: {
              id: 3,
              name: "front cover"
            },
            description: "none",
            imageBuffer: coverArt
          }
      }
  
      // Tulis metadata yang telah diubah ke file musik
      NodeID3.write(tags, filePath);
      // Baca metadata dari file musik
      const tags2 = NodeID3.read(filePath);
      console.log('Current tags:', tags2);
  
      console.log('Title and cover updated successfully!');
    } catch (error) {
      console.error('Error:', error);
    }
}

function getRandomNumber() {
    const min = 1;       // Nilai minimum
    const max = 1000000;    // Nilai maksimum
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function tojpg(){
    return new Promise((resolve, reject) => {
      var quality = 56; // Number | Set the JPEG quality level; lowest quality is 1 (highest compression), highest quality (lowest compression) is 100; recommended value is 75
      var imageFile = Buffer.from(fs.readFileSync("./database/thumbyta.webp").buffer); // File | Image file to perform the operation on.  Common file formats such as PNG, JPEG are supported.
  
      apiInstance.convertToJpg(quality, imageFile, (error, data) => {
        if (error) {
          console.log('error', error.message)
          resolve('./database/nothumb.jpeg');
        } else {
          // Simpan file hasil konversi
          fs.writeFile('./database/thumbyta.jpg', data, (err) => {
            if (err) {
              reject('Error saving file: ' + err);
            } else {
              resolve('./database/thumbyta.webp');
            }
          });
        }
      });
    });
}


module.exports = {
    yta
}