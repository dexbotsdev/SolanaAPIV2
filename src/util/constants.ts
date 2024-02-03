import { ENDPOINT as _ENDPOINT, MAINNET_PROGRAM_ID, RAYDIUM_MAINNET, TxVersion, LOOKUP_TABLE_CACHE, Token, TOKEN_PROGRAM_ID, WSOL } from "@raydium-io/raydium-sdk";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
 
 export const DEFAULT_TOKEN = {
    'USDC': new Token(TOKEN_PROGRAM_ID, new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), 6, 'USDC', 'USDC'),
    'SOL': new Token(TOKEN_PROGRAM_ID, new PublicKey(WSOL.mint), 9, 'SOL', 'SOL'),
}
export const RAYDIUM = new PublicKey("675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8")
export const OPENBOOK = new PublicKey("srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX")
export const FLUXBEAM = new PublicKey("FLUXubRmkEi2q6K3Y9kBPg9248ggaZVsoSFhtJHSrm1X")
export const METADATA_2022_PROGRAM_ID = new PublicKey("META4s4fSmpkTbZoUsgC1oBnWB31vQcmnN8giPw51Zu")
export const PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
export const ALCHEMY_SOL_RPC='https://solana-mainnet.g.alchemy.com/v2/2_COoCCJXuRDITEH_vwdWa_N6q3PMV8Q'
export const HELIUS_RPC='https://mainnet.helius-rpc.com/?api-key=7bf65758-6b7e-4b3e-ba69-28af3983e589'
export const HELIUS_RPC_A='https://mainnet.helius-rpc.com/?api-key=cfd3281b-fabc-4c1f-a18f-1b118e381938'
export const HELIUS_RPC_API='https://api.helius.xyz/v0/transactions?api-key=cfd3281b-fabc-4c1f-a18f-1b118e381938'
export const connection1 = new Connection(ALCHEMY_SOL_RPC,{commitment:'confirmed'});
export const connection2 = new Connection(HELIUS_RPC,{commitment:'confirmed'});
export const connection3 = new Connection('https://api.mainnet-beta.solana.com/',{commitment:'confirmed'});
export const connectionH = new Connection(HELIUS_RPC_A,{commitment:'confirmed'});


export const newburnsChannelIds=['-1002063926369'];
export const newburnsChannelIdsDS=["1197749731305209876","1198118277642203187"];


 
