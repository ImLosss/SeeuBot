const axios = require('axios');
const col = require('colors');

const yts =  async(msg) => {
  const chat = await msg.getChat()
  try {
      let searchTerm = msg.body;
      searchTerm = searchTerm.split(' ');
      if(searchTerm.length >= 2) {
        searchTerm = searchTerm.slice(1, searchTerm.length);
        searchTerm = searchTerm.join(" ");
      } else {
        return msg.reply('command mu gk lengkap, kirim kembali dengan format */yts [pencarian]*')
        .catch(() => {
          return chat.sendMessage('command mu gk lengkap, kirim kembali dengan format */yts [pencarian]*')
        })
      }
      console.log(`search\n\n:`.green + `${ searchTerm }`.gray.bold);

      // Panggil fungsi pencarian YouTube
      const searchResults = await searchYouTubeVideos(searchTerm);

      // Buat balasan dengan daftar video terkait
      let reply = '*Berikut adalah hasil pencarian YouTube:*\n\n';
      for (const result of searchResults) {
          const { title, channel, link, duration } = result;
          reply += `*Title:* ${title}\n*Channel:* ${ channel }\n*Duration:* ${duration}\n*Link:*\n${link}\n\n`;
      }

      // Kirim balasan ke pengirim pesan
      msg.reply(`${ reply }`)
      .catch(() => {
        chat.sendMessage(`${ reply }`)
      })
      msg.reply(`*Untuk mengunduh silahkan gunakan command :*\n-> *!yta [link] (nama_file)* #mengunduh dalam format audio\n-> *!ytv [link] (nama_file)* #mengunduh dalam format video\n-> *!ythd [link] (nama_file)* #Unduh dalam resolusi tinggi`)
      .catch(() => {
        chat.sendMessage(`*Untuk mengunduh silahkan gunakan command :*\n-> *!yta [link] (nama_file)* #mengunduh dalam format audio\n-> *!ytv [link] (nama_file)* #mengunduh dalam format video\n-> *!ythd [link] (nama_file)* #Unduh dalam resolusi tinggi`)
      })
  } catch (error) {
    msg.reply(`terjadi kesalahan`)
      .catch(() => {
        chat.sendMessage(`terjadi kesalahan`)
      })
    console.log('error\t\t:'.red + `${ error }`.gray);
  }
};

async function searchYouTubeVideos(searchTerm) {
  const apiKey = 'AIzaSyAlhPU9Bjk0Ak5KjEhMoVltg-rgCuVbZXo'; // Ganti dengan kunci API YouTube Anda
  const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(
      searchTerm
  )}&key=${apiKey}`;

  const response = await axios.get(apiUrl);
  const { items } = response.data;

  const searchResults = await Promise.all(
    items.map(async (item) => {
      const videoId = item.id.videoId;
      const videoInfo = await getVideoInfo(videoId);

      return {
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        link: `https://www.youtube.com/watch?v=${videoId}`,
        duration: videoInfo,
      };
    })
  );

  return searchResults;
}

async function getVideoInfo(videoId) {
  const apiKey = 'AIzaSyAlhPU9Bjk0Ak5KjEhMoVltg-rgCuVbZXo'; // Ganti dengan kunci API YouTube Anda
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${apiKey}`;

  const response = await axios.get(apiUrl);
  const { items } = response.data;

  const videoInfo = items[0];
  let duration = videoInfo.contentDetails.duration;
  duration = formatDuration(duration);

  return duration;
}

function formatDuration(duration) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) {
    return " ❎"; // Atau berikan nilai default sesuai kebutuhan
  }

  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;

  let formattedDuration = "";

  if (hours > 0) {
    formattedDuration += `${hours} jam `;
  }
  if (minutes > 0) {
    formattedDuration += `${minutes} menit `;
  }
  if (seconds > 0) {
    formattedDuration += `${seconds} detik`;
  }

  return formattedDuration.trim();
}

module.exports = {
    yts
}