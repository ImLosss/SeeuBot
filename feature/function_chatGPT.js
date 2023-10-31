const axios = require('axios');
const Jikan = require('jikan4.js');
const fs = require('fs');
const cheerio = require('cheerio');
const { GENIUS_API } = require('../config');

const client = new Jikan.Client();

async function getAnimeById(id) {
    id = id.id;
    try {
        const response = await axios.get(`https://api.jikan.moe/v4/anime/${id}`, {
            timeout: 30000
        })
        const info = response.data.data;
        let strTitle = info.titles.map(titleobj => titleobj.title);
        let genres = info.genres.map(genreobj => genreobj.name);
        let themes = info.themes.map(themeobj => themeobj.name);
        strTitle = strTitle.join(', ');
        genres = genres.join(', ');
        themes = themes.join(', ');
        
        const animeData = {
            titles: strTitle,
            genres: genres,
            themes: themes,
            url: info.url,
            type: info.type,
            episodes: info.episodes,
            status: info.status,
            aired: info.aired.string,
            duration: info.duration,
            scored_by: info.scored_by,
            rank: info.rank,
            popularity: info.popularity,
            season: info.season,
            broadcast: info.broadcast,
            studios: info.studios,
            synopsis: info.synopsis

        }
        return JSON.stringify(animeData);
    } catch (error) {
      return JSON.stringify(error.message);
    }
}

async function searchAnime(param) {
    let search = param.search;
    let type = param.type;
    try {
        const response = await axios.get('https://api.jikan.moe/v4/anime', {
            params: {
                q: search,
                type: type,
                limit: 20
            },
            timeout: 20000
        })

        const info = (response.data.data).map(anime => {
            return {
                id: anime.mal_id,
                url: anime.url,
                title: anime.title,
                score: anime.score,
                scoredBy: anime.scored_by,
                rank: anime.rank,
                popularity: anime.popularity,
                members: anime.members,
                favorites: anime.favorites,
                synopsis: anime.synopsis,
                background: anime.background,
                approved: anime.approved,
                type: anime.type,
                source: anime.source,
                episodes: anime.episodes,
                status: anime.status,
                rating: anime.rating,
                season: anime.season,
                year: anime.year
            }
        })
        return JSON.stringify(info);
    } catch (err) {
        console.log(err.message);
        return "request timeout"
    }
}

async function getAnimeRecommended(param) {
    try {
        const order_by = param.order_by || 'popularity';
        const genres = param.genres;
        console.log(genres)
        const start_date = param.start_date;
        const status = param.status || 'complete';
        const response = await axios.get(`https://api.jikan.moe/v4/anime`, {
            params: {
                order_by: order_by,
                genres: genres,
                start_date: start_date,
                status: status,
                limit: 20
            },
            timeout: 20000
        })
        const info = response.data.data.map(info => {
            let genres = info.genres.map(obj => obj.name);
            let genresIDs = info.genres.map(obj => obj.mal_id);
            genres = genres.join(', ');
            genresIDs = genresIDs.join(', ');
            return {
                title: info.title,
                genres: `${ genres }(${ genresIDs })`,
                url: info.url,
                aired: info.aired.string,
                type: info.type,
                mal_id: info.mal_id
            }
        })
        return JSON.stringify(info);
    } catch (err) {
        console.log(err.message);
        return JSON.stringify(err.message);
    }
}
async function setNameGPT(data) {
    let sender = data.from;
    let name = data.name;
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    dataUser[0].name = name;

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser));
    return 'nama berhasil diatur';
}

async function setLangGPT(data) {
    let sender = data.from;
    let lang = data.language;
    let dataUser = fs.readFileSync(`./database/data_user/${ sender }`, 'utf-8');
    dataUser = JSON.parse(dataUser);

    dataUser[0].chatLanguage = lang;

    fs.writeFileSync(`./database/data_user/${ sender }`, JSON.stringify(dataUser));
    return 'Bahasa berhasil diatur';
}

async function getTime() {
    // Buat objek Date
    const date = new Date();

    // Atur zona waktu ke WITA (GMT+8)
    date.setUTCHours(date.getUTCHours() + 8);
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Ingat bahwa indeks bulan dimulai dari 0 (Januari = 0)
    const day = date.getDate();
    const dayOfWeekIndex = date.getDay();
  	const hours = date.getHours();
  	const minutes = date.getMinutes();
	const seconds = date.getSeconds();
    formattedTime = {
        day: days[dayOfWeekIndex],
        date: day,
        month: month,
        year: year,
        hours:hours,
        minutes: minutes,
        seconds: seconds
    }

    return JSON.stringify(formattedTime);
}

async function musicinfoGPT(data) {
   const searchQuery =  data.title;
    try {
        
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

            const lyrics = await fetchLyrics(url);
            const reply = `*Title:* ${data.title}
*Artist:* ${ data.artist }
*Full_title:* ${ data.fullTitle }
*Language:* ${ data.language }
*Release:* ${ data.release }
${ data.media }
*Lyrics:*
${ lyrics }`;
            return JSON.stringify(reply);   
        } else {
            return 'Lagu tidak ditemukan';
        }
    } catch (error) {
        return `Terjadi kesalahan: ${ error.message }`
    }
}

async function fetchLyrics(url) {
    try {
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
        return `Terjadi kesalahan: ${ error.message }`
    }
}

async function getFeature() {
    const menu = {
        information: {
            author: "Ryan_Syah",
            bot_name: "Seeu",
            software: "Whatsapp"
        },
        list_command: {
            command1: {
                cmd: "/menu",
                role: "member",
                description: "mengirimkan daftar fitur atau menu fitur yang bisa digunakan",
                example: "/menu"
            },
            command2: {
                cmd: "/bgr [color]",
                role: "member",
                description: "mengubah warna background pada foto harus mengirimkan pesan yang memiliki media yaitu foto dengan caption command yaitu /bgr [color]",
                example: "/bgr blue"
            },
            command3: {
                cmd: "/seeu [question]",
                role: "member",
                description: "Fitur untuk menanyakan apapun kepada Seeu, dan seeu akan menjawabnya",
                example: "/seeu apakah bumi bulat?"
            },
            command4: {
                cmd: "/s",
                role: "member",
                description: "fitur untuk mengubah gambar menjadi stiker, pesan dikirim bersama media dengan caption /s. hanya support format gambar, dikarenakan ada masalah pada tempat hosting dalam menggunakan ffmpeg",
                example: "/s"
            },
            command5: {
                cmd: "/yta [link] (file_name)",
                role: "member",
                description: "Mengunduh konten Youtube dalam format Audio",
                example: "/yta https://www.youtube.com/watch?v=JaoCJ2U8y_A&ab_channel=Tekotok filesaya"
            },
            command6: {
                cmd: "/ytv [link] (file_name)",
                role: "member",
                description: "Mengunduh konten Youtube dalam format Video dengan resolusi 360p",
                example: "/ytv https://www.youtube.com/watch?v=JaoCJ2U8y_A&ab_channel=Tekotok filesaya"
            },
            command7: {
                cmd: "/ythd [link] (file_name)",
                role: "member",
                description: "Mengunduh konten Youtube dalam resolusi tinggi",
                example: "/ytv https://www.youtube.com/watch?v=JaoCJ2U8y_A&ab_channel=Tekotok filesaya"
            },
            command8: {
                cmd: "/yts [search]",
                role: "member",
                description: "Melakukan pencarian Youtube yang akan memberikan informasi title, channel, durasi video, dan link. command ini bisa digunakan bersama dengan fitur lainnya untuk mendapatkan link dari youtube yang ingin diunduh",
                example: "/yts nightcore what it is UNDERDOGS"
            },
            command9: {
                cmd: "/absen (menit)",
                role: "admin",
                description: "fitur untuk melakukan absensi pada grup, Seeu akan mengirimkan format absensi ke grup dengan batas waktu sesuai dengan jumlah meniot yang diatur, apabila waktu tidak diatur maka absensi tidak memiliki batas waktu sampai admin mengirimkan /close untuk menutup absensi. kirim /hadir [nama] untuk absen, kirim /hadirc [nama] untuk mengedit nama jika sudah absen",
                example: "/absen 10"
            },
            command10: {
                cmd: "/ai [prompt]",
                role: "member",
                description: "Generate text to Image",
                example: "/ai kucing"
            },
            command11: {
                cmd: "/animesearch [title]",
                role: "member",
                description: "Melakukan pencarian anime dengan sumber dari MyAnimeList",
                example: "/animesearch oregairu"
            },
            command12: {
                cmd: "/igdl [link]",
                role: "member",
                description: "Mengunduh konten Instagram",
                example: "/igdl https://www.instagram.com/reel/CvO8iZZrKb_/?utm_source=ig_web_copy_link&igshid=MzRlODBiNWFlZA=="
            },
            command13: {
                cmd: "/fbdl [link]",
                role: "member",
                description: "Mengunduh konten Facebook",
                example: "/fbdl https://www.facebook.com"
            },
            command14: {
                cmd: "/tiktokdl [link]",
                role: "member",
                description: "Mengunduh konten tiktok",
                example: "/fbdl https://www.tiktok.com"
            },
            command15: {
                cmd: "/pinterest [search]",
                role: "member",
                description: "Melakukan pencarian gambar pada website Pinterest lalu Seeu akan mengirimkan gambar 1 per satu sesuai dengan pencarian",
                example: "/pinterest Seeu Cosplayer"
            },
            command16: {
                cmd: "/everyone",
                role: "admin",
                description: "Melakukan tag pada semua member yang ada dalam group whatsapp. fitur ini hanya berfungsi untuk melakukan tag, tidak memiliki fungsi untuk mengirim pesan",
                example: "/everyone"
            },
            command17: {
                cmd: "/hidetag [pesan]",
                role: "admin",
                description: "Mengirimkan pesan tag pada semua member yang ada dalam group whatsapp tetapi tidak menampilkan siapa yang di tag",
                example: "/hidetag hallo"
            },
            command18: {
                cmd: "/antitoxic [on/odd/add/list/remove]",
                role: "admin",
                description: "Menjaga group agar tetap Family Friendly",
                example: "/antitoxic on"
            },
            command19: {
                cmd: "/topanime",
                role: "member",
                description: "Menampilkan topAnimeOfTheWeek dengan sumber dari Bstation",
                example: "/topanime"
            },
            command20: {
                cmd: "/topup ML",
                role: "member",
                description: "Fitur untuk melakukan topup pada Mobile Legend, cukup kirim pesan /topup ml untuk menggunakannya",
                example: "/topup ml"
            },
            command21: {
                cmd: "/topup Genshin",
                role: "member",
                description: "Fitur untuk melakukan topup pada Genshin, cukup kirim pesan /topup genshin untuk menggunakannya",
                example: "/topup genshin"
            },
            command22: {
                cmd: "/topdf",
                role: "member",
                description: "Fitur untuk melakukan convert doc ke pdf. pesan dikirim bersama document yang ingin diubah ke pdf dengan caption /topdf, atau bisa juga dengan mereply pesan yang memiliki document dengan caption /topdf",
                example: "/topdf"
            },
            command23: {
                cmd: "/audToText (langguage)",
                role: "member",
                description: "mengubah audio menjadi teks. pesan dikirim bersama file audio yang ingin diubah menjadi teks dengan caption /audToText, atau bisa juga dengan me reply pesan yang memiliki file audio dengan caption /audToText. argumen fitur ini bersifat opsional apabila dikosongkan maka akan mengirimkan teks sesuai dengan bahasa yang digunakan pada audio. argumen yang di isi merupakan kode ISO 639-1 semua kode bahasa bisa dilihat di link https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes",
                example: "/audToText id"
            },
            command24: {
                cmd: "/bugReport [Message]",
                role: "member",
                description: "Sebuah Command untuk melakukan report apabila terjadi bug atau crash saat user menggunakan Command pada SeeU. Laporan tersebut akan dikirim ke developer SeeU dan akan segera diatasi",
                example: "/bugReport Terdapat bug/crash pada fitur /topdf"
            },
            command25: {
                cmd: "/limit",
                role: "member",
                description: "Command untuk mengecek limit penggunaan PrivateChat hari ini, batas penggunaan PrivateChat command adalah 25/hari. Limit direset setiap hari",
                example: "/limit"
            },
            command26: {
                cmd: "/update",
                role: "member",
                description: "Command untuk mengecek update terbaru dari SeeU",
                example: "/update"
            },
            command27: {
                cmd: "/musicInfo [title]",
                role: "member",
                description: "Fitur untuk menampilkan informasi sebuah lagu seperti lyric, artist, dll berdasarkan judul yang dicari",
                example: "/musicinfo Senorita"
            },
            command28: {
                cmd: "/animedl",
                role: "member",
                description: "Fitur untuk mendownload anime terbaru yang rilis tahun 2023 - sekarang. SeeU akan meminta user untuk mengirim nama anime dan episode setelah mengirim command /animedl, Setelah itu SeeU akan mengirimkan link tautan unduhan berdasarkan anime dan episode yang dicari",
                example: "/animedl"
            },
            command29: {
                cmd: "/updateAPI [PasteApikeyHere]",
                role: "member",
                description: "Command untuk mengatur APIKEY openai anda. Command ini dapat digunakan untuk mengatur APIKEY yang sebelumnya sharing menjadi apikey private. Apabila /SeeU error dengan pesan code 429 atau saldo apikey yang digunakan telah habis maka cobalah untuk mengatur/mengganti apikey private anda maka pesan error tersebut akan hilang dan /seeu dapat memberikan pesan tanpa adanya pesan error yang muncul\n\nIkuti link berikut cara mendapatkan APIKEY Private anda:\nhttps://youtu.be/R3yF02N1Oq4?si=-ElYEyHwew6YjhXA",
                example: "/updateAPI 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"
            },
            command30: {
                cmd: "/delAPI",
                role: "member",
                description: "Command untuk mereset APIKEY jika telah mengatur APIKEY sebelumnya. Jika menjalankan command ini maka akan mengembalikan apikey anda yang sebelumnya private menjadi sharing",
                example: "/delAPI"
            }
        },
        note: {
            1: "tanda [ ] pada command wajib di isi",
            2: "tanda ( ) pada command bisa diabaikan"
        }
    }

    return JSON.stringify(menu);
}


module.exports = {
    getTime, getAnimeById, searchAnime, getFeature, setNameGPT, setLangGPT, getAnimeRecommended, musicinfoGPT
}
