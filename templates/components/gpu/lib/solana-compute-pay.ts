/**
 * Solana On-Chain Compute Payment Helper for {{PROJECT_NAME}}
 * Facilitates pay-per-second GPU compute payments in SOL or $BCT on Solana
 */

import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

export interface ComputePaymentRequest {
  provider: 'runpod' | 'gmi_cloud' | 'e2b';
  amountSol: number;
  treasuryWallet?: string;
  userPublicKey: string;
}

export class SolanaComputePay {
  private connection: Connection;
  // Default framework treasury wallet for GPU compute settlement
  private treasuryWallet: PublicKey = new PublicKey('D3CV7esuBSRB9Aw3PHRNHVz4g6b4TqeVLKhgkbonk');

  constructor(rpcUrl: string = 'https://api.mainnet-beta.solana.com') {
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  /**
   * Create an on-chain Solana micro-transaction for GPU compute reservation.
   */
  async createComputePaymentTransaction(request: ComputePaymentRequest): Promise<Transaction> {
    const fromPubkey = new PublicKey(request.userPublicKey);
    const toPubkey = request.treasuryWallet ? new PublicKey(request.treasuryWallet) : this.treasuryWallet;

    const lamports = Math.round(request.amountSol * LAMPORTS_PER_SOL);
    if (lamports <= 0) {
      throw new Error('Invalid compute payment amount');
    }

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports,
      })
    );

    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;

    return transaction;
  }

  /**
   * Verify an on-chain transaction signature for settled GPU compute.
   */
  async verifyPaymentSignature(signature: string): Promise<boolean> {
    try {
      const tx = await this.connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });
      return tx !== null && tx.meta?.err === null;
    } catch {
      return false;
    }
  }
}
