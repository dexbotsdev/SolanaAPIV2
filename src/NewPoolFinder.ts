import { Connection, PublicKey } from "@solana/web3.js";
import { DEFAULT_TOKEN,  connectionH, connection2, connection3 } from './util/constants';
import formatAmmKeysById from "./util/formatAmmKeysById";
import { createMarket } from "./db/db";
import { WSOL } from "@raydium-io/raydium-sdk";
import { Metaplex } from '@metaplex-foundation/js';

const programId = '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'

const metaplex = Metaplex.make(connection3);


const getToken=async (mint: any)=> {
    return  await connectionH.getParsedAccountInfo(mint, "confirmed");
}


const main = async (emitter) => {

    try{

        connectionH.onLogs(new PublicKey(programId), async (logs, ctx) => {
            if (logs.err !== null) return;
            let poolcontains = false;
            let pooljson :any;
    
            for (const message of logs.logs) {
                if (message.indexOf("init_pc_amount") > 0 && message.includes('init_coin_amount')) {
    
                    const pattern = /InitializeInstruction2\s{([^}]*)}/;
    
                    // Use the regex pattern to match and extract the JSON object
                    const match = message.match(pattern);
                    poolcontains = true; 
    
                    if(match){
    
                        const jsonString = "{" + match[1] + "}";
        
                        // Replace single quotes with double quotes to make it valid JSON
                        const validJsonString = jsonString.replace(/(\w+):/g, '"$1":');
    
                       
                        pooljson = JSON.parse(validJsonString);
    
                    }
                }
            }
            if (!poolcontains) return;
    
            let info;
            info = await connectionH.getParsedTransaction(logs.signature, {
                "maxSupportedTransactionVersion": 0,
                "commitment": 'confirmed'
            })
            try{
                if (info) {
                    ////console.log(logs.signature);
                    let solpair=false;
                    let usdcpair=false;
                    const accounts = info.transaction.message.accountKeys.map((i) => i.pubkey.toString());
                     //console.log(accounts);
        
        
                    for (const tokens of accounts) {
                        if (tokens.indexOf(WSOL.mint) >= 0) {
                            solpair = true; 
                        }
                        if (tokens.indexOf(DEFAULT_TOKEN.USDC.mint.toString()) >= 0) {
                            usdcpair = true; 
                        }
                    }
                     //console.log(info.meta.postTokenBalances);
        
                    const baseLP =  solpair?info.meta.postTokenBalances.filter((item)=>item.accountIndex ==5||item.accountIndex ==2)[0].uiTokenAmount.uiAmount:info.meta.postTokenBalances.filter((item)=>item.accountIndex ==4)[0].uiTokenAmount.uiAmount
                    const quoteLP =  solpair?info.meta.postTokenBalances.filter((item)=>item.accountIndex ==6|| item.accountIndex ==1)[0].uiTokenAmount.uiAmount:info.meta.postTokenBalances.filter((item)=>item.accountIndex ==5)[0].uiTokenAmount.uiAmount
                    const lpMint =  info.meta.postTokenBalances.filter((item)=>item.accountIndex ==10 ||item.accountIndex ==7)[0].mint;
                    const lpAmnt =  info.meta.postTokenBalances.filter((item)=>item.accountIndex ==10 ||item.accountIndex ==7)[0].uiTokenAmount.uiAmount;
        
                    let ammId = accounts[2];
        
                    if(usdcpair)ammId = accounts[1];
        
        
                        let token=null;
                        let tokenX=null;
        
                        const baseMint =  solpair?info.meta.postTokenBalances.filter((item)=>item.accountIndex ==5)[0].mint:info.meta.postTokenBalances.filter((item)=>item.accountIndex ==4)[0].mint
                        const quoteMint =  solpair?info.meta.postTokenBalances.filter((item)=>item.accountIndex ==6)[0].mint:info.meta.postTokenBalances.filter((item)=>item.accountIndex ==5)[0].mint
                   
                        const baseDecimals =  solpair?info.meta.postTokenBalances.filter((item)=>item.accountIndex ==5)[0].uiTokenAmount.decimals:info.meta.postTokenBalances.filter((item)=>item.accountIndex ==4)[0].uiTokenAmount.decimals
                        const quoteDecimals =  solpair?info.meta.postTokenBalances.filter((item)=>item.accountIndex ==6)[0].uiTokenAmount.decimals:info.meta.postTokenBalances.filter((item)=>item.accountIndex ==5)[0].uiTokenAmount.decimals
                   
        
                         if(baseMint == DEFAULT_TOKEN.SOL.mint.toString() || baseMint== DEFAULT_TOKEN.USDC.mint.toString()){
                            token = await getToken(new PublicKey(quoteMint));
                            tokenX = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(quoteMint) });
        
                            // console.log('quoteAs baseMint '+ baseMint)
        
        
                          } else {
        
                            // console.log('baseMint '+ baseMint)
                            token = await getToken(new PublicKey(baseMint));
                            tokenX = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(baseMint) });
        
                         }
         
                         const tokenName = tokenX?.name;
                         let mintable = false;
        
                         //console.log(tokenX)
                         //console.log(token)
        
        
                         if (token.mintAuthority && token.mintAuthority !== null && token.mintAuthority.toString() !== "11111111111111111111111111111111") {
                            mintable =true; 
                         }
        
        
                        const unPool = {
                            id:usdcpair? accounts[1]: accounts[2],
                            tokenName: tokenName,
                            baseMint: baseMint,
                            quoteMint: quoteMint,
                            openTime:Number(pooljson.open_time)*1000,
                            lpMint: lpMint,
                            lpAmount: lpAmnt,
                            baseLiquidity: baseLP,
                            quoteLiquidity: quoteLP,
                            baseDecimals: baseDecimals,
                            quoteDecimals: quoteDecimals,
                            lpDecimals: info.meta.postTokenBalances.filter((item)=>item.accountIndex ==10 ||item.accountIndex ==7)[0].uiTokenAmount.decimals,
                            lpBurned:false, 
                            rugpulled:false,
                            burnedTime:0,
                            rugpulledTime:0,
                            burnedLpAmount:0,
                            mintable:mintable,
                            freezeAble:true,
                            owner:tokenX.updateAuthorityAddress.toString(),
                            tokenJson: JSON.stringify(tokenX.json)
                        }
                        await createMarket(unPool);
                        emitter.emit('NewPool', JSON.stringify(unPool));
        
                    }
            }catch(err){
                console.log(err)
            }
            
    
        })
    }catch(Error){
        //console.log(Error)
    }


}


export default main;