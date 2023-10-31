const Jikan = require('jikan4.js');
const col = require('colors');
const axios = require('axios');
const { MessageMedia } = require('whatsapp-web.js');
const translate = require('translate-google-api');
const { ceklimit } = require('./function');

const client = new Jikan.Client();

const animeinfo = async (msg, sender) => {

    const chat = await msg.getChat();

    if(!chat.isGroup) {
        const limit = await ceklimit(sender);
        if(limit) return msg.reply('Jumlah pemakaian Private anda hari ini telah mencapai batas, anda dapat menggunakan command kembali besok. Masuk ke grup SeeuBot agar dapat menggunakan command kembali:\n\nhttps://chat.whatsapp.com/IX4rq2WWN72BOEcvk46wnv');
    }

    let id = msg.body;

    console.log(`\nfrom\t\t:`.green + `${ sender }`.gray.bold);
    console.log(`fitur\t\t:`.green + `/animeinfo`.gray.bold);
    console.log(`pesan\t\t:`.green + `${ id }`.gray.bold);

    id = id.split(' ');

    id = id[1];

    if(id.startsWith('1000') && id != '1000') {
        id = id.replace("1000","");
    }

    axios.get(`https://api.jikan.moe/v4/anime/${id}`, {
        headers: {
            'content-type': 'application/json'
        },
        timeout: 30000
    })
    .then(async response => {
        const anime = response.data.data
        let strTitle = anime.titles.map(titleobj => titleobj.title);
        let genres = anime.genres.map(genre => genre.name);
        genres = genres.join(', ');
        strTitle = strTitle.join(', ');

        // Menerjemahkan synopsis ke bahasa Indonesia
        let synopsisId = anime.synopsis;
        try {
            synopsisId = await translate(synopsisId, { from: 'en', to: 'id' });
        } catch (err) {
            console.log('error\t\t:'.red + `${ err }`.gray.bold);
            if (synopsisId == null) {
                synopsisId = 'Tidak tersedia';
            }
        }
        
        const info = {
            titles: strTitle,
            genre: genres,
            episodes: anime.episodes,
            duration: anime.duration,
            status: anime.status,
            musim: anime.season,
            year: anime.year,
            aired: anime.aired.string,
            score: anime.score,
            broadcast: anime.broadcast.string,
            rank: anime.rank,
            synopsis: synopsisId
        }

        const reply = `*Titles:* ${ info.titles }
*🎬Genres:* ${ info.genre }
*📺Episodes:* ${ info.episodes }
*⏳Duration:* ${ info.duration }
*🏁Status:* ${ info.status }
*🌸Musim:* ${ info.musim }
*📅Year:* ${ info.year }
*📆Aired:* ${ info.aired }
*⭐Score:* ${ info.score }
*🥇Rank:* ${ info.rank }
*🔴Broadcast:* ${ info.broadcast }

*Synopsis:*
${ info.synopsis }`;

        const urlArr = ['large_image_url', 'small_image_url', 'image_url'];

        let urlobj = anime.images.jpg;
        let url;
        for (let index = 0; index < urlArr.length; index++) {
            url = urlobj[urlArr[index]];
            if(url != undefined || url != null) break;
        }
        console.log(url)

        await download(url)
        .then((result) => {
            const base64Data = Buffer.from(result, 'binary').toString('base64');
            const media = new MessageMedia('image/jpg', base64Data);

            return chat.sendMessage(media, { caption: reply });
        })
    })
    .catch(err => {
        console.log(err);
        if (err.response && err.response.data && err.response.data.message) {
            if (err.response.data.message === 'Resource does not exist') return msg.reply('ID tidak ditemukan').catch(()=> { return chat.sendMessage('ID tidak ditemukan') });
            else return msg.reply('Error').catch(() => { return chat.sendMessage('Error') });
        } else return msg.reply('Error').catch(() => { return chat.sendMessage('Error') });
    })
};

const download = async (url) => {
    try {
        return new Promise((resolve, reject) => {
            axios({
                method: 'GET',
                url: url,
                responseType: 'arraybuffer'
            })
            .then(response => {
                resolve(response.data);
            })
            .catch(err => {
                reject(err);
            })
        });
    } catch (err) {
        throw new Error(err);
    }
};

module.exports = {
  animeinfo
};
