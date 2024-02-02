import { HttpProvider } from "@bloxroute/solana-trader-client-ts";
import { Keypair } from "@solana/web3.js";
import formatAmmKeysById from "./util/formatAmmKeysById";
import WebSocket from "ws";
import { Liquidity, LiquidityPoolKeys, jsonInfo2PoolKeys } from "@raydium-io/raydium-sdk";
export const MAINNET_API_HTTP = 'https://uk.solana.dex.blxrbdn.com'
export const MAINNET_API_WS = 'wss://uk.solana.dex.blxrbdn.com/ws'
export const MAINNET_API_GRPC_HOST = 'uk.solana.dex.blxrbdn.com'
export const MAINNET_API_GRPC_PORT = 443
export const MAINNET_AUTH_HEADER = 'NThmYjNiMGEtMjY3Ny00MGNkLWIxY2QtZjhkNzQxZDExNzFhOmUzMmMzMGNkZjJjYjU3NGE2ZTM0MWIwZDk3OGE5YWJl'
const MYOWNAUTH = 'ODc3NmU3ZjctYjY5Mi00NjliLWE2OTMtNmE5NTg3NTViOWZjOjcwYTlkZWU0MDM4MDE1ZTIzZjRhN2UxNjdiOTMyNzRm';
import { DEFAULT_TOKEN, connectionH, connection2, connection3 } from './util/constants';
import { createMarket } from "./db/db";
import { Metaplex } from "@metaplex-foundation/js";

const metaplex = Metaplex.make(connection3);

const socket = new WebSocket(MAINNET_API_WS, {
    headers: { Authorization: MYOWNAUTH }
})
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
class BRPCService {
    provider: HttpProvider;
    c: any;
    w: Keypair;
    socket: WebSocket;

    constructor() {

        this.socket = new WebSocket(MAINNET_API_WS, {
            headers: { Authorization: MAINNET_AUTH_HEADER }
        })

        this.socket.onopen = () => {
            console.log('Connection Opened');
            const newpools = JSON.stringify({ "jsonrpc": "2.0", "id": 1, "method": "subscribe", "params": ["GetNewRaydiumPoolsStream", {}] });
            this.socket.send(newpools);
        }

        this.socket.onerror = (err) => {
            console.log('Connection err ' + err);
        }


        this.socket.onmessage = async (msg: unknown) => {

            const { id, result, method, params, error } = JSON.parse(
                (msg as MessageEvent<string>).data
            )
            let token = null;
            let tokenX = null;

            if (params?.result?.pool) {
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

            }
        } 
        
    }
}


const getToken = async (mint: any) => {
    return await connectionH.getParsedAccountInfo(mint, "confirmed");
}


export default BRPCService