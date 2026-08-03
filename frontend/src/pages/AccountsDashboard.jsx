import React, { useEffect, useState } from 'react';
import { useVouchers } from '../context/VoucherContext';
import { VoucherCard } from '../components/VoucherCard';
import { Landmark, CheckCircle2 } from 'lucide-react';

export const AccountsDashboard = ({ onSelectVoucher }) => {
  const { vouchers, stats, loading, fetchVouchers, fetchStats } = useVouchers();
  const [activeTab, setActiveTab] = useState('APPROVED');

  useEffect(() => {
    fetchVouchers();
    fetchStats();
  }, [fetchVouchers, fetchStats]);

  const approvedVouchers = vouchers.filter((v) => v.status === 'APPROVED');

  const filteredVouchers = vouchers.filter((v) => {
    if (activeTab === 'APPROVED') return v.status === 'APPROVED';
    if (activeTab === 'PENDING') return v.status === 'PENDING_APPROVAL' || v.status === 'SUBMITTED';
    if (activeTab === 'REJECTED') return v.status === 'REJECTED';
    return true; // ALL
  });

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Landmark size={24} className="text-zinc-300" /> Accounts & Reimbursement Portal
          </h2>
          <p className="text-xs text-zinc-400">Monitor expense claims, audit signatures, and process approved vouchers for payment.</p>
        </div>
        <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 px-4 py-2.5 rounded-xl text-xs shrink-0">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <div>
            <p className="text-[10px] uppercase font-bold text-zinc-400">Ready for Reimbursement</p>
            <p className="text-sm font-bold text-white">{approvedVouchers.length} Approved Claims</p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 text-center p-4 rounded-xl">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Claims</p>
          <p className="text-xl font-bold text-white mt-1">{stats?.total_vouchers || 0}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 text-center p-4 rounded-xl">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Pending</p>
          <p className="text-xl font-bold text-amber-300 mt-1">{stats?.pending || 0}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 text-center p-4 rounded-xl">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Approved</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">{stats?.approved || 0}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 text-center p-4 rounded-xl">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Rejected</p>
          <p className="text-xl font-bold text-rose-400 mt-1">{stats?.rejected || 0}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 text-center p-4 rounded-xl col-span-2 sm:col-span-1">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Approved Expense</p>
          <p className="text-lg font-bold text-emerald-400 mt-1 truncate">
            ₹{parseFloat(stats?.total_approved_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 overflow-x-auto">
        {['APPROVED', 'PENDING', 'REJECTED', 'ALL'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition shrink-0 ${
              activeTab === tab
                ? 'bg-white text-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            {tab === 'APPROVED' ? `Approved Vouchers (${approvedVouchers.length})` : tab}
          </button>
        ))}
      </div>

      {/* Vouchers Grid */}
      {loading ? (
        <div className="text-center py-16 text-zinc-500 text-xs">Loading vouchers...</div>
      ) : filteredVouchers.length === 0 ? (
        <div className="bg-zinc-900 text-center py-16 border border-dashed border-zinc-800 rounded-xl space-y-2">
          <Landmark className="mx-auto text-zinc-600 mb-2" size={32} />
          <p className="text-sm font-bold text-zinc-300">No Vouchers Found</p>
          <p className="text-xs text-zinc-500">No vouchers match the selected tab filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVouchers.map((voucher) => (
            <VoucherCard
              key={voucher.id}
              voucher={voucher}
              userRole="ACCOUNTS"
              onSelect={onSelectVoucher}
            />
          ))}
        </div>
      )}
    </div>
  );
};
