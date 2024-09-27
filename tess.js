const ytdl = require("@distube/ytdl-core");
const { getRandomIPv6 } = require("@distube/ytdl-core/lib/utils");
const fs = require('fs');

async function getInfoYt(url) {
    let repeat = 0;
    let info = await getInfo();
    return info;
    async function getInfo() {
        if(repeat >= 5) return 'gagal';
        try {
            const agentForARandomIP = ytdl.createAgent(undefined, {
                localAddress: getRandomIPv6("2001:2::/48"),
            });

            const info = await ytdl.getInfo(url, { agentForARandomIP });

            return info
        } catch (e) {
            console.log(`Gagal mengambil agent: ${ e.message }`);
            repeat+=1;
            return await getInfo();
        }
    }
}

getInfoYt('https://www.youtube.com/watch?v=IJVPSyLkmyA&ab_channel=ParadiseLoves')
.then((result) => {
    console.log(result);
})