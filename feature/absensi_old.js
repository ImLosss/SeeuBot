const fs = require('fs');
const col = require('colors');

const absen = async (msg, chat, text, mentions) => {
    const prefix = ['!', '/', '.'];

    let name = msg.body;
    name = name.split(' ');

    // Buat objek Date
    const date = new Date();

    // Atur zona waktu ke WITA (GMT+8)
    date.setUTCHours(date.getUTCHours() + 8);

    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Ingat bahwa indeks bulan dimulai dari 0 (Januari = 0)
    const day = date.getDate();
  	const hours = date.getHours();
  	const minutes = date.getMinutes();
	const seconds = date.getSeconds();
  	const formattedDate = `${day}/${month}/${year}`;
	const formattedTime = `${hours}:${minutes}:${seconds}`;

    const file_absen_dir = `database/data_absen/${ msg.from }_absen`;
    const file_grup_dir = `database/data_absen/data_grup`;

    if (prefix.some(pre => name[0] === `${pre}hadir`)){
        console.log(`\nfrom\t\t:`.green + `${ msg.author } ${ chat.name }`.gray.bold);
        console.log(`nama\t\t:`.green + `${ name }`.gray);
        console.log(`time\t\t:`.green + `${ formattedDate } ${ formattedTime }`.gray);
        console.log(`fitur\t\t:`.green + `/hadir`.gray.bold);
        
        if (fs.existsSync(file_absen_dir)) {
            if (name[1] != null) {
                let data_absen = [];
                let IsNewUser = true;
                let time_konversi;

                const fileData = fs.readFileSync(file_absen_dir, 'utf-8');
                data_absen = JSON.parse(fileData);
                for (let i of data_absen){
                    if (i.pengirim == msg.author){
                        IsNewUser = false;
                        break;
                    }
                }
                const fileDataGrup = fs.readFileSync(file_grup_dir, 'utf-8');
                data_grup = JSON.parse(fileDataGrup);
                for (let i of data_grup){
                    if (i.grup_id == msg.from){
                        time_konversi = i.time;
                        break;
                    }
                }
                if(IsNewUser){
                    if(name.length >= 2) {
                        name = name.slice(1,name.length);
                        name = name.join(" ");
                    }

                    if(time_konversi != 'none') {
                        const jam = Math.floor(time_konversi / 60);
                        const menit = time_konversi % 60;
                        time_konversi = '';

                        if (jam > 0) time_konversi += jam + " jam";
                        if (menit > 0) time_konversi += menit + " menit";
                        if(jam > 0 && menit > 0) time_konversi = `${ jam } jam ${ menit } menit`; 
                    }

                    // menghilangkan karakter baris baru pada inputan 
                    name = name.replace(/\n/g, ' ');

                    data_absen.push({nama : name, pengirim: msg.author });

                    let reply = `*Absensi ${ chat.name } ${ formattedDate } :*\n`;
                    let no = 1;
                    for (let a of data_absen) {
                        reply += `${ no }. ${ a.nama }\n`;
                        no+=1;
                    }
                    msg.reply(`${ reply }\nUntuk memulai absen kirim pesan */hadir [nama]*\nAbsen ini dapat ditutup dengan */close*\nEdit : */hadirc [nama]*\nSisa waktu : *${ time_konversi }*`);
                    fs.writeFileSync(file_absen_dir, JSON.stringify(data_absen));
                } else {
                    msg.reply("Absen hanya bisa 1x\nubah : */hadirc [nama]*");
                }
            } else {
                msg.reply('formatmu salah, kirim kembali dengan format */hadir [nama]*\n\nContoh: _/hadir Seeu_');
            }
        } else {
            chat.sendMessage("Belum ada absen yang dibuat, kirim */absen (menit)* untuk memulai absensi [only admin]");
        }
    }else if (prefix.some(pre => name[0] === `${pre}hadirc`)){
        let index
        if (fs.existsSync(file_absen_dir)) {
            if (name[1] != null) {
                let data_absen = [];
                let IsNewUser = true;
                let time_konversi;

                const fileData = fs.readFileSync(file_absen_dir, 'utf-8');
                data_absen = JSON.parse(fileData);
                for (let i of data_absen){
                    if (i.pengirim == msg.author){
                        const idpengirim = i.pengirim;
                        index = data_absen.findIndex(item => item.pengirim === idpengirim);
                        IsNewUser = false;
                        break;
                    }
                }

                const fileDataGrup = fs.readFileSync(file_grup_dir, 'utf-8');
                data_grup = JSON.parse(fileDataGrup);
                for (let i of data_grup){
                    if (i.grup_id == msg.from){
                        time_konversi = i.time;
                        break;
                    }
                }

                if(time_konversi != 'none') {
                    const jam = Math.floor(time_konversi / 60);
                    const menit = time_konversi % 60;
                    time_konversi = '';

                    if (jam > 0) time_konversi += jam + " jam";
                    if (menit > 0) time_konversi += menit + " menit";
                    if(jam > 0 && menit > 0) time_konversi = `${ jam } jam ${ menit } menit`; 
                }

                if(!IsNewUser){
                    if(name.length >= 2) {
                        name = name.slice(1,name.length);
                        name = name.join(" ");
                    }
                
                    console.log(`\nfrom\t\t:`.green + `${ msg.author } ${ chat.name }`.gray.bold);
                    console.log(`nama\t\t:`.green + `${ name }`.gray);
                    console.log(`time\t\t:`.green + `${ formattedDate } ${ formattedTime }`.gray);
                    console.log(`fitur\t\t:`.green + `/hadirc`.gray.bold);

                    // menghilangkan karakter baris baru pada inputan 
                    name = name.replace(/\n/g, ' ');

                    data_absen[index] = { nama: name, pengirim: msg.author };

                    let reply = `*Absensi ${ chat.name } ${ formattedDate } :*\n`;
                    let no = 1;
                    for (let a of data_absen) {
                        reply += `${ no }. ${ a.nama }\n`;
                        no+=1;
                    }
                    msg.reply(`${ reply }\nUntuk memulai absen kirim pesan */hadir [nama]*\nAbsen ini dapat ditutup dengan */close*\nEdit : */hadirc [nama]*\nSisa waktu : *${ time_konversi }*`);
                    fs.writeFileSync(file_absen_dir, JSON.stringify(data_absen));
                } else {
                    msg.reply("Anda belum absen\nabsen : */hadir [nama]*");
                }
            } else {
                msg.reply('formatmu salah, kirim kembali dengan format */hadirc [nama]*\n\nContoh: _/hadirc Seeu_');
            }
        } else {
            chat.sendMessage("Belum ada absen yang dibuat, kirim */absen (menit)* untuk memulai absensi [only admin]")
        }
    } else if (prefix.some(pre => name[0] === `${pre}absen`)) {
        let time_konversi = "";
        let time = name[1];
        time = parseInt(time);
        let index;

        let jam = Math.floor(time / 60);
        let menit = time % 60;

        if (jam > 0) time_konversi += jam + " jam";
        if (menit > 0) time_konversi += menit + " menit";
        if(jam > 0 && menit > 0) time_konversi = `${ jam } jam ${ menit } menit`; 

        if (name.length > 1){
            if(time == NaN){
                msg.reply("gagal konversi");
            }else if (time > 720) {
                msg.reply("batas waktu terlalu lama (maks : 12 jam/720 menit");
            } else if (time != NaN && time <= 720){
                console.log(`\nfrom\t\t:`.green + `${ msg.author } ${ chat.name }`.gray.bold);
                console.log(`time\t\t:`.green + `${ formattedDate } ${ formattedTime }`.gray);
                console.log(`fitur\t\t:`.green + `/absen`.gray.bold);

                let data_grup = [];
                let absen = [];

                const fileDataGrup = fs.readFileSync(file_grup_dir, 'utf-8');
                data_grup = JSON.parse(fileDataGrup);
                let isNewGrup = true;
                for (let i of data_grup){
                    if (i.grup_id == msg.from){
                        index = data_grup.findIndex(item => item.grup_id === msg.from);
                        isNewGrup = false;
                        break;
                    }
                }

                if (isNewGrup){
                    data_grup.push({grup_id : msg.from, time: time});
                    fs.writeFileSync(file_grup_dir, JSON.stringify(data_grup));
                    fs.writeFileSync(file_absen_dir, JSON.stringify(absen));
                    chat.sendMessage(`[⏳] Membuat absen dengan batas waktu ${ time_konversi }...`);
                    setTimeout(() => {
                        chat.sendMessage(text, { mentions });
                        chat.sendMessage(`*Absensi ${ chat.name } ${ formattedDate } :*\n1. \n2. \n3.\n\nUntuk memulai absen kirim pesan */hadir [nama]*\nAbsen ini dapat ditutup dengan */close*\nEdit : */hadirc [nama]*\nSisa waktu : *${ time_konversi }*`);
                    }, 2000);

                    let timer2;
                    timer2 = setInterval(() => {
                        try {
                            const fileDataGrup = fs.readFileSync(file_grup_dir, 'utf-8');
                            data_grup = JSON.parse(fileDataGrup);
                            for (let i of data_grup){
                                if (i.grup_id == msg.from){
                                    index = data_grup.findIndex(item => item.grup_id === msg.from);
                                    break;
                                }
                            }
                            time = data_grup[index].time - 1;
                            if (time < 1) {
                                clearInterval(timer2);
                                msg.reply("Batas waktu absen telah habis!!!")
                                .catch(() => {
                                    chat.sendMessage("Batas waktu absen telah habis!!!")
                                })
                                data_grup.splice(index, 1);
                                fs.unlink(`./database/data_absen/${ msg.from }_absen`, (err) => {
                                    if (err) {
                                        console.error(err);
                                        return;
                                    }
                                    console.log(col.green("info\t\t:"), col.gray("File absen berhasil dihapus"));
                                    fs.writeFileSync(file_grup_dir, JSON.stringify(data_grup));
                                });
                            } else {
                                data_grup[index].time = time;
                                fs.writeFileSync(file_grup_dir, JSON.stringify(data_grup));
                            }
                        } catch(err) {
                            console.log(err);
                            clearInterval(timer2);
                        }
                    }, 60000);
                } else {
                    let data_absen = [];

                    const fileData = fs.readFileSync(file_absen_dir, 'utf-8');
                    data_absen = JSON.parse(fileData);

                    const fileDataGrup = fs.readFileSync(file_grup_dir, 'utf-8');
                    data_grup = JSON.parse(fileDataGrup);
                    for (let i of data_grup){
                        if (i.grup_id == msg.from){
                            time_konversi = i.time;
                            break;
                        }
                    }

                    if(time_konversi != 'none') {
                        jam = Math.floor(time_konversi / 60);
                        menit = time_konversi % 60;
                        time_konversi = '';

                        if (jam > 0) time_konversi += jam + " jam";
                        if (menit > 0) time_konversi += menit + " menit";
                        if(jam > 0 && menit > 0) time_konversi = `${ jam } jam ${ menit } menit`; 
                    }

                    let reply = `*Absensi ${ chat.name } ${ formattedDate } :*\n`;
                    let no = 1;
                    for (let a of data_absen) {
                        reply += `${ no }. ${ a.nama }\n`;
                        no+=1;
                    }
                    msg.reply(`${ reply }\nUntuk memulai absen kirim pesan */hadir [nama]*\nAbsen ini dapat ditutup dengan */close*\nEdit : */hadirc [nama]*\nSisa waktu : *${ time_konversi }*`);
                    msg.reply("terdapat absen yang masih aktif, kirim */close* untuk menutup, lalu buat absen yang baru...");
                }
            }
        } else {
            console.log(`\nfrom\t\t:`.green + `${ msg.author } ${ chat.name }`.gray.bold);
            console.log(`time\t\t:`.green + `${ formattedDate } ${ formattedTime }`.gray);
            console.log(`fitur\t\t:`.green + `/absen`.gray.bold);

            let data_grup = [];
            let absen = [];

            const fileDataGrup = fs.readFileSync(file_grup_dir, 'utf-8');
            data_grup = JSON.parse(fileDataGrup);
            let isNewGrup = true;
            for (let i of data_grup){
                if (i.grup_id == msg.from){
                    index = data_grup.findIndex(item => item.grup_id === msg.from);
                    isNewGrup = false;
                    break;
                }
            }
            if(isNewGrup){
                try{
                    const fileData = fs.readFileSync(file_grup_dir, 'utf-8');
                    data_grup = JSON.parse(fileData);
                } catch {

                }

                data_grup.push({grup_id : msg.from, time: 'none'});

                fs.writeFileSync(file_absen_dir, JSON.stringify(absen));
                fs.writeFileSync(file_grup_dir, JSON.stringify(data_grup));

                chat.sendMessage(text, { mentions });
                chat.sendMessage(`*Absensi ${ chat.name } ${ formattedDate } :*\n1. \n2. \n3.\n\nUntuk memulai absen kirim pesan */hadir [nama]*\nAbsen ini dapat ditutup dengan */close*\nEdit : */hadirc [nama]*\nSisa waktu : *none*`);
            } else {
                let data_absen = [];

                const fileData = fs.readFileSync(file_absen_dir, 'utf-8');
                data_absen = JSON.parse(fileData);

                const fileDataGrup = fs.readFileSync(file_grup_dir, 'utf-8');
                data_grup = JSON.parse(fileDataGrup);
                for (let i of data_grup){
                    if (i.grup_id == msg.from){
                        time_konversi = i.time;
                        break;
                    }
                }

                console.log(time_konversi);

                if(time_konversi != 'none') {
                    jam = Math.floor(time_konversi / 60);
                    menit = time_konversi % 60;
                    time_konversi = '';

                    if (jam > 0) time_konversi += jam + " jam";
                    if (menit > 0) time_konversi += menit + " menit";
                    if(jam > 0 && menit > 0) time_konversi = `${ jam } jam ${ menit } menit`; 
                }

                let reply = `*Absensi ${ chat.name } ${ formattedDate } :*\n`;
                let no = 1;
                for (let a of data_absen) {
                    reply += `${ no }. ${ a.nama }\n`;
                    no+=1;
                }
                msg.reply(`${ reply }\nUntuk memulai absen kirim pesan */hadir [nama]*\nAbsen ini dapat ditutup dengan */close*\nEdit : */hadirc [nama]*\nWaktu : *${ time_konversi }*`);
                msg.reply("terdapat absen yang masih aktif, kirim */close* untuk menutup, lalu buat absen yang baru...")
            }
        }
    } else if (prefix.some(pre => name[0] === `${pre}close`)){
        console.log(`\nfrom\t\t:`.green + `${ msg.author } ${ chat.name }`.gray.bold);
        console.log(`time\t\t:`.green + `${ formattedDate } ${ formattedTime }`.gray);
        console.log(`fitur\t\t:`.green + `/close`.gray.bold);

        let data_grup = [];
        let isNewGrup = true;
        let index;

        const fileData = fs.readFileSync(file_grup_dir, 'utf-8');
        data_grup = JSON.parse(fileData);
        for (let i of data_grup){
            if (i.grup_id == msg.from){
                index = data_grup.findIndex(item => item.grup_id === msg.from);
                isNewGrup = false;
                break;
            }
        }

        if(!isNewGrup){
            data_grup.splice(index, 1);
            fs.unlink(`./database/data_absen/${ msg.from }_absen`, (err) => {
                if (err) {
                    console.error(err);
                return;
                } else {
                    msg.reply("Absen telah ditutup");
                }
                console.log(col.green("info\t\t:"), col.gray("File absen berhasil dihapus"));
                fs.writeFileSync(file_grup_dir, JSON.stringify(data_grup));
            });
        }
    }
}
module.exports = {
    absen
}
