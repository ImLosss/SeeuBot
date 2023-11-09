const axios = require('axios');
const col = require('colors');
const { MessageMedia } = require('whatsapp-web.js');
const { ceklimit } = require('./function');
const fs = require('fs');

async function ai(msg, sender, client){
    console.log('jalan')
    try {
        const chat = await msg.getChat();

        if(!chat.isGroup) {
            const limit = await ceklimit(sender);
            if(limit) return msg.reply('Jumlah pemakaian Private anda hari ini telah mencapai batas, anda dapat menggunakan command kembali besok. Masuk ke grup SeeuBot agar dapat menggunakan command kembali:\n\nhttps://chat.whatsapp.com/IX4rq2WWN72BOEcvk46wnv');
        }

        let prompt = msg.body;

        console.log('\nfrom\t\t:'.green + `+${ sender }`.gray);
        console.log('fitur\t\t:'.green + `/ai`.gray.bold);
        console.log('pesan\t\t:'.green + `${ prompt }`.gray);

        prompt = prompt.split(' ');
        if(prompt.length <= 1) return msg.reply('Format anda salah, kirim kembali dengan format */ai [prompt]*');
        prompt = prompt.slice(1, prompt.length);
        prompt = prompt.join(' ');
        const text = prompt.toLowerCase();
        if(text == 'model') return changeModel(msg, sender, client);

        const dir_data_user = `database/data_user/${ sender }`;
        const fileData = fs.readFileSync(dir_data_user, 'utf-8');
        let data_user = JSON.parse(fileData);

        const options = {
                method: 'POST',
                url: 'https://api.prodia.com/v1/job',
                headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'X-Prodia-Key': 'd46c04cb-6ce1-4657-bbfd-8c0c77d6a162'
            },
                data: {
                sampler: 'DPM++ 2M Karras',
                prompt: prompt,
                model: data_user[0].aiModel,
                negative_prompt: 'nsfw, (((worst quality, low quality))), text, title, weird',
                seed: -1,
                upscale: true
            }
        };

        axios
            .request(options)
            .then(function (response) {
                let time;
                const data = setInterval(() => {
                    get(response.data.job)
                    .then((result) => {
                        console.log(result)
                        if(result.status == 'succeeded') { 
                        clearTimeout(time);
                        clearInterval(data);
                        download2(result.imageUrl)
                        .then(result => {
                            const media = new MessageMedia('image/png', result);
                            msg.reply(`*Generate Success:*\n\n*Model:* ${ data_user[0].aiModel }\n*Prompt:* ${ prompt }\n\n_Note:_\nChange aiModel send /ai model`).catch(err => { chat.sendMessage(`*Generate Success:*\n\n*Model:* ${ data_user[0].aiModel }\n*Prompt:* ${ prompt }\n\n_Note:_\nChange aiModel send /ai model`) })
                            return chat.sendMessage(media, { caption: '✅ Done' })
                        })
                        }
                    })
                }, 5000);
                time = setTimeout(() => {
                    clearInterval(data);
                    msg.reply('Request Timeout, coba kembali...').catch(() => { chat.sendMessage('Request Timeout, coba kembali...') });
                }, 90000);
            })
            .catch(function (error) {
                console.error(error);
            });
    } catch(err) {
        console.log(err)
        msg.reply('Error')
    }
}

async function get(id){
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      url: `https://api.prodia.com/v1/job/${ id }`,
      headers: {
        accept: 'application/json',
        'X-Prodia-Key': 'd46c04cb-6ce1-4657-bbfd-8c0c77d6a162'
      }
    };
    
    axios
      .request(options)
      .then(function (response) {
        resolve(response.data)
      })
      .catch(function (error) {
        reject(error);
      });
    
  });
}

const download2 = async (url) => {
  console.log(url);
  return new Promise((resolve, reject) => {
      try {
          axios({
              method: 'GET',
              url: url,
              responseType: 'arraybuffer'
          })
          .then((response) => {
              const base64Data = Buffer.from(response.data, 'binary').toString('base64');
              console.log(response.data)
              resolve(base64Data);
          });   
      } catch (err) {
          reject('Error:',err.message);
      }
  });
};

async function changeModel(msg, sender, client) {
    const chat = await msg.getChat();

    const dir_data_user = `database/data_user/${ sender }`;
    const fileData = fs.readFileSync(dir_data_user, 'utf-8');
    let data_user = JSON.parse(fileData);

    const options = {
        method: 'GET',
        url: 'https://api.prodia.com/v1/models/list',
        headers: {
            accept: 'application/json',
            'X-Prodia-Key': 'd46c04cb-6ce1-4657-bbfd-8c0c77d6a162'
        }
    };

    axios
    .request(options)
    .then(function (response) {
        const item = response.data;
        let reply = '*List Model:*\n\n'
        let no = 1;
        for(let a of item) {
            reply += `*[${ no }]* ${ a }\n`;
            no+=1;
        }
        reply += '\n_*Reply this message with index model*_';
        let timer = null;
        const listener = async (msg2) => {
            const pesan = msg2.body
            if (msg2.hasQuotedMsg) {
                const reply = await msg2.getQuotedMessage();
                const msg_reply = reply.body;
                if((pesan >= 1 && pesan <= item.length) && msg_reply.includes('*List Model:*\n\n')) {
                    clearTimeout(timer);
                    reply.delete(true);
                    const model = item[pesan - 1];
                    data_user[0].aiModel = model;
                    fs.writeFileSync(dir_data_user, JSON.stringify(data_user));
                    return msg.reply(`The model has been successfully changed to model\n*${ model }*`);
                } else if (msg_reply.includes('*List Model:*\n\n')) {
                    msg.reply('Please reply to the message according to the index above.');
                }
            }
            if(pesan.includes("*List Model:*\n\n")) {
                timer = setTimeout(async => {
                    return msg2.delete(true);
                },29000)
            }
        };
        // Menambahkan listener ke chat
        client.addListener('message_create', listener);
        // Mengatur waktu tunggu maksimum
        setTimeout(() => {
            // Timeout tercapai, menghentikan listener dan membersihkan listener
            console.log('menghapus listener')
            return client.removeListener('message_create', listener);
        }, 30000); // 30 detik (dalam milidetik)
        msg.reply(reply).catch(err => chat.sendMessage(reply))
    })
    .catch(function (error) {
        console.error(error);
    });
}

module.exports = {
    ai
}