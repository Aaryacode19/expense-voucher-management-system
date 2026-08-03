import React, { useEffect, useState } from 'react';
import { useVouchers } from '../context/VoucherContext';
import { VoucherCard } from '../components/VoucherCard';
import { ShieldCheck, Clock } from 'lucide-react';

export const DirectorDashboard = ({ onSelectVoucher, onOpenApproveModal, onOpenRejectModal }) => {
  const { vouchers, stats, loading, fetchVouchers, fetchStats } = useVouchers();
  const [activeTab, setActiveTab] = useState('PENDING');

  useEffect(() => {
    fetchVouchers();
    fetchStats();
  }, [fetchVouchers, fetchStats]);

  const pendingVouchers = vouchers.filter(
    (v) => v.status === 'PENDING_APPROVAL' || v.status === 'SUBMITTED'
  );

  const filteredVouchers = vouchers.filter((v) => {
    if (activeTab === 'PENDING') return v.status === 'PENDING_APPROVAL' || v.status === 'SUBMITTED';
    if (activeTab === 'APPROVED') return v.status === 'APPROVED';
    if (activeTab === 'REJECTED') return v.status === 'REJECTED';
    return true; // ALL
  });

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck size={24} className="text-zinc-300" /> Director Approval Hub
          </h2>
          <p className="text-xs text-zinc-400">Review pending employee expense vouchers, sign approvals, or reject with remarks.</p>
        </div>
        <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 px-4 py-2.5 rounded-xl text-xs shrink-0">
          <Clock size={18} className="text-amber-300 shrink-0" />
          <div>
            <p className="text-[10px] uppercase font-bold text-zinc-400">Pending Review</p>
            <p className="text-sm font-bold text-white">{pendingVouchers.length} Vouchers Awaiting Action</p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 text-center p-5 rounded-xl">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Pending Approvals</p>
          <p className="text-2xl font-bold text-amber-300 mt-1">{stats?.pending_approval_count || 0}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 text-center p-5 rounded-xl">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Pending Amount</p>
          <p className="text-xl font-bold text-white mt-1">
            ₹{parseFloat(stats?.total_pending_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 text-center p-5 rounded-xl">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Approved Today</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{stats?.approved_today || 0}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 text-center p-5 rounded-xl">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Rejected Today</p>
          <p className="text-2xl font-bold text-rose-400 mt-1">{stats?.rejected_today || 0}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition shrink-0 ${
                activeTab === tab
                  ? 'bg-white text-black'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {tab === 'PENDING' ? `Pending Queue (${pendingVouchers.length})` : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Vouchers Grid */}
      {loading ? (
        <div className="text-center py-16 text-zinc-500 text-xs">Loading vouchers...</div>
      ) : filteredVouchers.length === 0 ? (
        <div className="bg-zinc-900 text-center py-16 border border-dashed border-zinc-800 rounded-xl space-y-2">
          <ShieldCheck className="mx-auto text-zinc-600 mb-2" size={32} />
          <p className="text-sm font-bold text-zinc-300">No Vouchers in this Queue</p>
          <p className="text-xs text-zinc-500">All employee expense requests in this category have been processed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVouchers.map((voucher) => (
            <VoucherCard
              key={voucher.id}
              voucher={voucher}
              userRole="DIRECTOR"
              onSelect={onSelectVoucher}
              onApprove={() => onOpenApproveModal(voucher)}
              onReject={() => onOpenRejectModal(voucher)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
