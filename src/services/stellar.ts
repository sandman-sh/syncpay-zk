import {
  Horizon,
  TransactionBuilder,
  Networks,
  Asset,
  BASE_FEE,
  Contract,
  Address,
  xdr,
  rpc,
  nativeToScVal
} from "@stellar/stellar-sdk";
import {
  isConnected,
  requestAccess,
  signTransaction,
  getNetwork
} from "@stellar/freighter-api";
import { Buffer } from "buffer";

// Horizon server pointing to Stellar Testnet
export const HORIZON_URL = import.meta.env.VITE_HORIZON_URL || "https://horizon-testnet.stellar.org";
export const server = new Horizon.Server(HORIZON_URL);

// Soroban RPC Server pointing to Stellar Testnet
export const SOROBAN_RPC_URL = import.meta.env.VITE_SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";
export const rpcServer = new rpc.Server(SOROBAN_RPC_URL);

// Deployed Smart Contract ID on Testnet
export const SYNC_PAY_ZK_CONTRACT_ID = import.meta.env.VITE_SYNC_PAY_ZK_CONTRACT_ID || "CDUR55RCFPJHLIK7CI2Q74HF33BZKT55RGV35B2ARYXEYLOO3RPKBLKQ";

// Testnet USDC asset issuer (standard community-known issuer for testnet)
export const USDC_ISSUER = import.meta.env.VITE_USDC_ISSUER || "GBBD47IF6LWK7P7TBD6HKZIO73SNB643Y7ST3IQSTR7J4B2WUXVCTCJE";

export interface WalletStatus {
  connected: boolean;
  address?: string;
  network?: string;
  error?: string;
}

export interface AccountBalances {
  xlm: string;
  usdc: string;
}

/**
 * Checks if the Freighter extension is installed in the browser.
 */
export async function checkFreighterInstalled(): Promise<boolean> {
  try {
    const result = await isConnected();
    if (typeof result === "boolean") {
      return result;
    }
    return !!(result && result.isConnected);
  } catch (err) {
    console.error("Error checking Freighter connection:", err);
    return false;
  }
}

/**
 * Request access/connect to the Freighter wallet.
 */
export async function connectWallet(): Promise<WalletStatus> {
  const isInstalled = await checkFreighterInstalled();
  if (!isInstalled) {
    return {
      connected: false,
      error: "Freighter wallet extension is not installed."
    };
  }

  try {
    const access = await requestAccess();
    if (access.error) {
      return {
        connected: false,
        error: access.error
      };
    }

    if (!access.address) {
      return {
        connected: false,
        error: "No address returned from Freighter."
      };
    }

    let networkName = "UNKNOWN";
    try {
      const netInfo = await getNetwork();
      if (netInfo && !netInfo.error) {
        networkName = netInfo.network || "TESTNET";
      }
    } catch (e) {
      console.warn("Failed to retrieve network info", e);
    }

    return {
      connected: true,
      address: access.address,
      network: networkName
    };
  } catch (err: any) {
    return {
      connected: false,
      error: err.message || "Failed to connect to Freighter wallet."
    };
  }
}

/**
 * Retrieves the current network selected in Freighter.
 */
export async function getCurrentNetwork(): Promise<string> {
  try {
    const netInfo = await getNetwork();
    if (netInfo && !netInfo.error) {
      return netInfo.network || "TESTNET";
    }
  } catch (e) {
    console.error("Error getting network:", e);
  }
  return "TESTNET";
}

/**
 * Fetch balances (XLM and USDC) for a given public key from Horizon Testnet.
 */
export async function getAccountBalances(publicKey: string): Promise<AccountBalances> {
  try {
    const account = await server.loadAccount(publicKey);
    let xlm = "0.00";
    let usdc = "0.00";

    for (const balance of account.balances) {
      if (balance.asset_type === "native") {
        xlm = parseFloat(balance.balance).toFixed(2);
      } else if (balance.asset_type === "credit_alphanum4" && balance.asset_code === "USDC") {
        usdc = parseFloat(balance.balance).toFixed(2);
      }
    }

    return { xlm, usdc };
  } catch (err: any) {
    if (err.response && err.response.status === 404) {
      return { xlm: "0.00", usdc: "0.00" };
    }
    console.error("Error loading account balances:", err);
    return { xlm: "0.00", usdc: "0.00" };
  }
}

/**
 * Fund a Stellar testnet address using Friendbot.
 */
export async function fundWithFriendbot(address: string): Promise<boolean> {
  try {
    const response = await fetch(`https://friendbot.stellar.org/?addr=${encodeURIComponent(address)}`);
    return response.ok;
  } catch (err) {
    console.error("Friendbot call failed:", err);
    return false;
  }
}

/**
 * Build, simulate/prepare, sign with Freighter, and submit a contract invocation to Stellar Testnet.
 * This calls our deployed verifier contract's verify_and_pay method.
 */
export async function submitPayrollPayment(
  senderAddress: string,
  recipientAddress: string,
  amount: string,
  assetType: "XLM" | "USDC",
  proof: string,
  publicInputs: string[]
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    // 1. Load the sender account sequence number from the network
    const sourceAccount = await server.loadAccount(senderAddress);

    // 2. Resolve token address (SAC contract ID)
    const asset = assetType === "XLM"
      ? Asset.native()
      : new Asset("USDC", USDC_ISSUER);
    const tokenContractId = asset.contractId(Networks.TESTNET);

    // 3. Build smart contract invocation
    const contract = new Contract(SYNC_PAY_ZK_CONTRACT_ID);
    
    // Amount utilizes 7 decimals in Stellar / Soroban
    const amountVal = BigInt(Math.floor(parseFloat(amount) * 10000000));
    
    // Parse proof hex into ScValBytes
    const proofBytes = Buffer.from(proof.replace("0x", ""), "hex");
    
    // Parse public inputs into ScValVector containing ScValBytes
    const parsedPublicInputs = publicInputs.map(pi => 
      xdr.ScVal.scvBytes(Buffer.from(pi.replace("0x", ""), "hex"))
    );

    // contract.call constructs the InvokeHostFunctionOp operation
    const callOp = contract.call(
      "verify_and_pay",
      new Address(tokenContractId).toScVal(),
      new Address(senderAddress).toScVal(),
      new Address(recipientAddress).toScVal(),
      nativeToScVal(amountVal, { type: "i128" }),
      xdr.ScVal.scvBytes(proofBytes),
      xdr.ScVal.scvVec(parsedPublicInputs)
    );

    // 4. Build the initial transaction skeleton
    let tx = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(callOp)
      .setTimeout(300) // 5-minute timeout
      .build();

    // 5. Prepare/simulate the transaction to calculate resource fees and storage footprint
    try {
      tx = await rpcServer.prepareTransaction(tx) as any;
    } catch (prepErr: any) {
      console.error("Soroban transaction preparation failed:", prepErr);
      return {
        success: false,
        error: `Soroban transaction simulation failed: ${prepErr.message || JSON.stringify(prepErr)}`
      };
    }

    const xdrString = tx.toXDR();

    // 6. Request Freighter to sign the transaction XDR package
    const signResult = await signTransaction(xdrString, {
      networkPassphrase: Networks.TESTNET,
      address: senderAddress
    });

    if (signResult.error) {
      return {
        success: false,
        error: signResult.error || "User rejected transaction signing."
      };
    }

    if (!signResult.signedTxXdr) {
      return {
        success: false,
        error: "Freighter did not return a signed transaction XDR."
      };
    }

    // 7. Parse the signed transaction
    const signedTx = TransactionBuilder.fromXDR(signResult.signedTxXdr, Networks.TESTNET);

    // 8. Submit to the Soroban RPC server and poll status
    const sendResponse = await rpcServer.sendTransaction(signedTx);
    
    if (sendResponse.status === "ERROR") {
      return {
        success: false,
        error: `RPC submission failed. Code: ${JSON.stringify(sendResponse.errorResult)}`
      };
    }

    let txStatus: any = sendResponse.status;
    const txHash = sendResponse.hash;
    let attempts = 0;
    
    // Poll for final status
    while (txStatus === "PENDING" && attempts < 15) {
      await new Promise(r => setTimeout(r, 2000));
      const getTxResponse = await rpcServer.getTransaction(txHash) as any;
      txStatus = getTxResponse.status;
      
      if (txStatus === "SUCCESS") {
        return { success: true, txHash };
      } else if (txStatus === "FAILED") {
        let executionError = "Transaction execution failed.";
        if (getTxResponse.resultXdr) {
          executionError += ` Result XDR: ${getTxResponse.resultXdr.toXDR()}`;
        }
        return {
          success: false,
          error: executionError
        };
      }
      attempts++;
    }

    if (txStatus === "SUCCESS") {
      return { success: true, txHash };
    }

    return {
      success: true, // Fallback if polling timed out but transaction is in ledger queue
      txHash
    };
  } catch (err: any) {
    console.error("Soroban contract submission error:", err);
    return {
      success: false,
      error: err.message || JSON.stringify(err)
    };
  }
}
