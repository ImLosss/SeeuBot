const axios = require('axios');
const cheerio = require('cheerio');
const { GENIUS_API } = require('../config');
const { MessageMedia } = require('whatsapp-web.js');
const { ceklimit } = require('./function');

async function musicinfo(msg, sender) {
    try {
        const pesan = msg.body
        const chat = await msg.getChat();

        if(!chat.isGroup) {
            const limit = await ceklimit(sender);
            if(limit) return msg.reply('Jumlah pemakaian Private anda hari ini telah mencapai batas, anda dapat menggunakan command kembali besok. Masuk ke grup SeeuBot agar dapat menggunakan command kembali:\n\nhttps://chat.whatsapp.com/IX4rq2WWN72BOEcvk46wnv');
        }

        console.log(`\nfrom\t\t:`.green + `${ sender }`.gray.bold);
        console.log(`fitur\t\t:`.green + `/musicinfo`.gray.bold);
        console.log(`pesan\t\t:`.green + `${ pesan }`.gray.bold);

        let searchQuery = pesan.split(' ');

        if (searchQuery[1] == null) return msg.reply('Format anda salah, kirim kembali dengan format */musicinfo [title]*')

        searchQuery = searchQuery.slice(1, searchQuery.length);
        searchQuery = searchQuery.join(" ");
        
        // Cari lagu berdasarkan judul dan artis
        const searchResponse = await axios(`https://api.genius.com/search?q=${encodeURIComponent(searchQuery)}`, {
            headers: {
                Authorization: `Bearer ${ GENIUS_API }`,
            },
        });

        if (searchResponse.data.response.hits.length > 0) {
            // Jika hasil ditemukan, ambil lirik dari lagu pertama
            const songId = searchResponse.data.response.hits[0].result.id;

            const lyricsResponse = await axios(`https://api.genius.com/songs/${songId}`, {
                headers: {
                    Authorization: `Bearer ${ GENIUS_API }`,
                },
            });

            const info = lyricsResponse.data.response.song;

            let string = '';
            info.media.map(media => {
                string += `*${ media.provider }:* ${ media.url }\n`
            })

            const data = {
                title: info.title,
                artist: info.artist_names,
                fullTitle: info.full_title,
                language: info.language,
                release: info.release_date,
                id: info.id,
                media: string
            }

            let url = `https://genius.com${lyricsResponse.data.response.song.path}`

            const lyrics = await fetchLyrics(url, msg);
            const reply = `*Title:* ${data.title}
*Artist:* ${ data.artist }
*Full_title:* ${ data.fullTitle }
*Language:* ${ data.language }
*Release:* ${ data.release }
${ data.media }
*Lyrics:*
${ lyrics }`;
            
            await download(info.song_art_image_url)
            .then((result) => {
                const base64Data = Buffer.from(result, 'binary').toString('base64');
                const media = new MessageMedia('image/jpg', base64Data);
    
                return chat.sendMessage(media, { caption: reply });
            })    
        } else {
            return msg.reply('Lagu tidak ditemukan').catch(() => {chat.sendMessage('Lagu tidak ditemukan')})
        }
    } catch (error) {
        console.error('Terjadi kesalahan1:', error.message);
        msg.reply(`Error: ${ error.message }`).catch(() => {chat.sendMessage(`Error: ${ error.message }`)})
    }
}

async function fetchLyrics(url, msg) {
    try {
        const chat = await msg.getChat();

        const response = await axios.get(url);
        if (response.status !== 200) {
            throw new Error('Gagal mengambil halaman.');
        }

        const $ = cheerio.load(response.data);

        const lyricsContainer = $('#lyrics-root');
        const lyricsText = lyricsContainer.html();

        const cleanedLyrics =lyricsText
            .replace(/<br>/g, '\n')
            .replace(/&amp;/g, '&')
            .replace(/<[^>]*>/g, '')
            .replace(/Embed$/, '')

        return cleanedLyrics;
    } catch (error) {
        console.error('Terjadi kesalahan:', error.message);
        return msg.reply(`Error: ${ error.message }`).catch(() => {chat.sendMessage(`Error: ${ error.message }`)})
    }
}

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
    musicinfo
}