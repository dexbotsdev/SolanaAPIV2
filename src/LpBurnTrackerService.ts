import { PublicKey } from "@solana/web3.js";
import { HELIUS_RPC_A, HELIUS_RPC_API, connection2, connection3, connectionH } from './util/constants';
import { findLpMint,  updateMarket } from "./db/db";
import parseBurnTx from "./util/parseBurn";
import axios from "axios";
import { TOKEN_PROGRAM_ID, getAccount } from "@solana/spl-token";
import { SPL_MINT_LAYOUT } from "@raydium-io/raydium-sdk";

const exclude = ['DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263']
const AmmAuth="5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1";

const pubtok = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
const getToken = async (mint: any) => {
    return await connection3.getParsedAccountInfo(new PublicKey(mint), "confirmed");
}


const LpBurnTrackerService = async () => {
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
            const isBurnTx: any = testix?.transaction.message.instructions.filter((ix: any) => ix?.parsed?.type == 'burn')
            const postbalance: any = testix?.meta?.postTokenBalances



            if (isBurnTx && isBurnTx.length > 0) {
                const burnd = isBurnTx[0];

                console.log(new Date().toLocaleTimeString());
                 console.log(isBurnTx[0]);
 
                const isToken = await findLpMint(burnd.parsed.info.mint)
 
                console.log(isToken);


            } 

        }
    });

 


}


export default LpBurnTrackerService;

LpBurnTrackerService();