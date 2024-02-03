import { PublicKey } from "@solana/web3.js";
import { HELIUS_RPC_A, HELIUS_RPC_API, connection2, connection3, connectionH } from './util/constants';
import { findLpMint, updateMarket } from "./db/db";
import parseBurnTx from "./util/parseBurn";
import axios from "axios";
import { TOKEN_PROGRAM_ID, getAccount } from "@solana/spl-token";
import { Liquidity, LiquidityPoolKeys, SPL_MINT_LAYOUT, jsonInfo2PoolKeys } from "@raydium-io/raydium-sdk";
import formatAmmKeysById from "./util/formatAmmKeysById";

import { Metaplex } from "@metaplex-foundation/js";

const metaplex = Metaplex.make(connectionH);

const exclude = ['DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263']
const AmmAuth = "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1";

const pubtok = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
const getToken = async (mint: any) => {
    return await connectionH.getParsedAccountInfo(new PublicKey(mint), "confirmed");
}

const sent = []
        
const mainBurn = async (  bot, dbot) => {
    connectionH.onLogs(pubtok, async (logs, ctx) => {


        if (logs.err !== null) return;
        let inc = '';
        let door = '';

        logs.logs.forEach((element: any) => {

            if (element.indexOf('Burn') > 0) inc = 'open';
            if (element.indexOf('Swap') > 0 || element.indexOf('JUP') > 0 || element.indexOf('MintTo') > 0 || element.indexOf('reward') > 0 || element.indexOf('Liquidity') > 0 || element.indexOf('USDC') > 0 || element.indexOf('Collect') > 0) inc = 'X';

            if (inc == 'open' && element.indexOf('CloseAccount') > 0) inc = 'close';
            if (element.indexOf("calc_exact len:0") > 0 && door == '') {
                door = 'open';
            }
            if (element.indexOf("CloseAccount") > 0 && door == 'open') {
                door = 'closed';
            }

        });


        if (inc == 'close') {

            const testix = await connectionH.getParsedTransaction(logs.signature, {
                "maxSupportedTransactionVersion": 0,
                "commitment": 'confirmed'
            });
            const isBurnTx: any = testix?.transaction.message.instructions.filter((ix: any) => ix?.parsed?.type == 'burn')
            const postbalance: any = testix?.meta?.postTokenBalances



            if (isBurnTx && isBurnTx.length > 0) {
                const burnd = isBurnTx[0];

                console.log(new Date().toUTCString());


                const isToken = await findLpMint(burnd.parsed.info.mint)

                if (isToken) {
                    let freezeAble = true;
                    let mintable = true;
                    const tokenData: any = await getToken(isToken.baseMint)

                    const token = tokenData?.value?.data.parsed?.info

                    if (token.freezeAuthority !== null && token.freezeAuthority.toString() !== "11111111111111111111111111111111") {
                        freezeAble = true;
                    } else if (token.freezeAuthority == null) {
                        freezeAble = false;
                    }
                    if (token.mintAuthority !== null && token.mintAuthority.toString() !== "11111111111111111111111111111111") {
                        const authority = await connectionH.getParsedAccountInfo(new PublicKey(token.mintAuthority), "confirmed")
                        if (!authority.value) {
                            console.log("Authority account does not exist")
                        } else {
                            mintable = true;
                        }
                    } else if (token.mintAuthority == null) {
                        mintable = false;
                    }

                    const burned = {
                        lpBurned: true,
                        mintable: mintable,
                        freezeAble: freezeAble,
                        burnedTime: Date.now(),
                        burnedLpAmount: Number(burnd.parsed.info.amount) / 10 ** Number(isToken.lpDecimals)
                    };
                    const updated = await updateMarket(isToken.id, burned);


                    if (burned.lpBurned) {
                        console.log('Market Updated for New BURN ');

                        const ammPool = await findLpMint(burnd.parsed.info.mint)


                        let token: any = null;
                        let tokenX: any = null;
                        let tokenName = ammPool?.tokenName;
                        try {
                            let targetPoolInfo = await formatAmmKeysById(ammPool.id);

                            console.log('targetPoolInfo for New BURN ');


                            if (ammPool) {
                                const poolKeys = jsonInfo2PoolKeys(targetPoolInfo) as unknown as LiquidityPoolKeys

                                console.log('poolKeys for New BURN ');

                                const extraPoolInfo = await Liquidity.fetchInfo({ connection: connectionH, poolKeys })



                                console.log('extraPoolInfo for New BURN ');

                                token = await getToken(poolKeys.baseMint);


                                console.log('getToken for New BURN ');


                                if (!ammPool?.tokenName) {

                                    tokenX = await metaplex.nfts().findByMint({ mintAddress: poolKeys.baseMint });
                                    tokenName = tokenX.name;
                                }

                                let mintable = false;


                                console.log('token.mintAuthority check for New BURN ');


                                if (token.mintAuthority && token.mintAuthority !== null && token.mintAuthority.toString() !== "11111111111111111111111111111111") {
                                    mintable = true;
                                }



                                let t = {
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
                                    lpBurned: ammPool.lpBurned,
                                    rugpulled: ammPool.rugpulled,
                                    burnedTime: ammPool.burnedTime,
                                    rugpulledTime: ammPool.rugpulledTime,
                                    burnedLpAmount: ammPool.burnedLpAmount,
                                    mintable: mintable,
                                    freezeAble: freezeAble,
                                    tokenJson: ammPool?.tokenJson ? ammPool?.tokenJson : JSON.stringify(tokenX?.json),
                                    ...ammPool.toJSON()
                                }

                                console.log('sent.includes check for New BURN ');

                                if (!sent.includes(targetPoolInfo.baseMint)) {

                                    await bot.sendBurnMessageToChannel(JSON.stringify(t));
                                    await dbot.sendBurnMessageToChannel(JSON.stringify(t));
                                    console.log('Sent Bot Calls ', JSON.stringify(t));

                                    
                                } else {
                                    sent[targetPoolInfo.baseMint] = true;
                                }
                            }


                            console.log(new Date().toLocaleString());

                        } catch (error) {
                            console.log(error)
                        }
                    }


                }
                else {
                    console.log('LPMint  not found ' + burnd.parsed.info.mint);

                }

            }

        }

    });
}







export default mainBurn;