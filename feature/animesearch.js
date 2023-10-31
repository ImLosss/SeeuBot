const Jikan = require('jikan4.js');
const { ceklimit } = require('./function');

const client = new Jikan.Client()

const animesearch = async (msg, sender) => {
    try {
        const pesan = msg.body;
        const chat = await msg.getChat();

        if(!chat.isGroup) {
            const limit = await ceklimit(sender);
            if(limit) return msg.reply('Jumlah pemakaian Private anda hari ini telah mencapai batas, anda dapat menggunakan command kembali besok. Masuk ke grup SeeuBot agar dapat menggunakan command kembali:\n\nhttps://chat.whatsapp.com/IX4rq2WWN72BOEcvk46wnv');
        }

        console.log(`\nfrom\t\t:`.green + `${ sender }`.gray.bold);
        console.log(`fitur\t\t:`.green + `/animeinfo`.gray.bold);
        console.log(`pesan\t\t:`.green + `${ pesan }`.gray.bold);

        let searchString = pesan.split(' ');

        searchString = searchString.slice(1,searchString.length);
        searchString = searchString.join(" ");

        if(searchString.length > 110) {
            return msg.reply('Title terlalu panjang')
            .catch(() => {
                return chat.sendMessage('Title terlalu panjang')
            })
        }
        
        const result = (await client.anime.search(searchString)).map((anime) => {
            const genres = anime.genres.map((genre) => genre.name).join(', ');
            const aired = anime.airInfo;
        
            let year = null;
            if (anime.airInfo.airedFrom != null) {
                year = aired.airedFrom.getFullYear();
            }
            return {
                title: anime.title.default,
                year: year,
                episodes: anime.episodes,
                genre: genres,
                id: anime.id,
                score: anime.score
            }
        });
        

        if(result.length > 0){
            let reply = "";
            result.slice(0, 5).forEach((anime) => {
                let animeId = '1000' + anime.id;
                let trueID = animeId.replace("1000","");
                reply += `
*title:* ${ anime.title }
*Genre:* ${ anime.genre }
*Episode:* ${ anime.episodes }
*year:* ${ anime.year }
*Score:* ${ anime.score }
*ID:* ${ animeId }
*TrueID:* ${ trueID }
                `
            });
            msg.reply(reply)
            .catch(() => {
                chat.sendMessage(reply);
            })
            msg.reply('untuk informasi lebih lengkap kirim */animeInfo [ID_anime]*')
            .catch(() => {
                chat.sendMessage('untuk informasi lebih lengkap kirim */animeInfo [ID_anime]*')
            })
        } else {
            msg.reply('tidak menemukan hasil')
            .catch(() => {
                chat.sendMessage('tidak menemukan hasil')
            })
        }
    } catch (e) {
        msg.reply('terjadi kesalahan')
        .catch(() => {
            chat.sendMessage('terjadi kesalahan')
        })
        console.log(`Error\t\t:`.red + `${ e.message }`)
    }
}

module.exports = {
    animesearch
}