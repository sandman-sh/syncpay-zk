import { useState, useEffect, useCallback } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Dashboard } from "./components/Dashboard";
import type { PayrollItem } from "./components/Dashboard";
import { PayrollModal } from "./components/PayrollModal";
import {
  connectWallet,
  getAccountBalances,
  fundWithFriendbot,
  getCurrentNetwork,
  checkFreighterInstalled
} from "./services/stellar";
import type { AccountBalances } from "./services/stellar";
import { ShieldCheck, Cpu, Code } from "lucide-react";

function App() {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [network, setNetwork] = useState("TESTNET");
  const [balances, setBalances] = useState<AccountBalances>({ xlm: "0.00", usdc: "0.00" });
  const [refreshing, setRefreshing] = useState(false);
  const [funding, setFunding] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  
  const [payrolls, setPayrolls] = useState<PayrollItem[]>(() => {
    const saved = localStorage.getItem("syncpay_zk_payrolls");
    return saved ? JSON.parse(saved) : [];
  });

  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Auto-dismiss notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Sync payrolls to localStorage
  useEffect(() => {
    localStorage.setItem("syncpay_zk_payrolls", JSON.stringify(payrolls));
  }, [payrolls]);

  const showNotification = (message: string, type: "success" | "error" | "info" = "info") => {
    setNotification({ message, type });
  };

  // Fetch balances handler
  const fetchBalances = useCallback(async (address: string) => {
    setRefreshing(true);
    try {
      const result = await getAccountBalances(address);
      setBalances(result);
    } catch (err) {
      console.error("Failed to load balances", err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Connect wallet handler
  const handleConnect = async () => {
    const status = await connectWallet();
    if (status.connected && status.address) {
      setConnected(true);
      setWalletAddress(status.address);
      setNetwork(status.network || "TESTNET");
      showNotification("Freighter Wallet connected successfully!", "success");
      fetchBalances(status.address);
    } else {
      showNotification(status.error || "Failed to connect Freighter Wallet.", "error");
    }
  };

  // Disconnect wallet
  const handleDisconnect = () => {
    setConnected(false);
    setWalletAddress("");
    setBalances({ xlm: "0.00", usdc: "0.00" });
    showNotification("Disconnected from Freighter Wallet.", "info");
  };

  // Quick fund account using Friendbot faucet
  const handleFundFaucet = async () => {
    if (!walletAddress) return;
    setFunding(true);
    showNotification("Requesting testnet funds from Friendbot...", "info");
    const success = await fundWithFriendbot(walletAddress);
    setFunding(false);
    if (success) {
      showNotification("Friendbot transaction complete! 10,000 XLM added.", "success");
      // Refresh balances after funding
      fetchBalances(walletAddress);
    } else {
      showNotification("Friendbot funding failed. The account might already be active.", "error");
    }
  };

  // Verify wallet status on mount
  useEffect(() => {
    const checkConnection = async () => {
      const installed = await checkFreighterInstalled();
      if (installed) {
        const currentNet = await getCurrentNetwork();
        setNetwork(currentNet);
      }
    };
    checkConnection();
  }, []);

  // Handle successful payroll creation
  const handlePayrollSuccess = (newPayroll: {
    alias: string;
    recipient: string;
    amount: string;
    asset: "XLM" | "USDC";
    txHash: string;
  }) => {
    const newItem: PayrollItem = {
      id: (payrolls.length + 1).toString(),
      alias: newPayroll.alias,
      recipient: newPayroll.recipient,
      amount: parseFloat(newPayroll.amount).toFixed(2),
      asset: newPayroll.asset,
      status: "Paid",
      txHash: newPayroll.txHash,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 16)
    };

    setPayrolls((prev) => [newItem, ...prev]);
    showNotification(`Payroll contract settled for ${newPayroll.amount} ${newPayroll.asset}!`, "success");
    
    // Refresh sender balance
    if (walletAddress) {
      setTimeout(() => fetchBalances(walletAddress), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-neo-bg text-black flex flex-col font-inter">
      {/* Navbar component */}
      <Navbar
        connected={connected}
        address={walletAddress}
        network={network}
        balances={balances}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onFund={handleFundFaucet}
        funding={funding}
        onRefresh={() => walletAddress && fetchBalances(walletAddress)}
        refreshing={refreshing}
      />

      {/* Floating Notifications */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`p-4 neo-border-3 neo-shadow-sm font-space font-bold uppercase text-xs flex items-center gap-2 ${
              notification.type === "success"
                ? "bg-neo-green text-black"
                : notification.type === "error"
                ? "bg-neo-terra text-white"
                : "bg-neo-green text-black"
            }`}
          >
            {notification.message}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col">
        {connected ? (
          <Dashboard
            balances={balances}
            payrolls={payrolls}
            onCreateTrigger={() => setModalOpen(true)}
          />
        ) : (
          <Hero onConnect={handleConnect} />
        )}
      </main>

      {/* Modal Flow */}
      <PayrollModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        senderAddress={walletAddress}
        onSuccess={handlePayrollSuccess}
      />

      {/* High-Contrast Stark Footer */}
      <footer className="w-full bg-white border-t-3 border-black py-8 px-6 md:px-12 mt-16 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-black text-white neo-border-2 p-1.5 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-space text-lg font-bold text-black uppercase tracking-tight">
              SyncPay ZK Shield
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono font-bold text-black uppercase">
            <span className="flex items-center gap-1.5 bg-[#F4F4F0] border-2 border-black px-2 py-1">
              <Cpu className="w-3.5 h-3.5 text-neo-blue" />
              UltraHonk Proofs
            </span>
            <span className="flex items-center gap-1.5 bg-[#F4F4F0] border-2 border-black px-2 py-1">
              <Code className="w-3.5 h-3.5 text-neo-green" />
              Soroban v12
            </span>
            <span className="text-gray-500">
              © {new Date().getFullYear()} SyncPay ZK. No Rights Reserved. Open Source.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
