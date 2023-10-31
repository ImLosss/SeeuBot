const fs = require('fs');
const col = require('colors');



const antitoxic = async (text, msg, sender) => {
    const file_grup_dir = `./database/antitoxic/data_grup`;
    const file_word_dir = `./database/antitoxic/${ msg.from }`;
    const file_member_warning = `./database/antitoxic/${ msg.from }_warning`;

    let cmd = text.split(' ');
    if(cmd[1] == "on"){
        let index;
        let isNewGrup = true;

        if (!fs.existsSync(file_word_dir)) {
            let badword = [];
            fs.writeFileSync(file_word_dir, JSON.stringify(badword));
        }
        if (!fs.existsSync(file_member_warning)) {
            let warning = [];
            warning.push({ user: msg.author, teguran: 0, status: 'unmute' });
            fs.writeFileSync(file_member_warning, JSON.stringify(warning));
        }

        msg.reply('Fitur anti toxic di grup ini diaktifkan...\n\nJIka ingin menambahkan kata haram, kirim */antitoxic add [word]*');
        const fileData = fs.readFileSync(file_grup_dir, 'utf-8');
        let data_grup = JSON.parse(fileData);
        for (let i of data_grup){
            if (i.id_grup == msg.from){
                index = data_grup.findIndex(item => item.id_grup === msg.from);
                isNewGrup = false;
                break;
            }
        }

        if(isNewGrup == true) {
            data_grup.push({id_grup: msg.from, status: 'on'});
        } else {
            data_grup[index] = {id_grup: msg.from, status: 'on'};
        }
        fs.writeFileSync(file_grup_dir, JSON.stringify(data_grup));

    } else if (cmd[1] == "off") {
        let index;
        let isNewGrup = true;

        msg.reply('Fitur anti toxic di grup ini dimatikan...');
        const fileData = fs.readFileSync(file_grup_dir, 'utf-8');
        let data_grup = JSON.parse(fileData);
        for (let i of data_grup){
            if (i.id_grup == msg.from){
                index = data_grup.findIndex(item => item.id_grup === msg.from);
                isNewGrup = false;
                break;
            }
        }

        if(isNewGrup == true) {
            data_grup.push({id_grup: msg.from, status: 'off'});
        } else {
            data_grup[index] = {id_grup: msg.from, status: 'off'};
        }
        fs.writeFileSync(file_grup_dir, JSON.stringify(data_grup));
    } else if (cmd[1] == "add") {
        let badword = [];
        let word = "";

        if(cmd.length >= 3) {
            word = cmd.slice(2,cmd.length);
            word = word.join(" ");
        } else {
            return msg.reply('kata haramnya mana???');
        }

        if (fs.existsSync(file_word_dir)) {
            const fileData = fs.readFileSync(file_word_dir, 'utf-8');
            badword = JSON.parse(fileData);
            for (let i of badword){
                if (i == word){
                    return msg.reply(`${ word } sudah ada dalam list badword di grup ini`);
                }
            }
            badword.push(word);
            fs.writeFileSync(file_word_dir, JSON.stringify(badword));
            return msg.reply('berhasil menambahkan kata haram');
        } else {
            badword.push(word);
            fs.writeFileSync(file_word_dir, JSON.stringify(badword));
            return msg.reply('berhasil menambahkan kata haram');
        }
    } else if(cmd[1] == "list" && fs.existsSync(file_word_dir)) {
        const fileData = fs.readFileSync(file_word_dir, 'utf-8');
        let badword = JSON.parse(fileData);
        if (badword.length == 0) {
            return msg.reply('list badword masih kosong, kirim */antitoxic add [word]* untuk menambah list badword');
        }
        let reply = badword.join(', ');
        return msg.reply(`*List badword di grup ini:*\n\n${ reply }`);
    } else if(cmd[1] == "remove" && fs.existsSync(file_word_dir)) {
        const fileData = fs.readFileSync(file_word_dir, 'utf-8');
        let badword = JSON.parse(fileData);
        if (badword.length == 0) {
            return msg.reply('list badword masih kosong, kirim */antitoxic add [word]* untuk menambah list badword');
        } else {
            let word = "";

            if(cmd.length >= 3) {
                word = cmd.slice(2,cmd.length);
                word = word.join(" ");
                let founded = badword.findIndex(item => item === word);
                if (founded === -1) {
                    msg.reply('tidak menemukan kata badword');
                } else {
                    badword.splice(founded, 1);
                    fs.writeFileSync(file_word_dir, JSON.stringify(badword));
                    return msg.reply('berhasil menghapus badword');
                }
            }
        }
    }
}

const cek_word = async (text, msg, mentions, contact) => {
    const chat = await msg.getChat();
    const file_grup_dir = `./database/antitoxic/data_grup`;
    const file_word_dir = `./database/antitoxic/${ msg.from }`;
    const file_member_warning = `./database/antitoxic/${ msg.from }_warning`;

    const fileData = fs.readFileSync(file_grup_dir, 'utf-8');
    let data_grup = JSON.parse(fileData);
    for (let i of data_grup){
        if (i.id_grup == msg.from && i.status == "on"){
            if(fs.existsSync(file_word_dir) && fs.existsSync(file_member_warning)) {
                const fileData = fs.readFileSync(file_word_dir, 'utf-8');
                const fileData2 = fs.readFileSync(file_member_warning, 'utf-8');
                let badword = JSON.parse(fileData);
                let warn = JSON.parse(fileData2);
                let founded = warn.findIndex(item => item.user === msg.author);
                if(warn[founded].user == msg.author && badword.some(word => text.includes(word)) && warn[founded].teguran == 3) {
                    let time = 1000 * 60 * 10;
                    warn[founded] = {user: msg.author, teguran: 0, status:'mute'}
                    fs.writeFileSync(file_member_warning, JSON.stringify(warn));
                    setTimeout(() => {
                        const fileData3 = fs.readFileSync(file_member_warning, 'utf-8');
                        let warn2 = JSON.parse(fileData3);
                        warn2[founded].status = "unmute"
                        fs.writeFileSync(file_member_warning, JSON.stringify(warn2));
                        chat.sendMessage(`Hak berkicau @${ contact.id.user } telah dikembalikan`, { mentions });
                    }, time); 
                    chat.sendMessage(`Hak berkicau @${ contact.id.user } dicabut selama 10 menit`, { mentions })
                    .then(() => {
                        msg.delete(true);
                    })
                } else if(badword.some(word => text.includes(word)) && warn[founded].status == 'unmute') {
                    let jml_tegur = 0;
                    let time = 1000 * 60 * 15;
                    for (let i of warn){
                        if (i.user == msg.author){
                            jml_tegur = i.teguran;
                            jml_tegur = jml_tegur + 1;
                            warn[founded].teguran = jml_tegur;
                            fs.writeFileSync(file_member_warning, JSON.stringify(warn));
                            setTimeout(() => {
                                const fileData3 = fs.readFileSync(file_member_warning, 'utf-8');
                                let warn2 = JSON.parse(fileData3);
                                warn2[founded].teguran = 0;
                                fs.writeFileSync(file_member_warning, JSON.stringify(warn2));
                            }, time);
                            msg.reply(`heyy, anda kena teguran ${ warn[founded].teguran }/3`)
                            .then(() => {
                                msg.delete(true);
                            })
                        }
                    }
                } else if (warn[founded].status == 'mute') {
                    return msg.delete(true);
                }
            }
        }
    }
}

module.exports = {
    antitoxic, cek_word
}