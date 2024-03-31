const { google } = require('googleapis');
const mime = require('mime-types');
const fs = require('fs');
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN } = require('../config');

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

oauth2Client.setCredentials({refresh_token: REFRESH_TOKEN});

const drive = google.drive({
    version: 'v3',
    auth: oauth2Client
})

async function uploadFile(path, fileName, base64Data = false) {
    let mime_type = await cekMime(path);
    console.log(mime_type);
    let file = '';
    if (!base64Data) file = fs.createReadStream(path)
    else {
        file = base64Data;
    }
    try{
        const response = await drive.files.create({
            requestBody: {
                name: fileName,
                mimeType: mime_type
            },
            media: {
                mimeType: mime_type,
                body: file
            }
        })
        const fileId = response.data.id;
        console.log(response.data);
        return fileId;
    } catch (err) {
        console.log(err.message);
    }
}

async function deleteFile(fileID) {
    try {
        const response = await drive.files.delete({
            fileId: fileID
        });
    } catch (err) {
        console.log(err.message);
    }
}

async function generatePublicURL(fileID) {
    try {
        await drive.permissions.create({
            fileId: fileID,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        })

        const result = await drive.files.get({
            fileId: fileID,
            fields: 'webViewLink, webContentLink, id'
        })
        return result.data;
    } catch (err) {
        console.log(err.message);
    }
}

async function cekMime(path){
    // Mendapatkan MIME type berdasarkan ekstensi file
    const mimeType = mime.lookup(path);
    return mimeType;
}

async function emptyTrash(msg) {
    try {
        await drive.files.emptyTrash()
        .then(() => {
            msg.reply('Berhasil menghapus sampah Drive');
        })
    } catch(err) {
        console.log(err)
        msg.reply(`Error: ${ err.message }`);
    }
}

module.exports = {
    uploadFile, generatePublicURL, deleteFile, emptyTrash
}