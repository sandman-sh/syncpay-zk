import React, { useState, useEffect, useRef } from "react";
import { X, ArrowRight, ArrowLeft, Terminal, ShieldCheck, CheckCircle2, AlertTriangle } from "lucide-react";
import { generateNoirZKProof } from "../services/sorobanService";
import type { ZKProofResult } from "../services/sorobanService";
import { submitPayrollPayment } from "../services/stellar";
import { USDC_ISSUER } from "../services/stellar";

interface PayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  senderAddress: string;
  onSuccess: (newPayroll: {
    alias: string;
    recipient: string;
    amount: string;
    asset: "XLM" | "USDC";
    txHash: string;
  }) => void;
}

type Step = 1 | 2 | 3;

export const PayrollModal: React.FC<PayrollModalProps> = ({
  isOpen,
  onClose,
  senderAddress,
  onSuccess
}) => {
  const [step, setStep] = useState<Step>(1);
  const [alias, setAlias] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [asset, setAsset] = useState<"XLM" | "USDC">("XLM");

  // Step 2 State (ZK Proof)
  const [logs, setLogs] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [zkResult, setZkResult] = useState<ZKProofResult | null>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Step 3 State (Submission)
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successTxHash, setSuccessTxHash] = useState("");

  // Auto-scroll terminal logs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  if (!isOpen) return null;

  // Step 1 Validation
  const isStep1Valid =
    alias.trim().length > 0 &&
    recipient.startsWith("G") &&
    recipient.length === 56 &&
    parseFloat(amount) > 0;

  // Start Step 2 Proof Generation
  const handleStartZKProof = async () => {
    setStep(2);
    setLogs([]);
    setGenerating(true);
    try {
      const result = await generateNoirZKProof(
        senderAddress,
        recipient,
        amount,
        (log) => {
          setLogs((prev) => [...prev, log]);
        }
      );
      setZkResult(result);
    } catch (e) {
      setLogs((prev) => [...prev, `\n[ERROR] Proof generation failed!`]);
    } finally {
      setGenerating(false);
    }
  };

  // Step 3: Stellar network submission
  const handleSubmitPayment = async () => {
    setSubmitting(true);
    setErrorMsg("");
    try {
      if (!zkResult) {
        setErrorMsg("Zero-Knowledge proof has not been generated.");
        setSubmitting(false);
        return;
      }

      const result = await submitPayrollPayment(
        senderAddress,
        recipient,
        amount,
        asset,
        zkResult.proof,
        zkResult.publicInputs
      );

      if (result.success && result.txHash) {
        setSuccessTxHash(result.txHash);
        onSuccess({
          alias,
          recipient,
          amount,
          asset,
          txHash: result.txHash
        });
      } else {
        setErrorMsg(result.error || "Transaction submission failed.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset all states
    setStep(1);
    setAlias("");
    setRecipient("");
    setAmount("");
    setAsset("XLM");
    setLogs([]);
    setZkResult(null);
    setSuccessTxHash("");
    setErrorMsg("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-2xl bg-white neo-card flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-3 border-black p-4 bg-neo-green">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-black" />
            <h3 className="font-space text-lg font-bold text-black uppercase tracking-wider">
              Shielded Payroll Wizard
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Wizard Steps indicator */}
        <div className="grid grid-cols-3 border-b-3 border-black font-space text-xs font-bold text-center bg-[#F4F4F0]">
          <div className={`p-3 border-r-2 border-black ${step === 1 ? "bg-black text-white" : "text-black"}`}>
            1. CONTRACT DETAILS
          </div>
          <div className={`p-3 border-r-2 border-black ${step === 2 ? "bg-black text-white" : "text-black"}`}>
            2. ZK PROOF
          </div>
          <div className={`p-3 ${step === 3 ? "bg-black text-white" : "text-black"}`}>
            3. SETTLE
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block font-space text-sm font-bold text-black uppercase mb-1.5">
                  Contract / Payout Alias
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Frontend Dev - June Deliverables"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  className="w-full neo-input p-3 font-semibold text-black"
                />
              </div>

              <div>
                <label className="block font-space text-sm font-bold text-black uppercase mb-1.5 flex justify-between">
                  <span>Recipient Stellar Testnet Address</span>
                  <span className="text-[10px] text-gray-500 font-mono font-bold lowercase">
                    Must be 56 characters, starts with G
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. GBCK5R6XG..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full neo-input p-3 font-mono text-xs font-bold text-black"
                />
                {recipient.length > 0 && (recipient.length !== 56 || !recipient.startsWith("G")) && (
                  <p className="text-xs text-neo-terra font-semibold mt-1">
                    Invalid Stellar address format (56 chars, starting with 'G').
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-space text-sm font-bold text-black uppercase mb-1.5">
                    Asset Type
                  </label>
                  <select
                    value={asset}
                    onChange={(e) => setAsset(e.target.value as "XLM" | "USDC")}
                    className="w-full neo-input p-3 font-space font-bold text-black appearance-none bg-white cursor-pointer"
                  >
                    <option value="XLM">XLM (Native Stellar)</option>
                    <option value="USDC">USDC (Testnet Stablecoin)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-space text-sm font-bold text-black uppercase mb-1.5">
                    Payment Amount
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full neo-input p-3 font-mono font-bold text-black"
                  />
                </div>
              </div>

              {asset === "USDC" && (
                <div className="p-3 bg-[#EBF3FF] border-2 border-black flex flex-col gap-1 text-[11px] font-mono font-semibold text-black mt-2">
                  <span className="text-neo-blue uppercase font-bold">Stellar Testnet USDC Asset Details:</span>
                  <span className="truncate">Issuer: {USDC_ISSUER}</span>
                  <span>Code: USDC</span>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-[#F4F4F0] p-3 neo-border-2">
                <span className="font-space text-sm font-bold text-black">
                  Zero-Knowledge Proof Terminal (UltraHonk Backend)
                </span>
                <span className="h-2 w-2 rounded-full bg-neo-green animate-pulse neo-border-2"></span>
              </div>

              {/* Terminal Logs View */}
              <div className="bg-black text-green-400 p-4 neo-border-2 h-72 overflow-y-auto font-mono text-xs leading-5">
                {logs.map((log, i) => (
                  <div key={i} className="whitespace-pre-wrap">
                    {log}
                  </div>
                ))}
                {generating && (
                  <span className="inline-block h-4 w-2 bg-green-400 animate-blink ml-1"></span>
                )}
                <div ref={terminalEndRef} />
              </div>

              {!generating && zkResult && (
                <div className="p-4 bg-[#EAF7ED] border-2 border-black text-neo-green font-space font-bold uppercase text-xs flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-neo-green shrink-0" />
                  ZK Proof successfully generated & verified locally!
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              {successTxHash ? (
                // Success State View
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-[#EAF7ED] neo-border-3 text-neo-green flex items-center justify-center mx-auto neo-shadow-sm">
                    <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                  </div>
                  <h4 className="font-space text-2xl font-bold text-black uppercase">
                    Payroll Settled On-Chain
                  </h4>
                  <p className="font-inter text-sm font-semibold text-gray-700 max-w-md mx-auto">
                    The payment was successfully verified with the ZK proof and committed to the Stellar Testnet ledger.
                  </p>

                  <div className="bg-[#F4F4F0] p-4 neo-border-2 font-mono text-xs text-left space-y-2 max-w-lg mx-auto">
                    <div>
                      <span className="text-gray-500 font-bold">CONTRACT: </span>
                      <span className="font-bold text-black">{alias}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold">RECIPIENT: </span>
                      <span className="font-bold text-black">{recipient}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold">SETTLEMENT: </span>
                      <span className="font-bold text-black">
                        {amount} {asset}
                      </span>
                    </div>
                    <div className="border-t border-black/10 pt-2">
                      <span className="text-gray-500 font-bold block">TRANSACTION HASH:</span>
                      <span className="font-bold text-neo-blue select-all break-all">{successTxHash}</span>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${successTxHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="neo-btn bg-neo-blue text-white py-2.5 px-6 font-space text-sm"
                    >
                      View Explorer
                    </a>
                    <button
                      onClick={handleClose}
                      className="neo-btn bg-black text-white py-2.5 px-6 font-space text-sm"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                // Sign and Submit State View
                <div className="space-y-4">
                  <div className="p-4 bg-[#FFF9E6] border-2 border-black text-black text-xs font-mono font-semibold space-y-1.5">
                    <div className="flex items-center gap-1 text-yellow-700 uppercase font-bold">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      Awaiting Signature
                    </div>
                    <p>
                      Freighter browser wallet will prompt you to authorize and sign the transaction XDR package. Make sure Freighter is active and connected to the Stellar Testnet.
                    </p>
                  </div>

                  <div className="border-2 border-black divide-y-2 divide-black">
                    <div className="p-3 bg-[#F4F4F0] flex justify-between font-mono text-xs font-bold text-black">
                      <span>CONTRACT ALIAS</span>
                      <span>{alias}</span>
                    </div>
                    <div className="p-3 bg-[#F4F4F0] flex justify-between font-mono text-xs font-bold text-black">
                      <span>RECIPIENT ADDRESS</span>
                      <span className="truncate w-1/2 text-right" title={recipient}>
                        {recipient}
                      </span>
                    </div>
                    <div className="p-3 bg-[#F4F4F0] flex justify-between font-mono text-xs font-bold text-black">
                      <span>SETTLEMENT VALUE</span>
                      <span>
                        {amount} {asset}
                      </span>
                    </div>
                    <div className="p-3 bg-[#F4F4F0] flex justify-between font-mono text-xs font-bold text-black">
                      <span>ZK PROOF SIZE</span>
                      <span>512 BYTES (ULTRAHONK)</span>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-4 bg-[#FDF2F2] border-2 border-red-600 text-red-600 text-xs font-mono font-semibold">
                      <span className="uppercase font-bold block mb-1">Execution Failure:</span>
                      {errorMsg}
                    </div>
                  )}

                  <div className="flex gap-4 justify-end pt-4">
                    <button
                      onClick={() => setStep(2)}
                      disabled={submitting}
                      className="neo-btn bg-white text-black py-3 px-6 font-space text-sm flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Proof
                    </button>
                    <button
                      onClick={handleSubmitPayment}
                      disabled={submitting}
                      className="neo-btn bg-neo-green text-black hover:bg-black hover:text-white py-3 px-8 font-space text-sm uppercase tracking-wide flex items-center justify-center gap-2 grow md:grow-0"
                    >
                      {submitting ? "signing/submitting..." : "Submit Proof & Settle"}
                      {!submitting && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls (Only for non-success states) */}
        {!successTxHash && (
          <div className="border-t-3 border-black p-4 bg-[#F4F4F0] flex justify-between">
            {step === 1 && (
              <>
                <button
                  onClick={handleClose}
                  className="neo-btn bg-white text-black py-2.5 px-5 text-xs font-space"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartZKProof}
                  disabled={!isStep1Valid}
                  className={`neo-btn py-2.5 px-6 text-xs font-space flex items-center gap-1.5 ${
                    isStep1Valid
                      ? "bg-neo-green text-black"
                      : "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed shadow-none hover:translate-0"
                  }`}
                >
                  Generate ZK Proof
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <button
                  onClick={() => setStep(1)}
                  disabled={generating}
                  className="neo-btn bg-white text-black py-2.5 px-5 text-xs font-space"
                >
                  Details
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={generating || !zkResult}
                  className={`neo-btn py-2.5 px-6 text-xs font-space flex items-center gap-1.5 ${
                    !generating && zkResult
                      ? "bg-neo-blue text-white"
                      : "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed shadow-none hover:translate-0"
                  }`}
                >
                  Proceed to Settlement
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
