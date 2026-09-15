import React, { useState } from "react";
import { 
  Wallet, 
  Utensils, 
  History, 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard,
  CheckCircle2,
  Clock,
  Ban,
  Search,
  Filter,
  Ticket
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { format, addDays } from "date-fns";

const mockWallet = {
  deposit: 2880,
  withdrawn: 2800,
  balance: 80
};

const mockMenu = [
  { id: 1, type: "Lunch", desc: "Rice, Chicken/Fish/Egg, Vorta, Daul.", startTime: "01:00 PM", endTime: "03:00 PM", price: 40, available: true },
  { id: 2, type: "Dinner", desc: "Rice, Chicken/Fish/Egg, Vorta, Daul.", startTime: "08:00 PM", endTime: "10:30 PM", price: 40, available: true }
];

const mockRecords = [
  { id: 1, type: "Lunch", price: 40, borderType: "Non Residential Border", date: new Date(), status: "used", usedAt: "22:52" },
  { id: 2, type: "Lunch", price: 40, borderType: "Non Residential Border", date: addDays(new Date(), -1), status: "active", usedAt: null },
  { id: 3, type: "Dinner", price: 40, borderType: "Non Residential Border", date: addDays(new Date(), -2), status: "expired", usedAt: null },
];

export function DiningDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("purchase");
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = (type) => {
    setPurchasing(true);
    setTimeout(() => {
      setPurchasing(false);
      alert(`Successfully purchased ${type} token!`);
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shadow-sm">
            <Utensils className="w-5 h-5" />
          </div>
          Dining Tokens
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Manage your hall food tokens and digital wallet.
        </p>
      </div>

      {/* Wallet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ArrowDownRight className="w-24 h-24 text-emerald-600" />
          </div>
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-full bg-emerald-200/50 dark:bg-emerald-900/50 flex items-center justify-center mb-4">
              <ArrowDownRight className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">Total Deposit</p>
            <h3 className="text-3xl font-black text-emerald-900 dark:text-emerald-100">{mockWallet.deposit} <span className="text-lg font-bold text-emerald-600/50">Nos.</span></h3>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/40 dark:to-red-950/40 border border-rose-100 dark:border-rose-900/50 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ArrowUpRight className="w-24 h-24 text-rose-600" />
          </div>
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-full bg-rose-200/50 dark:bg-rose-900/50 flex items-center justify-center mb-4">
              <ArrowUpRight className="w-5 h-5 text-rose-700 dark:text-rose-400" />
            </div>
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-1">Total Withdrawn</p>
            <h3 className="text-3xl font-black text-rose-900 dark:text-rose-100">{mockWallet.withdrawn} <span className="text-lg font-bold text-rose-600/50">Nos.</span></h3>
          </div>
        </div>

        <div className="bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-950/40 dark:to-indigo-950/40 border border-sky-100 dark:border-sky-900/50 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="w-24 h-24 text-sky-600" />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-sky-200/50 dark:bg-sky-900/50 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-sky-700 dark:text-sky-400" />
              </div>
              <button className="text-xs font-bold px-3 py-1.5 bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 rounded-full shadow-sm hover:shadow transition-all flex items-center gap-1.5 border border-sky-100 dark:border-slate-700">
                <CreditCard className="w-3.5 h-3.5" />
                Top Up
              </button>
            </div>
            <p className="text-sm font-semibold text-sky-700 dark:text-sky-400 uppercase tracking-wider mb-1">Current Balance</p>
            <h3 className="text-3xl font-black text-sky-900 dark:text-sky-100">{mockWallet.balance} <span className="text-lg font-bold text-sky-600/50">Nos.</span></h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#020617]">
          <button 
            onClick={() => setActiveTab("purchase")}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === "purchase" ? "bg-white dark:bg-[#0f172a] text-sky-600 dark:text-sky-400 border-b-2 border-sky-500" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900/50"}`}
          >
            <Ticket className="w-4 h-4" />
            Purchase Coupons
          </button>
          <button 
            onClick={() => setActiveTab("records")}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === "records" ? "bg-white dark:bg-[#0f172a] text-sky-600 dark:text-sky-400 border-b-2 border-sky-500" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900/50"}`}
          >
            <History className="w-4 h-4" />
            My Coupon Records
          </button>
        </div>

        <div className="p-6">
          {activeTab === "purchase" ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Available Menu</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Select and purchase dining coupons for upcoming days.</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                  <button className="px-4 py-1.5 text-xs font-bold rounded-md bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm">Today</button>
                  <button className="px-4 py-1.5 text-xs font-bold rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white">Tomorrow</button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {mockMenu.map((m) => (
                  <div key={m.id} className="border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:border-sky-300 dark:hover:border-sky-500/50 transition-all flex flex-col justify-between bg-slate-50/50 dark:bg-slate-900/20">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${m.type === "Lunch" ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400" : "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"}`}>
                          <Utensils className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{m.type}</h4>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                            <Clock className="w-3.5 h-3.5" />
                            {m.startTime} - {m.endTime}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-slate-800 dark:text-slate-100">?{m.price}</span>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50 mb-4">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{m.desc}</p>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handlePurchase(m.type)}
                        disabled={purchasing}
                        className="flex-1 bg-sky-600 hover:bg-sky-700 text-white py-2.5 rounded-xl font-bold text-sm shadow-sm transition-colors disabled:opacity-50"
                      >
                        {purchasing ? "Processing..." : "Cut Token @ ?40"}
                      </button>
                      <button className="flex-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl font-bold text-sm transition-colors">
                        Guest @ ?45
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search records..." 
                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <Filter className="w-4 h-4" />
                  Filter Status
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700/50">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-bold text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
                    {mockRecords.map((r, i) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">#{1000 + i}</td>
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{r.type}</td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{format(r.date, "dd MMM, yyyy")}</td>
                        <td className="px-4 py-3 text-center">
                          {r.status === "used" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> Used</span>}
                          {r.status === "active" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 text-xs font-bold"><Ticket className="w-3.5 h-3.5" /> Active</span>}
                          {r.status === "expired" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold"><Ban className="w-3.5 h-3.5" /> Expired</span>}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-700 dark:text-slate-300">?{r.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

