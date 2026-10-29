import {
  EthSafeTransaction,
  calculateSafeTransactionHash,
} from "@safe-global/protocol-kit";
import type { Hex } from "viem";
import type { Tx } from "./core";
// Keep SDK transaction data independent of the chain-offline proposal API.
export class SafeProtocolService {
  static transaction(t: Tx) {
    return new EthSafeTransaction({
      to: t.to,
      value: t.value,
      data: t.data,
      operation: t.operation,
      safeTxGas: t.safeTxGas,
      baseGas: t.baseGas,
      gasPrice: t.gasPrice,
      gasToken: t.gasToken,
      refundReceiver: t.refundReceiver,
      nonce: t.nonce,
    });
  }
  static hash(t: Tx, version: string) {
    return calculateSafeTransactionHash(
      t.safe,
      this.transaction(t).data,
      version,
      BigInt(t.chainId),
    ) as Hex;
  }
}
