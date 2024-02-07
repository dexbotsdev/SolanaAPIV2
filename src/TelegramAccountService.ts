import { Api, TelegramClient } from "telegram";
import { StoreSession } from "telegram/sessions/index.js";
import { EventEmitter } from 'emitter' 
import {Button} from "telegram/tl/custom/button";
import { text } from 'input'
import { checkTokenHolders, shorten } from "./util/functions";
import { newburnsChannelIds } from "./util/constants";


class TelegramAccountService{ 

    client: TelegramClient;
    channels: any[];
    botClient: TelegramClient;
    em: EventEmitter;  
 

    constructor() {

        const apihash='234cdd3f30e0b5f7d5052209e3c10b31';
        const apiId=1349666
        this.client = new TelegramClient(new StoreSession("./data/account"), apiId, apihash, {

            requestRetries:5,
            connectionRetries:5,
            useIPV6:true,
            retryDelay:5,
            sequentialUpdates:true,
        });
         
        this.initClient();
 
    }
 

    disconnect = () => {

        this.client.disconnect();
    }
    initClient = async () => { 

        await this.client.start({
            phoneNumber: async () => await text("Please enter your number: "),
            password: async () => await text("Please enter your password: "),
            phoneCode: async () =>
                await text("Please enter the code you received: "),
            onError: (err: any) => console.log(err),
        }); 
        const me = await this.client.getMe();  

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



 
        const openTime = Date.now() - new Date(data.openTime).getTime();
        let timeLeft = 0;
        if(openTime<0){
            timeLeft = openTime/1000;
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

        // Format data with emojis
        const formattedData = `
<b>LP Burned! ${emojis.token} | $${tokenJson.symbol} | RAYDIUM</b>

${emojis.token} <b>Name:</b> ${data.tokenName} 
${emojis.owner} <b>Owner:</b>  <a href="https://solscan.io/account/${data.owner}">${shorten(data.owner)}</a>  
${emojis.baseLiquidity} <b>Token Address:</b> <a href="https://solscan.io/account/${baseMint}">${shorten(baseMint)}</a>  
${emojis.creationDate} <b>Creation Date:</b> ${data.creationDate} 
${emojis.mintable} <b>Mint Renounced:</b> ${!data.mintable ? '✅' : '❌'} 
${emojis.freezeAble} <b>Freeze Account:</b> ${!data.freezeAble ? '✅' : '❌'} 
⏰ <b>Pool Open Time:</b> ${new Date(data.openTime)} : ${timeLeft} Secs Left to Launch 

${emojis.baseLiquidity} <b>Liquidity:</b> ${Number(quoteLiquidity).toFixed(2)} SOL
 
<b>Top 10 Holders:</b> 
${holdersTxt} 
<b>More Details:</b>

${tokenJson.description}

<b>Links:</b>
<a href="https://birdeye.so/token/${baseMint}?chain=solana">Birdeye</a> | <a href="https://dexscreener.com/solana/${baseMint}">Dexscreener</a>

        `;
        const linkedchannel = await this.client.getInputEntity(newburnsChannelIds[0]); 


        // await this.client.connect(); // This assumes you have already authenticated with .start()

        //         const result = await this.client.invoke(
        //             new Api.messages.SendMessage({
        //             peer: newburnsChannelId,
        //             message: "Hello there!",
        //             noWebpage: true, 
        //             noforwards: true,  
        //             replyMarkup:new Api.ReplyKeyboardMarkup({
        //                 rows : [
        //                   new Api.KeyboardButtonRow({
        //                      buttons : [
        //                        new Api.KeyboardButtonUrl({
        //                           text : '⚡ Insta-Buy with Bonkbot',
        //                           url : `https://t.me/bonkbot_bot?start=ref_vd5bb_ca_${baseMint}`
        //                        })
        //                      ]
        //                   })
        //                 ]
        //               })
        //             })
        //         );
        //         console.log(result); // prints the result
  
        this.client.sendMessage(linkedchannel,{message:formattedData,parseMode: 'html', linkPreview:false,
                
        buttons:[
            [Button.url('⚡ Insta-Buy with Bonkbot',`https://t.me/bonkbot_bot?start=ref_vd5bb_ca_${baseMint}`)],
            [Button.url('🍌 Banana','https://t.me/BananaGunSolana_bot?start=ref_astral'),
            Button.url('🦄 Unibot','https://t.me/solana_unibot?start=r-bitce0' )],[
            Button.url('🪐 Solareum','https://t.me/solareum_bot?start=783d5d66'),
            Button.url('🤖 SolTradingBot','https://t.me/SolanaTradingBot?start=XDQq2MvW5')]]
        }); 
        
      }



}


export default TelegramAccountService;