import { EventEmitter } from 'emitter'
import { checkTokenHolders, shorten } from "./util/functions";
import { newburnsChannelIds, newburnsChannelIdsDS } from "./util/constants";
import pkg, { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
const { Client, Intents } = pkg;

export const BOT_TOKEN = "MTE5Nzc1MDk3MzMzOTI4NzU3NQ.GXUwsv.4-neuKvv0uX1pa545AbKDEE22zXvJOCQ963ZPU"


class DiscordBotService {

    client;
    channels: any[];
    em: EventEmitter;


    constructor() {


        this.client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });;
        this.client.login(BOT_TOKEN);

    }




    async sendBurnMessageToChannel(arg0: string) {

        const data = JSON.parse(arg0);
        const tokenJson = JSON.parse(data.tokenJson);

        const burned = data.burnedLpAmount;
        const lpAmount = data.lpAmount;

        if (lpAmount / burned > 2) return;

        let baseMint = data.baseMint;
        let quoteLiquidity = data.quoteLiquidity;

        if (baseMint == 'So11111111111111111111111111111111111111112') {
            baseMint = data.quoteMint;
            quoteLiquidity = data.baseLiquidity;
        }
        const topHoplders = await checkTokenHolders(baseMint, data.lpMint);

        let thumbnail = undefined;
        // if (tokenJson) { if (tokenJson.image && tokenJson.image.indexOf('http') >= 0) thumbnail = tokenJson.image; }

        let holdersTxt = '';
        let ammpctg = '0';
        let cnt = 10;
        topHoplders.forEach((h) => {
            let holderName = shorten(h.holder)
            if (h.holder.indexOf('AMM') >= 0) {
                ammpctg = Number(h.holderPercentage).toFixed(2);
                holderName = 'Raydium';
            }
            if (cnt > 0)
                holdersTxt += `[${holderName}](https://solscan.io/account/${h.holderAddress})` + '\t\t  :' + Number(h.holderPercentage).toFixed(2) + ' % \n';

            cnt--;


        })




        const openTime = Date.now() - new Date(data.openTime).getTime();
        let timeLeft = 0;
        if (openTime < 0) {
            timeLeft = openTime / 1000;
        }

        const emojis = {
            token: '🚀',
            id: '🆔',
            owner: '👤',
            creationDate: '📅',
            lpAmount: '💧',
            baseLiquidity: '🪙',
            quoteLiquidity: '💲',
            lpBurned: data.lpBurned ? '🔥' : '❌',
            rugpulled: data.rugpulled ? '🚨' : '✅',
            mintable: data.mintable ? '🕵️' : '🕵️',
            freezeAble: data.freezeAble ? '🕵️' : '🕵️',
            burnedTime: '🔥⏰',
        };

        const embed = new MessageEmbed()
            .setColor('#3498db') // Set embed color (Blue in this example)
            .setTitle(`🔥 LP TOKEN BURNED | $${tokenJson.symbol} | Raydium 🔥 `)
            .setDescription(`
            **Mint Address:** 
            [${baseMint}](https://solscan.io/address/${baseMint})
            **Token Details:** 
            **Name : **  ${data.tokenName}
            **Description : **
            ${tokenJson?.description}
            **Pool Open Time:** ${new Date(data.openTime)} : ${timeLeft} Secs Left to Launch 

            **Authority renounced :** ${!data.mintable ? `✅` : `❌`} 
            **Freezing Disabled :** ${!data.freezeAble ? `✅` : `❌`} 
            
            **Liquidity | Pool allocation :** 
            ${quoteLiquidity} SOL | ${ammpctg} %

            Top 10 Holders :

            ${holdersTxt}
        `)
            .addField('Links',
                `[BirdEye](https://solscan.io/address/${data.baseMint}) | [Dexscreener](https://solscan.io/address/${data.baseMint}) | [Rugcheck](https://solscan.io/address/${data.baseMint}) | [Raydium](https://solscan.io/address/${data.baseMint})`)
            .addField(' ',
                `[Insta-Buy⚡]( https://t.me/bonkbot_bot?start=ref_vd5bb) [🤖  Fluxbot](https://solscan.io/address/${data.baseMint}) [🌐 Join Us!](https://solscan.io/address/${data.baseMint})`)

            .setTimestamp();

        if (thumbnail) embed.setThumbnail(thumbnail);


        const button = new MessageButton()
            .setStyle('LINK')
            .setLabel('View on Solana Explorer')
            .setURL(`https://solscan.io/address/${data.id}`);

        // Create an action row with the button
        const row = new MessageActionRow().addComponents(button);


        newburnsChannelIdsDS.forEach((channelId) => {
            const channel = this.client.channels.cache.get(channelId); 
            channel.send({ embeds: [embed], components: [row] });
        })


    }



}


export default DiscordBotService;