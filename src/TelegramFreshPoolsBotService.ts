import { Api, TelegramClient } from "telegram";
import { StoreSession } from "telegram/sessions/index.js";
import { EventEmitter } from 'emitter' 
import {Button} from "telegram/tl/custom/button";
import { text } from 'input'
import { checkTokenHolders, shorten } from "./util/functions";
import {  newpoolsChannelIds } from "./util/constants";
import { Telegraf, session } from "telegraf";
export const TG_BOT_TOKEN="6552868588:AAFz_-iTBhHIzGo2ZPbksizXC_-PCoKhMCw" 


class TelegramFreshPoolsBotService{ 

    client: Telegraf;
    channels: any[]; 
    em: EventEmitter;  
 

    constructor() {

       
        this.client = new Telegraf(TG_BOT_TOKEN,);
        this.client.use(session());
        this.client.launch();
        this.initClient();
 
    }
  
    initClient = async () => { 
  
        const me = await this.client.telegram.getMe();  
        this.client.start((ctx) => {
            let message = ` Please use the /start command `
            ctx.reply(message)
        })

        this.client.on('message', (ctx) => {
            console.log(JSON.stringify(ctx, null, 2));
        }) 
    }


    async sendBurnMessageToChannel(arg0: string) {
        
        const data = JSON.parse(arg0);
        const tokenJson = data?.tokenJson? JSON.parse(data?.tokenJson):'';

        console.log('sendNewPoolMessageToChannel');
        console.log(data);

        const burned = data.burnedLpAmount;
        const lpAmount = data.lpAmount;

        if (lpAmount / burned > 4) return;

        let baseMint = data.baseMint;
        let quoteLiquidity = data.quoteReserve ? data.quoteReserve/(10**data.quoteDecimals) : '';

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

        if(topHoplders != null)
        topHoplders.forEach((h) => {
            let holderName = shorten(h.holder)
            if (h.holder.indexOf('AMM') >= 0) {
                ammpctg = Number(h.holderPercentage).toFixed(2);
                holderName = 'Raydium';
            }  
            if (cnt > 0)
                holdersTxt += `<a href="https://solscan.io/account/${h.holderAddress}">${holderName}</a>` + ': ' + Number(h.holderPercentage).toFixed(2) + ' % \n';

            cnt--;


        })



 
        const openTime = Date.now() - new Date(data.startTime).getTime();
        let timeLeft = 0;
        if(openTime<0){
            timeLeft = -openTime/1000;
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


        const sym = tokenJson? tokenJson?.symbol:data.tokenName;
        // Format data with emojis
        const formattedData = `
<b>New Pool ! ${emojis.token} | $${sym} | RAYDIUM</b>

${emojis.token} <b>Name:</b> ${data.tokenName} 
${emojis.baseLiquidity} <b>Token Address:</b> <a href="https://solscan.io/account/${baseMint}">${shorten(baseMint)}</a>  
${emojis.creationDate} <b>Creation Date:</b> ${new Date(data.creationDate).toUTCString()} 
${emojis.mintable} <b>Mint Renounced:</b> ${!data.mintable ? '✅' : '❌'} 
${emojis.freezeAble} <b>Freeze Account:</b> ${!data.freezeAble ? '✅' : '❌'} 
⏰ <b>Pool Open Time:</b> ${new Date(Number(data.startTime)).toUTCString()} : ${timeLeft} Secs Left to Launch 

${emojis.baseLiquidity} <b>Liquidity:</b> ${Number(quoteLiquidity).toFixed(2)} SOL
 
<b>Top 10 Holders:</b> 
${holdersTxt} 
<b>More Details:</b>

${tokenJson?.description}

<b>Links:</b>
<a href="https://birdeye.so/token/${baseMint}?chain=solana">Birdeye</a> | <a href="https://dexscreener.com/solana/${baseMint}">Dexscreener</a>

        `;
         
  
        newpoolsChannelIds.forEach((newburnsChannelId)=>{
            this.client.telegram.sendMessage(newburnsChannelId, formattedData,
                {
                    reply_markup:  {
                        inline_keyboard: [
                          
                          [{ text: '⚡ Insta-Buy with Bonkbot', url: `https://t.me/bonkbot_bot?start=ref_w76tg_ca_${baseMint}`}],
                          [{ text: '🍌 Banana', url: 'https://t.me/BananaGunSolana_bot?start=ref_astral'},
                          { text: '🦄 Unibot', url: 'https://t.me/solana_unibot?start=r-dexbotsdev' }],
                          [{ text: '🪐 Solareum', url: 'https://t.me/solareum_bot?start=783d5d66' },
                          { text: '🤖 SolTradingBot', url: `https://t.me/SolanaTradingBot?start=${baseMint}-w7XyTrwMT`}],
                         ],
                      },
                    parse_mode: 'HTML',
                    disable_web_page_preview: true
                })
                .then(() => {
                    console.log('Message sent successfully'); 
                    return;
                })
                .catch((error) => {
                    console.error('Error sending message:', error);
                    return;
                });
        })
        
        
      }



}


export default TelegramFreshPoolsBotService;