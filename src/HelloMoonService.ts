import { HttpProvider } from "@bloxroute/solana-trader-client-ts";
import { Keypair } from "@solana/web3.js";
import formatAmmKeysById from "./util/formatAmmKeysById";
import websocket from "websocket";
import { Metaplex } from "@metaplex-foundation/js";

import { Liquidity, LiquidityPoolKeys, jsonInfo2PoolKeys } from "@raydium-io/raydium-sdk";
export const MAINNET_API_WS = 'wss://kiki-stream.hellomoon.io'
export const MAINNET_AUTH_HEADER = 'NThmYjNiMGEtMjY3Ny00MGNkLWIxY2QtZjhkNzQxZDExNzFhOmUzMmMzMGNkZjJjYjU3NGE2ZTM0MWIwZDk3OGE5YWJl'
const MYOWNAUTH = 'ODc3NmU3ZjctYjY5Mi00NjliLWE2OTMtNmE5NTg3NTViOWZjOjcwYTlkZWU0MDM4MDE1ZTIzZjRhN2UxNjdiOTMyNzRm';
import { DEFAULT_TOKEN, connectionH, connection2, connection3 } from './util/constants';
import { createMarket, findLpMint } from "./db/db";
import DiscordBotNewPoolsService from "./DiscordBotNewPoolsService";
import TelegramFreshPoolsBotService from "./TelegramFreshPoolsBotService";
const APIKEY = "73d997b0-14e7-4958-9f75-aac6b5e8c1bb" // replace 
const SUBSCRIPTIONID = "1ceb557c-808b-4b1a-b409-257af6982a51" // replace

const metaplex = Metaplex.make(connection3);
const client = new websocket.client(); 
const socket = client.connect("wss://kiki-stream.hellomoon.io");

interface SubscriptionResult {
    slot: string;
    pool: {
        pool: string;
        poolAddress: string;
        token1Reserves: string;
        token1MintAddress: string;
        token1MintSymbol: string;
        token2Reserves: string;
        token2MintAddress: string;
        token2MintSymbol: string;
        openTime: string;
    };
}

interface JsonRpcRequest {
    jsonrpc: string;
    method: string;
    params: {
        subscription: string;
        result: SubscriptionResult;
    };
}
class HelloMoonService {
    provider: HttpProvider;
    c: any;
    w: Keypair;
    socket: WebSocket;
    client: any=new websocket.client();
    disbot: DiscordBotNewPoolsService;
    tgbot: TelegramFreshPoolsBotService;

    constructor(disbot : DiscordBotNewPoolsService,tgBot: TelegramFreshPoolsBotService) {

        this.client.connect(MAINNET_API_WS);
        this.disbot = disbot;
        this.tgbot = tgBot;

        console.log( 'Connect to Webservice ');

        this.client.on("connect", (connection) => {
            connection.on("message", (message: { type: string; utf8Data: string; }) => {
              if (!message || message.type !== "utf8") return;
              const data = JSON.parse(message.utf8Data);
              if (data === "You have successfully subscribed") {
                return;
              }
          
              console.log( data)

              data.forEach(async poolInfo => {                


                const ammId = poolInfo.poolAddress;

                try {
                    let targetPoolInfo = await formatAmmKeysById(ammId);

                    let token = null;
                    let tokenX = null;

                    if (targetPoolInfo) {
                        const poolKeys = jsonInfo2PoolKeys(targetPoolInfo) as unknown as LiquidityPoolKeys
                        const extraPoolInfo = await Liquidity.fetchInfo({ connection: connectionH, poolKeys })

                       token = await getToken(poolKeys.baseMint);
                       tokenX = await metaplex.nfts().findByMint({ mintAddress: poolKeys.baseMint });
                        const tokenName = tokenX?.name;
                        let mintable = false;

                        //console.log(tokenX)
                        //console.log(token)


                        if (token.mintAuthority && token.mintAuthority !== null && token.mintAuthority.toString() !== "11111111111111111111111111111111") {
                            mintable = true;
                        }



                        const t = {
                            status: extraPoolInfo.status.toString(),
                            baseDecimals: extraPoolInfo.baseDecimals.toString(),
                            quoteDecimals: extraPoolInfo.quoteDecimals.toString(),
                            lpDecimals: extraPoolInfo.lpDecimals.toString(),
                            baseReserve: extraPoolInfo.baseReserve.toString(),
                            quoteReserve: extraPoolInfo.quoteReserve.toString(),
                            lpSupply: extraPoolInfo.lpSupply.toString(),
                            startTime: Number(extraPoolInfo.startTime.toString()) * 1000,
                            creationDate: Date.now(),
                            tokenName: tokenName,
                            symbol: tokenX?.json ? tokenX.json.symbol : tokenName,
                            lpBurned: false,
                            rugpulled: false,
                            burnedTime: 0,
                            rugpulledTime: 0,
                            burnedLpAmount: 0,
                            mintable: mintable,
                            freezeAble: true,
                            tokenJson: JSON.stringify(tokenX?.json),
                            ...targetPoolInfo
                        }

                        const isToken = await findLpMint(targetPoolInfo.lpMint.toString());

                        this.disbot.sendNewPoolMessageToChannel(JSON.stringify(t));
                        this.tgbot.sendBurnMessageToChannel(JSON.stringify(t));

                        if(!isToken){
                            await createMarket(t);

                        }

                        console.log(t);
                    }


                    console.log(Date.now());

                } catch (error) {
                    console.log(error)
                }

              });
              /*
                Do logic here if you decide to filter each message received or 
                send messages to another service.
              */ 
          
            });
          
            connection.sendUTF(
              JSON.stringify({
                action: "subscribe",
                apiKey: APIKEY,
                subscriptionId: SUBSCRIPTIONID,
              })
            );
          });
        

        this.client.onmessage = async (msg: unknown) => {

             
            let token = null;
            let tokenX = null;

           /** if (params?.result?.pool) {
                const version: 4 | 5 = 4
                const pooljson = JSON.parse(JSON.stringify(params.result.pool));

               // console.log(pooljson);
                //console.log('**************************');

                if (pooljson) {

                    try {
                        let targetPoolInfo = await formatAmmKeysById(pooljson.poolAddress);



                        if (targetPoolInfo) {
                            const poolKeys = jsonInfo2PoolKeys(targetPoolInfo) as unknown as LiquidityPoolKeys
                            const extraPoolInfo = await Liquidity.fetchInfo({ connection: connectionH, poolKeys })

                            token = await getToken(poolKeys.baseMint);
                            tokenX = await metaplex.nfts().findByMint({ mintAddress: poolKeys.baseMint });
                            const tokenName = tokenX?.name;
                            let mintable = false;

                            //console.log(tokenX)
                            //console.log(token)


                            if (token.mintAuthority && token.mintAuthority !== null && token.mintAuthority.toString() !== "11111111111111111111111111111111") {
                                mintable = true;
                            }



                            const t = {
                                status: extraPoolInfo.status.toString(),
                                baseDecimals: extraPoolInfo.baseDecimals.toString(),
                                quoteDecimals: extraPoolInfo.quoteDecimals.toString(),
                                lpDecimals: extraPoolInfo.lpDecimals.toString(),
                                baseReserve: extraPoolInfo.baseReserve.toString(),
                                quoteReserve: extraPoolInfo.quoteReserve.toString(),
                                lpSupply: extraPoolInfo.lpSupply.toString(),
                                startTime: Number(extraPoolInfo.startTime.toString()) * 1000,
                                creationDate: Date.now(),
                                tokenName: tokenName,
                                symbol: tokenX?.json ? tokenX.json.symbol : tokenName,
                                lpBurned: false,
                                rugpulled: false,
                                burnedTime: 0,
                                rugpulledTime: 0,
                                burnedLpAmount: 0,
                                mintable: mintable,
                                freezeAble: true,
                                tokenJson: JSON.stringify(tokenX?.json),
                                ...targetPoolInfo
                            }


                            await createMarket(t);

                            console.log(t);
                        }


                        console.log(Date.now());

                    } catch (error) {
                        console.log(error)
                    }
                } 

            } */



        } 
        
    }
}

 


const getToken = async (mint: any) => {
    return await connectionH.getParsedAccountInfo(mint, "confirmed");
}

export default HelloMoonService