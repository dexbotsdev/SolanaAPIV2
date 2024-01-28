import {
  ApiPoolInfoV4,
  LIQUIDITY_STATE_LAYOUT_V4,
  Liquidity,
  MARKET_STATE_LAYOUT_V3,
  Market,
  SPL_MINT_LAYOUT
} from '@raydium-io/raydium-sdk';
import {
  PublicKey
} from '@solana/web3.js';
import { connectionH } from './constants'; 

export default async function formatAmmKeysById(id: string): Promise<ApiPoolInfoV4> {
  const account = await connectionH.getAccountInfo(new PublicKey(id))
  if (account === null) {  console.log(' get id info error 1'); return null; }
  const info = LIQUIDITY_STATE_LAYOUT_V4.decode(account.data)

  const marketId = info.marketId
  const marketAccount = await connectionH.getAccountInfo(marketId)
  if (marketAccount === null) {  console.log(' get id info error 2'); return null; }
  const marketInfo = MARKET_STATE_LAYOUT_V3.decode(marketAccount.data)

  const lpMint = info.lpMint
  const lpMintAccount = await connectionH.getAccountInfo(lpMint)
  if (lpMintAccount === null) { console.log(' get id info error 3'); return null; }
  const lpMintInfo = SPL_MINT_LAYOUT.decode(lpMintAccount.data)

  return {
    id,
    baseMint: info.baseMint.toString(),
    quoteMint: info.quoteMint.toString(),
    lpMint: info.lpMint.toString(),
    baseDecimals: info.baseDecimal.toNumber(),
    quoteDecimals: info.quoteDecimal.toNumber(),
    lpDecimals: lpMintInfo.decimals,
    version: 4,
    programId: account.owner.toString(),
    authority: Liquidity.getAssociatedAuthority({ programId: account.owner }).publicKey.toString(),
    openOrders: info.openOrders.toString(),
    targetOrders: info.targetOrders.toString(),
    baseVault: info.baseVault.toString(),
    quoteVault: info.quoteVault.toString(),
    withdrawQueue: info.withdrawQueue.toString(),
    lpVault: info.lpVault.toString(),
    marketVersion: 3,
    marketProgramId: info.marketProgramId.toString(),
    marketId: info.marketId.toString(),
    marketAuthority: Market.getAssociatedAuthority({ programId: info.marketProgramId, marketId: info.marketId }).publicKey.toString(),
    marketBaseVault: marketInfo.baseVault.toString(),
    marketQuoteVault: marketInfo.quoteVault.toString(),
    marketBids: marketInfo.bids.toString(),
    marketAsks: marketInfo.asks.toString(),
    marketEventQueue: marketInfo.eventQueue.toString(),
    lookupTableAccount: PublicKey.default.toString()
  }
}
