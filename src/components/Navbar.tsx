import React from "react";
import { Shield, Wallet, RefreshCw, Sparkles } from "lucide-react";
import type { AccountBalances } from "../services/stellar";

interface NavbarProps {
  connected: boolean;
  address?: string;
  network?: string;
  balances: AccountBalances;
  onConnect: () => void;
  onDisconnect: () => void;
  onFund: () => void;
  funding: boolean;
  onRefresh: () => void;
  refreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  connected,
  address,
  network,
  balances,
  onConnect,
  onDisconnect,
  onFund,
  funding,
  onRefresh,
  refreshing
}) => {
  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-6)}`
    : "";

  return (
    <nav className="sticky top-0 z-50 w-full bg-white neo-border-3 border-t-0 border-x-0 py-4 px-6 md:px-12 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-3">
        <div className="bg-neo-green neo-border-2 p-2 rounded-none flex items-center justify-center">
          <Shield className="w-6 h-6 text-black stroke-[2.5]" />
        </div>
        <div className="flex flex-col">
          <span className="font-space text-2xl font-bold tracking-tight text-black leading-none flex items-center gap-1.5">
            SyncPay <span className="bg-black text-white px-1.5 py-0.5 text-xs font-mono font-bold tracking-widest uppercase">ZK</span>
          </span>
          <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-gray-500 mt-1">
            Shielded Stellar Payroll
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {connected && (
          <div className="hidden lg:flex items-center gap-6 mr-2 font-mono text-sm font-bold bg-white neo-border-2 px-4 py-2 neo-shadow-sm">
            <div className="flex items-center gap-1.5 border-r-2 border-black pr-4">
              <span className="w-2.5 h-2.5 rounded-full bg-neo-green neo-border-2"></span>
              <span className="uppercase text-xs">{network || "TESTNET"}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-600">BAL:</span>
              <span className="text-black flex items-center gap-1">
                {balances.xlm} <span className="text-[10px] px-1 bg-neo-green text-black font-semibold">XLM</span>
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-black flex items-center gap-1">
                {balances.usdc} <span className="text-[10px] px-1 bg-neo-blue text-white font-semibold">USDC</span>
              </span>
            </div>
            <button
              onClick={onRefresh}
              disabled={refreshing}
              title="Refresh balances"
              className="hover:text-neo-blue active:scale-95 transition-transform"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        )}

        {connected ? (
          <div className="flex items-center gap-3">
            {/* Quick Friendbot faucet button */}
            <button
              onClick={onFund}
              disabled={funding}
              className="neo-btn bg-neo-terra text-white text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {funding ? "FUNDING..." : " faucet"}
            </button>

            <div className="flex items-center gap-2 neo-border-2 bg-[#F4F4F0] pl-3 pr-1 py-1 text-sm font-mono font-bold">
              <span className="text-black">{truncatedAddress}</span>
              <button
                onClick={onDisconnect}
                className="bg-black hover:bg-red-600 text-white hover:text-white text-xs px-2.5 py-1 transition-colors uppercase font-sans font-bold"
              >
                Exit
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onConnect}
            className="neo-btn bg-neo-green text-black py-2.5 px-6 flex items-center gap-2 font-space uppercase"
          >
            <Wallet className="w-4 h-4 stroke-[2.5]" />
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
};
