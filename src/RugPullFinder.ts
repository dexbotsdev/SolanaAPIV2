import { Connection, PublicKey } from "@solana/web3.js";
import { DEFAULT_TOKEN, connectionH, connection2, connection3 } from './util/constants';
import formatAmmKeysById from "./util/formatAmmKeysById";
import { createMarket, findLpMint, updateMarket } from "./db/db";
import { WSOL } from "@raydium-io/raydium-sdk";
import { Metaplex } from '@metaplex-foundation/js';
import parseBurnTx from "./util/parseBurn";
import axios from "axios";

const authority = '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1'
const metaplex = Metaplex.make(connection3);

const pubtok = new PublicKey('burn68h9dS2tvZwtCFMt79SyaEgvqtcZZWJphizQxgt')
const getToken = async (mint: any) => {
    return await connectionH.getParsedAccountInfo(mint, "confirmed");
}
 

const mainRugpull = async () => {
    const authPool = new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8');

    console.log('Rugpull Detector Started')
    connectionH.onLogs(authPool, async (logs, ctx) => {


        let containsRug: boolean = false;
        let door = '';
        if (logs.err !== null) return;

        for (const message of logs.logs) {
            if (message.indexOf("calc_exact len:0") > 0 && door == '') {
                door = 'open';
            }
            if (message.indexOf("CloseAccount") > 0 && door == 'open') {
                door = 'closed';
            }

            if (message.indexOf('Swap') > 0 || message.includes('MintTo')) door = 'X';
        }

        try{

            if (door == 'closed') {
                //  console.log(JSON.stringify(logs, null, 2));
    
                const info = await connectionH.getParsedTransaction(logs.signature, {
                    "maxSupportedTransactionVersion": 0
                });
                const isburn = await parseBurnTx(info, undefined);
    
                if (isburn) {
                     console.log(JSON.stringify(isburn, null, 2));
    
                    const preTokenBalance = info.meta.preTokenBalances.filter((ix) => ix.owner == authority && ix.mint != WSOL.mint)[0];
                    const postTokenBalance = info.meta.postTokenBalances.filter((ix) => ix.owner == authority && ix.mint != WSOL.mint)[0];
                    const preQuoteBalance = info.meta.preTokenBalances.filter((ix) => ix.owner == authority && ix.mint == WSOL.mint)[0];
                    const postQuoteBalance = info.meta.postTokenBalances.filter((ix) => ix.owner == authority && ix.mint == WSOL.mint)[0];
    
                    // console.log(preTokenBalance)
                    // console.log(postTokenBalance)
                    // console.log(preQuoteBalance)
                    // console.log(postQuoteBalance)
                     console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%')
    
    
                    const removerAuthority = isburn.authority;
    
                    const tokenX = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(preTokenBalance.mint) });
    
                    const tokenAuthority = tokenX.updateAuthorityAddress.toBase58();
    
                    if (removerAuthority == tokenAuthority) {
    
    
                       // console.log(Number(postTokenBalance.uiTokenAmount.amount) / Number(preTokenBalance.uiTokenAmount.amount))
    
    
                       // console.log('Remover ' + tokenX.name);
                       // console.log('Remover ' + removerAuthority);
                       // console.log('tokenAuthority ' + tokenAuthority);
                        console.log('Real RugPull ' + logs.signature);
    
    
                        const rugPull = {
    
                            authority: removerAuthority,
                            tokenName: tokenX.name,
                            baseMint: postTokenBalance.mint,
                            quoteMint: postQuoteBalance.mint,
                            removedAmount: Number(postTokenBalance.uiTokenAmount.amount) - Number(preTokenBalance.uiTokenAmount.amount)
    
                        }
    
                      //  console.log(rugPull);
    
    
                         
    
    
                        const isToken = await findLpMint(isburn.mint)
    
    
                        if (isToken) {
                            const rugpulled = {
                                rugpulled: true,
                                rugpulledTime: Date.now()
                            }
    
                            const updated = await updateMarket(isToken.id, rugpulled);
    
                           //  console.log(updated);
    
    
                        }
    
    
                    }
    
                }
    
            }
        }catch(error){
            console.log(error)
        }


    })


}


export default mainRugpull;