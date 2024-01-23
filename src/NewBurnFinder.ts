import { PublicKey  } from "@solana/web3.js";
import { HELIUS_RPC_A, HELIUS_RPC_API, connection2, connection3  , connectionH } from './util/constants';
import { findLpMint, updateMarket } from "./db/db";
import parseBurnTx from "./util/parseBurn";
import axios from "axios";
import {TOKEN_PROGRAM_ID,  getAccount} from "@solana/spl-token";

const exclude = ['DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263']

const pubtok = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
const getToken = async (mint: any) => {
    return await connectionH.getParsedAccountInfo(new PublicKey(mint), "confirmed");
}


const mainBurn = async (emitter) => {
    connection3.onLogs(pubtok, async (logs, ctx) => {


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

            if (element.indexOf('Swap') > 0 || element.includes('MintTo')) door = 'X';
        });


        if (inc == 'close' && door != 'closed') {

            const testix = await connectionH.getParsedTransaction(logs.signature, {
                "maxSupportedTransactionVersion": 0,
                "commitment": 'confirmed'
            });

            const isburn = await parseBurnTx(testix, undefined);

            if (isburn && !exclude.includes(isburn.mint)) {
                 console.log(isburn);

                //console.log(await getToken(isburn.mint)); 
                const isToken = await findLpMint(isburn.mint);
                console.log(isToken );
 
                const lpMint = new PublicKey(isburn.mint);

                const tokenInfo =  await getAccount(
                    connection3,
                    lpMint,
                    'confirmed',
                    TOKEN_PROGRAM_ID
                  )

                  console.log(tokenInfo);
                  
                const tokenAccountInfo = await connection3.getAccountInfo(tokenInfo.address);
 
                console.log(tokenAccountInfo);


                // axios.post(HELIUS_RPC_API,
                // {
                //    "transactions": [logs.signature ]
                //  }).then(async result=>{

                //    const data = result.data[0]

                //    if(data?.type =='BURN'){

                //         console.log(isburn);
                let freezeAble = true;
                let mintable = true;
                //         const isToken = await findLpMint(isburn.mint)

                if (isburn && isToken) {

                    const tokenData: any = await getToken(isToken.baseMint)

                    console.log(tokenData);
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
                        burnedLpAmount: Number(isburn.amount) / 10 ** Number(isToken.lpDecimals)
                    };
                 //   const updated = await updateMarket(isToken.id, burned);


                    // if (updated) {

                    //     const isTokenUpdated = await findLpMint(isburn.mint)
                    //     emitter.emit('NewBurn', JSON.stringify(isTokenUpdated));
                    // }

                    console.log(burned);
                }


            }
            //  })



        }


    })


}


export default mainBurn;