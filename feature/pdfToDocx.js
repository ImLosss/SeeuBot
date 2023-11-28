const fs = require('fs');
const mimeTypes = require('mime-types');
const CloudmersiveConvertApiClient = require('cloudmersive-convert-api-client');
const { MessageMedia } = require('whatsapp-web.js');
const { CLOUD_MERSIVE_API } = require('../config');
const { ceklimit } = require('./function');

const apiKey = '246e465b-a354-45b6-9748-faf415ede1e4';

const todocx = async (msg, sender) => {
    try {
        const chat = await msg.getChat();

        if(!chat.isGroup) {
            const limit = await ceklimit(sender);
            if(limit) return msg.reply('Jumlah pemakaian Private anda hari ini telah mencapai batas, anda dapat menggunakan command kembali besok. Masuk ke grup SeeuBot agar dapat menggunakan command kembali:\n\nhttps://chat.whatsapp.com/IX4rq2WWN72BOEcvk46wnv');
        }

        let media;
        let extension;
        let fileNameWithoutExtension = 'todocx';

        if(msg.hasMedia && msg.type == 'document') {
            media = await msg.downloadMedia();
            extension = mimeTypes.extension(`${ msg._data.mimetype }`);
            try {
                const filename = media.filename;
                fileNameWithoutExtension = filename.replace(`.${extension}`, '');
            } catch (err) {
                console.log(err.message);
            }
        } else if(msg.hasQuotedMsg) {
            const reply = await msg.getQuotedMessage();
            if(reply.hasMedia && reply.type == 'document') {
                media = await reply.downloadMedia();
                extension = mimeTypes.extension(`${ reply._data.mimetype }`);
                try {
                    const filename = media.filename;
                    fileNameWithoutExtension = filename.replace(`.${extension}`, '');
                } catch (err) {
                    console.log(err.message);
                }
            } else {
                return msg.reply('Dokumennya mana???');
            }
        } else {
            return msg.reply('Dokumennya mana???');
        }
        const savePath = `./database/input.${extension}`;
        fs.writeFileSync(savePath, media.data, 'base64');

        const defaultClient = CloudmersiveConvertApiClient.ApiClient.instance;
        const apiInstance = new CloudmersiveConvertApiClient.ConvertDocumentApi();

        // Configure API key authorization: Apikey
        const Apikey = defaultClient.authentications['Apikey'];
        Apikey.apiKey = CLOUD_MERSIVE_API;

        const inputFile = Buffer.from(fs.readFileSync(savePath).buffer);

        const callback = function (error, data, response) {
            if (error) {
                console.error(error);
                msg.reply('Error')
                .catch(() => {
                    chat.sendMessage('Error');
                })
            } else {
                const path = `./database/${ fileNameWithoutExtension }.docx`
                const pdfWriteStream = fs.createWriteStream(path);
                pdfWriteStream.write(data, 'binary');
                pdfWriteStream.end();
        
                pdfWriteStream.on('finish', function () {
                    const media = MessageMedia.fromFilePath(path);
                    chat.sendMessage(media, { sendMediaAsDocument: true, caption: 'Berhasil' })
                    console.log('Berhasil Konversi');
                    fs.unlinkSync(path, (err) => {
                        if(err) {
                            console.log(`Error: Gagal hapus file ${ path }`)
                        }
                    })
                    fs.unlinkSync(savePath, (err) => {
                        if(err) {
                            console.log(`Error: Gagal hapus file ${ savePath }`)
                        }
                    })
                });
        
                pdfWriteStream.on('error', function (err) {
                    console.error('Error while writing docx:', err);
                    msg.reply('Error')
                    .catch(() => {
                        chat.sendMessage('Error');
                    })
                });
        
                console.log('Successful - done.');
            }
        };

        apiInstance.convertDocumentPdfToDocx(inputFile, callback);
    } catch (err) {
        console.log('Error :', err);
        msg.reply('Error')
        .catch(() => {
            chat.sendMessage('Error');
        })
    }
};

module.exports = {
    todocx
}
