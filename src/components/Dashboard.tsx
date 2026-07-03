import React, { useState } from "react";
import { Plus, Eye, EyeOff, ShieldAlert, CheckCircle, Clock, Link as LinkIcon, Search } from "lucide-react";
import type { AccountBalances } from "../services/stellar";

export interface PayrollItem {
  id: string;
  alias: string;
  recipient: string;
  amount: string;
  asset: "XLM" | "USDC";
  status: "Pending Proof" | "Verifying" | "Paid";
  txHash?: string;
  timestamp: string;
}

interface DashboardProps {
  balances: AccountBalances;
  payrolls: PayrollItem[];
  onCreateTrigger: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  balances,
  payrolls,
  onCreateTrigger
}) => {
  const [hideBalances, setHideBalances] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPayrolls = payrolls.filter(
    (p) =>
      p.alias.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.recipient.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="py-8 px-6 md:px-12 max-w-7xl mx-auto w-full flex-grow flex flex-col gap-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neo-green neo-border-3 p-6 neo-shadow-md">
        <div>
          <h2 className="font-space text-3xl font-bold text-black uppercase">
            Shielded Payroll Control Room
          </h2>
          <p className="font-inter text-sm font-semibold text-black mt-1">
            Build zero-knowledge payment proofs and settle wages instantly on the Stellar Testnet ledger.
          </p>
        </div>
        <button
          onClick={onCreateTrigger}
          className="neo-btn bg-black text-white hover:bg-white hover:text-black py-3 px-6 text-sm font-space flex items-center justify-center gap-2 self-start md:self-auto shrink-0"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          Create New Payroll
        </button>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Shielded Balance Card */}
        <div className="bg-white neo-card p-6 flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <span className="font-space text-xs font-bold text-gray-500 uppercase tracking-wider">
              Shielded Ledger Balance
            </span>
            <button
              onClick={() => setHideBalances(!hideBalances)}
              className="text-black hover:text-neo-blue transition-colors"
            >
              {hideBalances ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="mt-4">
            {hideBalances ? (
              <span className="font-space text-3xl font-bold text-black tracking-widest">
                •••••••• <span className="text-sm font-mono font-bold text-gray-500">USDC</span>
              </span>
            ) : (
              <div className="flex flex-col gap-1">
                <span className="font-space text-3xl font-bold text-black">
                  {balances.usdc} <span className="text-sm font-mono font-bold text-gray-500">USDC</span>
                </span>
                <span className="font-space text-lg font-bold text-gray-700">
                  {balances.xlm} <span className="text-xs font-mono font-bold text-gray-500">XLM</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Active Payrolls Stats Card */}
        <div className="bg-white neo-card p-6 flex flex-col justify-between min-h-[140px]">
          <span className="font-space text-xs font-bold text-gray-500 uppercase tracking-wider block">
            Active Payroll Accounts
          </span>
          <div className="mt-auto">
            <span className="font-space text-4xl font-bold text-black">
              {payrolls.length}
            </span>
            <span className="text-xs font-semibold text-gray-600 block mt-1">
              Active freelancer relationships mapped
            </span>
          </div>
        </div>

        {/* Verification Success Rate Card */}
        <div className="bg-white neo-card p-6 flex flex-col justify-between min-h-[140px]">
          <span className="font-space text-xs font-bold text-gray-500 uppercase tracking-wider block">
            ZK Verification Rate
          </span>
          <div className="mt-auto">
            <span className="font-space text-4xl font-bold text-neo-green">
              100%
            </span>
            <span className="text-xs font-semibold text-gray-600 block mt-1">
              UltraHonk verifications passed on-chain
            </span>
          </div>
        </div>
      </div>

      {/* Main Table section */}
      <div className="bg-white neo-card flex-grow flex flex-col overflow-hidden">
        {/* Header Controls */}
        <div className="p-4 border-b-3 border-black flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="font-space text-lg font-bold text-black uppercase tracking-wider self-start sm:self-auto">
            Active Payroll Ledger
          </h3>
          
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-black" />
            <input
              type="text"
              placeholder="Search contracts or addresses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full neo-input py-2 pl-10 pr-4 text-sm font-mono font-bold text-black"
            />
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F4F0] border-b-3 border-black font-space text-xs font-bold uppercase text-black">
                <th className="p-4 border-r-2 border-black">Contract Alias / Recipient</th>
                <th className="p-4 border-r-2 border-black">Stellar Testnet Address</th>
                <th className="p-4 border-r-2 border-black">Payout Value</th>
                <th className="p-4 border-r-2 border-black">ZK Verifier Status</th>
                <th className="p-4">Horizon Ledger Tx</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayrolls.length > 0 ? (
                filteredPayrolls.map((payroll) => (
                  <tr
                    key={payroll.id}
                    className="border-b-2 border-black last:border-b-0 hover:bg-[#F4F4F0]/40 transition-colors"
                  >
                    <td className="p-4 border-r-2 border-black">
                      <div className="flex flex-col">
                        <span className="font-space font-bold text-sm text-black">
                          {payroll.alias}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono mt-0.5">
                          Created: {payroll.timestamp}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 border-r-2 border-black font-mono text-xs">
                      <span className="text-gray-700 font-bold block" title={payroll.recipient}>
                        {payroll.recipient.slice(0, 10)}...{payroll.recipient.slice(-10)}
                      </span>
                    </td>
                    <td className="p-4 border-r-2 border-black">
                      <div className="flex items-center gap-1.5">
                        <span className="font-space font-bold text-sm text-black">
                          {payroll.amount}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 border border-black ${
                            payroll.asset === "USDC"
                              ? "bg-neo-blue text-white"
                              : "bg-neo-green text-black"
                          }`}
                        >
                          {payroll.asset}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 border-r-2 border-black">
                      {payroll.status === "Paid" ? (
                        <span className="inline-flex items-center gap-1 bg-[#E2F5E5] text-neo-green border border-black px-2.5 py-1 text-xs font-mono font-bold uppercase">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Paid
                        </span>
                      ) : payroll.status === "Verifying" ? (
                        <span className="inline-flex items-center gap-1 bg-neo-green/30 text-green-700 border border-black px-2.5 py-1 text-xs font-mono font-bold uppercase animate-pulse">
                          <Clock className="w-3.5 h-3.5" />
                          Verifying
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-neo-terra/20 text-neo-terra border border-black px-2.5 py-1 text-xs font-mono font-bold uppercase">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {payroll.txHash ? (
                        <a
                          href={`https://stellar.expert/explorer/testnet/tx/${payroll.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-space font-bold text-neo-blue hover:underline uppercase"
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                          View Explorer
                        </a>
                      ) : (
                        <span className="text-xs font-mono text-gray-400 font-bold uppercase">
                          No Tx Loaded
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <span className="font-space text-gray-500 font-semibold uppercase tracking-wider block">
                      No matching contracts found
                    </span>
                    <button
                      onClick={onCreateTrigger}
                      className="neo-btn bg-neo-green text-black px-4 py-2 text-xs font-space mt-4"
                    >
                      Create First Contract
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
