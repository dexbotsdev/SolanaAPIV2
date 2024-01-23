import { TOKEN_PROGRAM_ID } from "@raydium-io/raydium-sdk";
import { ParsedInstruction, ParsedTransactionWithMeta, PartiallyDecodedInstruction, PublicKey } from "@solana/web3.js";
export type Maybe<T> = T | null;
export type Undef<T> = T | undefined;
export type MaybeUndef<T> = T | null | undefined;
export type Common<A, B> = {
  [P in keyof A & keyof B]?: A[P] | B[P];
};
export type AtLeastOne<T> = [T, ...Array<T>];
export type Resolved<T> = T extends Promise<infer U> ? U : never;
    function getAllInnerIxsWithIndices(
    parsedTx: ParsedTransactionWithMeta
  ) {
    return parsedTx.meta?.innerInstructions?.reduce(
      (
        acc: Array<{
          ix: ParsedInstruction | PartiallyDecodedInstruction;
          ixIndex: number;
          ixInnerIndex: number;
        }>,
        currVal
      ) => [
        ...acc,
        ...currVal.instructions.map((ix, ixInnerIndex) => ({
          ix,
          ixIndex: currVal.index,
          ixInnerIndex,
        })),
      ],
      []
    );
  }
 function findIxWithIndices(
    tx: ParsedTransactionWithMeta,
    isIx: (ix: ParsedInstruction | PartiallyDecodedInstruction) => boolean
  ): Maybe<{
    ix: ParsedInstruction | PartiallyDecodedInstruction;
    ixIndex: number;
    ixInnerIndex: MaybeUndef<number>;
  }> {

    if(!tx || tx ==null) return null;
    const ixs = tx.transaction.message.instructions;
    const ixIndex = ixs.findIndex((ix) => isIx(ix));
  
    const allInnerIxs =
      ixIndex !== -1
        ? // Don't bother in this case
          []
        : getAllInnerIxsWithIndices(tx);
    const innerIx = (allInnerIxs ?? []).find(({ ix }) => isIx(ix));
  
    if (ixIndex === -1 && innerIx == null) {
      return null;
    }
  
    const ix = ixIndex !== -1 ? ixs[ixIndex] : innerIx!.ix;
    return {
      ix,
      ixIndex: ixIndex !== -1 ? ixIndex : innerIx!.ixIndex,
      ixInnerIndex: innerIx?.ixInnerIndex,
    };
  }
  
  function arePublicKeysEqual(
    pubkey1: PublicKey,
    pubkey2: PublicKey
  ): boolean {
    return pubkey1.toString() === pubkey2.toString();
  }

function isBurnIx(
    ix: ParsedInstruction | PartiallyDecodedInstruction,
    tokenMint?: PublicKey
  ): boolean {
    return (
      ix.programId.equals(TOKEN_PROGRAM_ID) &&
      ["burn"].includes((ix as ParsedInstruction).parsed?.type) &&
      (tokenMint == null ||
        arePublicKeysEqual(
          (ix as ParsedInstruction).parsed?.info?.mint ?? "",
          tokenMint
        ))
    );
  }
  
  export default async function parseBurnTx(
    tx: ParsedTransactionWithMeta,
    tokenMint?: PublicKey
  ){
    const ixWithIndices = findIxWithIndices(tx, (ix) => isBurnIx(ix, tokenMint));
    if (ixWithIndices == null) {
      return null;
    }
    const { ix: burnIx, ixIndex, ixInnerIndex } = ixWithIndices;
    const burnIxParsed = burnIx as ParsedInstruction;
  
 
    const fromAndTo = (
      burnIxParsed.parsed.info.authority ??
      burnIxParsed.parsed.info.multisigAuthority
    ).toString();
  
    const tokenMintForIx = new PublicKey(burnIxParsed.parsed.info.mint);
  
    if (tokenMint != null && !tokenMint.equals(tokenMintForIx)) {
      return null;
    }
  
   
    return {
        ...burnIxParsed.parsed.info,
       fromAddress: fromAndTo,
      id: tx.transaction.signatures[0],
      ixIndex,
      ixInnerIndex,
      mint: tokenMintForIx.toString(),
      timeCreated: tx.blockTime!,
      toAddress: fromAndTo,
      txid: tx.transaction.signatures[0],
      type: 'Burned',
    };
  }
  