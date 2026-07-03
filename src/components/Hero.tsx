import React from "react";
import {
  ArrowRight,
  ShieldCheck,
  Cpu,
  FileText,
  Terminal,
  Lock,
  HelpCircle,
  CheckCircle2,
  Users
} from "lucide-react";

interface HeroProps {
  onConnect: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onConnect }) => {
  return (
    <div className="w-full flex flex-col gap-16 pb-16">
      {/* 1. Main Hero Area */}
      <div className="flex flex-col lg:flex-row items-stretch justify-between gap-12 py-16 px-6 md:px-12 max-w-7xl mx-auto w-full">
        {/* Text Info Column */}
        <div className="flex-1 flex flex-col justify-center text-left">
          <div className="inline-flex items-center gap-2 bg-neo-green text-black font-mono text-xs font-bold uppercase tracking-widest px-3 py-1.5 neo-border-2 w-fit mb-6">
            <ShieldCheck className="w-4 h-4 text-black" />
            Stellar Testnet Enabled
          </div>

          <h1 className="font-space text-5xl md:text-7xl font-bold tracking-tight text-black leading-[1.05] mb-6">
            Shielded Payroll <br />
            <span className="text-neo-blue bg-white px-2 neo-border-3 inline-block transform -rotate-1 py-1 mt-2 neo-shadow-sm">
              for Web3 Teams
            </span>
          </h1>

          <p className="font-inter text-lg md:text-xl font-medium text-gray-700 max-w-xl leading-relaxed mb-8">
            SyncPay ZK utilizes Zero-Knowledge proofs to verify and settle freelancer contracts on the Stellar network. Verify payments securely without revealing proprietary transaction amounts to the public ledger.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <button
              onClick={onConnect}
              className="neo-btn bg-black text-white hover:bg-neo-green hover:text-black py-4 px-8 text-lg font-space flex items-center justify-center gap-3 group"
            >
              Launch SyncPay ZK
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            
            <a
              href="https://noir-lang.org/docs/"
              target="_blank"
              rel="noreferrer"
              className="neo-btn bg-white text-black hover:bg-gray-100 py-4 px-8 text-lg font-space flex items-center justify-center gap-2"
            >
              Read Noir Docs
            </a>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
            <div className="p-4 bg-white neo-border-2 neo-shadow-sm flex gap-3">
              <div className="w-8 h-8 rounded-none bg-neo-blue flex items-center justify-center neo-border-2 shrink-0">
                <Cpu className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-space font-bold text-black uppercase text-sm">UltraHonk Noir Proofs</h4>
                <p className="text-xs text-gray-600 font-semibold mt-1">Simulated client-side proof construction ensures payment details remain local.</p>
              </div>
            </div>

            <div className="p-4 bg-white neo-border-2 neo-shadow-sm flex gap-3">
              <div className="w-8 h-8 rounded-none bg-neo-green flex items-center justify-center neo-border-2 shrink-0">
                <ShieldCheck className="w-4 h-4 text-black" />
              </div>
              <div>
                <h4 className="font-space font-bold text-black uppercase text-sm">Soroban Integration</h4>
                <p className="text-xs text-gray-600 font-semibold mt-1">Smart contracts verify proof payloads before releasing public assets on-chain.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Component Column */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md bg-white neo-card p-6 relative neo-shadow-lg transform rotate-1">
            {/* Top colored tabs */}
            <div className="absolute top-[-15px] left-8 flex gap-2">
              <span className="neo-border-2 bg-neo-terra text-white px-2 py-0.5 text-xs font-mono font-bold uppercase shadow-sm">
                noir
              </span>
              <span className="neo-border-2 bg-neo-blue text-white px-2 py-0.5 text-xs font-mono font-bold uppercase shadow-sm">
                soroban
              </span>
            </div>

            <div className="border-b-2 border-black pb-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs font-bold text-gray-500">PAYROLL SCHEDULER</span>
                <span className="h-3 w-3 rounded-full bg-neo-green neo-border-2 animate-pulse"></span>
              </div>
              <h3 className="font-space text-2xl font-bold mt-2 text-black">Shielded Verification</h3>
            </div>

            {/* Simple UI Mockup representing Shielded Payment concept */}
            <div className="space-y-4 font-mono text-xs">
              <div className="neo-border-2 bg-[#F4F4F0] p-3 flex flex-col gap-1">
                <span className="text-gray-500 font-bold">RECIPIENT (FREELANCER)</span>
                <span className="font-bold text-black truncate">GD6X...5F2N (Alias: Senior Developer)</span>
              </div>

              <div className="neo-border-2 bg-[#F4F4F0] p-3 flex justify-between items-center">
                <div>
                  <span className="text-gray-500 block font-bold">SHIELDED AMOUNT</span>
                  <span className="font-bold text-black text-sm">1,500.00 USDC</span>
                </div>
                <span className="bg-black text-white px-2 py-1 text-[10px] font-bold">
                  🔒 OBFUSCATED
                </span>
              </div>

              {/* ZK Proof generation visual status */}
              <div className="bg-black text-green-400 p-4 neo-border-2 font-mono h-40 overflow-hidden leading-tight flex flex-col text-[10px]">
                <div>$ nargo compile --package syncpay_zk</div>
                <div className="text-yellow-400">Compiling circuit main.nr...</div>
                <div>Circuit successfully compiled.</div>
                <div>$ honk prove -w witness.gz</div>
                <div className="text-blue-400">Generating proof using UltraHonk backend...</div>
                <div className="text-neo-green font-bold">Proof successfully generated!</div>
                <div className="text-white mt-1 border-t border-gray-700 pt-1">
                  Proof Hex: 0x8a92b21c...f8c12a
                </div>
              </div>

              <div className="bg-neo-green p-3 neo-border-2 flex justify-between items-center text-black font-space font-bold uppercase tracking-wider text-[11px]">
                <span>Verifier Contract Code</span>
                <span className="bg-white text-black px-1.5 py-0.5 border border-black font-mono text-[9px]">
                  rs-soroban-ultrahonk
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Visual Workflow "How it Works" */}
      <section className="bg-white border-y-3 border-black py-16 px-6 md:px-12 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex bg-neo-blue text-white font-mono text-xs font-bold uppercase tracking-widest px-3 py-1.5 neo-border-2 mb-4">
              Step-By-Step Workflow
            </span>
            <h2 className="font-space text-4xl md:text-5xl font-bold uppercase text-black">
              How Zero-Knowledge Payroll Works
            </h2>
            <p className="font-inter text-md font-semibold text-gray-600 mt-2">
              Learn how we shield payment details on-chain while keeping settlements mathematically verifiable.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-[#F4F4F0] neo-card p-6 flex flex-col justify-between min-h-[250px] relative">
              <span className="absolute top-4 right-4 font-space text-4xl font-black text-black/10">01</span>
              <div>
                <div className="w-12 h-12 bg-neo-green neo-border-2 flex items-center justify-center mb-6">
                  <FileText className="w-6 h-6 text-black stroke-[2]" />
                </div>
                <h3 className="font-space text-xl font-bold uppercase text-black mb-3">
                  1. Setup Details
                </h3>
                <p className="font-inter text-xs text-gray-700 font-medium leading-relaxed">
                  Enter the freelancer's public address, select the payout asset (XLM or USDC), and input the salary amount. These inputs remain in your browser memory and are never exposed.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#F4F4F0] neo-card p-6 flex flex-col justify-between min-h-[250px] relative">
              <span className="absolute top-4 right-4 font-space text-4xl font-black text-black/10">02</span>
              <div>
                <div className="w-12 h-12 bg-neo-blue text-white neo-border-2 flex items-center justify-center mb-6">
                  <Terminal className="w-6 h-6 text-white stroke-[2]" />
                </div>
                <h3 className="font-space text-xl font-bold uppercase text-black mb-3">
                  2. Compile Noir Proof
                </h3>
                <p className="font-inter text-xs text-gray-700 font-medium leading-relaxed">
                  The client-side Noir compiler creates a zero-knowledge math proof package. This proves that you have authorized the payment parameter hashes without displaying the raw payment details.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#F4F4F0] neo-card p-6 flex flex-col justify-between min-h-[250px] relative">
              <span className="absolute top-4 right-4 font-space text-4xl font-black text-black/10">03</span>
              <div>
                <div className="w-12 h-12 bg-neo-terra text-white neo-border-2 flex items-center justify-center mb-6">
                  <Lock className="w-6 h-6 text-white stroke-[2]" />
                </div>
                <h3 className="font-space text-xl font-bold uppercase text-black mb-3">
                  3. Soroban Settle
                </h3>
                <p className="font-inter text-xs text-gray-700 font-medium leading-relaxed">
                  Submit the proof package via Freighter wallet. The Soroban smart contract verifies the ZK math commitment and triggers the asset transfer on-chain, keeping the amount fully shielded.
                </p>
              </div>
            </div>
          </div>

          {/* Simple ASCII Flowchart */}
          <div className="mt-12 p-6 bg-black text-neo-green neo-border-2 font-mono text-center overflow-x-auto text-[11px] leading-relaxed shadow-sm">
            <div className="whitespace-nowrap">
              [ Employer Details ] ──( Noir Browser Prover )──&gt; [ ZK Proof Payload ]
            </div>
            <div className="my-2 text-white">▼</div>
            <div className="whitespace-nowrap text-white">
              [ Freighter Wallet Signs ] ──( Soroban Smart Contract ) ──&gt; [ Shields Amount + Settles Freelancer Wallet ]
            </div>
          </div>
        </div>
      </section>

      {/* 3. FAQ Section */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex bg-neo-terra text-white font-mono text-xs font-bold uppercase tracking-widest px-3 py-1.5 neo-border-2 mb-4">
            Common Questions
          </span>
          <h2 className="font-space text-3xl md:text-4xl font-bold uppercase text-black">
            Understand the Shielded Ledger
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 neo-card flex gap-4">
            <div className="w-8 h-8 bg-[#EBF3FF] text-neo-blue neo-border-2 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-space text-md font-bold uppercase text-black">
                Why shield freelancer payroll?
              </h4>
              <p className="font-inter text-xs text-gray-600 font-medium leading-relaxed mt-2">
                Public blockchain ledgers expose employee salaries and contractor wages, which compromises competitive hiring advantages and individual financial privacy. Shielded payroll secures transactions while remaining auditable on-ledger.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 neo-card flex gap-4">
            <div className="w-8 h-8 bg-[#EAF7ED] text-neo-green neo-border-2 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-space text-md font-bold uppercase text-black">
                Do I need to install Noir CLI tools?
              </h4>
              <p className="font-inter text-xs text-gray-600 font-medium leading-relaxed mt-2">
                No. All compiler runs and witness constructions are completely simulated and executed in the background inside your web browser. You only need the standard Freighter browser extension.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 neo-card flex gap-4">
            <div className="w-8 h-8 bg-[#FFF9E6] text-yellow-700 neo-border-2 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-space text-md font-bold uppercase text-black">
                Is this audit-compliant?
              </h4>
              <p className="font-inter text-xs text-gray-600 font-medium leading-relaxed mt-2">
                Yes. Although payment values are obfuscated, public inputs contain hash commitments of the transaction details. Employers can verify execution receipts and prove compliance to tax authorities with local verification parameters.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 neo-card flex gap-4">
            <div className="w-8 h-8 bg-[#FFF2F2] text-neo-terra neo-border-2 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-space text-md font-bold uppercase text-black">
                Which token assets are supported?
              </h4>
              <p className="font-inter text-xs text-gray-600 font-medium leading-relaxed mt-2">
                The smart contract is written to interact with the standard Stellar Asset Contract (SAC). It natively supports native XLM and tokenized USDC on the Stellar Testnet ledger.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
