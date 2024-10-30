const qr = require('qrcode');
const fs = require('fs');
// Generate QR code as a data URI
qr.toDataURL('https://kelortabur.websiteku.online/', (err, url) => {
    if (err) {
        console.error('Failed to generate QR code:', err);
        return;
    }

    // Save QR code data URI as an image file
    const qrCodeFilePath = 'qrcode.png';
    const dataUri = url.split(',')[1];
    const buffer = Buffer.from(dataUri, 'base64');
    
    fs.writeFile(qrCodeFilePath, buffer, (err) => {
    if (err) {
        console.error('Failed to save QR code as an image:', err);
    } else {
        console.log('QR code successfully saved as', qrCodeFilePath);
    }
    });
});