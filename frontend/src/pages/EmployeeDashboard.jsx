import React, { useEffect, useState } from 'react';
import { useVouchers } from '../context/VoucherContext';
import { VoucherCard } from '../components/VoucherCard';
import { Plus, FileText } from 'lucide-react';

export const EmployeeDashboard = ({ onOpenCreateModal, onSelectVoucher, onEditVoucher }) => {
  const { vouchers, stats, loading, fetchVouchers, fetchStats, deleteVoucher } = useVouchers();
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    fetchVouchers();
    fetchStats();
  }, [fetchVouchers, fetchStats]);

  const filteredVouchers = vouchers.filter((v) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'DRAFT') return v.status === 'DRAFT';
    if (activeTab === 'PENDING') return v.status === 'PENDING_APPROVAL' || v.status === 'SUBMITTED';
    if (activeTab === 'APPROVED') return v.status === 'APPROVED';
    if (activeTab === 'REJECTED') return v.status === 'REJECTED';
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white tracking-tight">Employee Portal</h2>
          <p className="text-xs text-zinc-400">Create reimbursement vouchers, manage saved drafts, and track status.</p>
        </div>
        <button
          onClick={onOpenCreateModal}
          className="btn btn-primary text-xs py-2.5 px-5 flex items-center justify-center gap-2 shrink-0 font-bold"
        >
          <Plus size={16} /> Create Voucher
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 text-center p-4 rounded-xl">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Claims</p>
          <p className="text-xl font-bold text-white mt-1">{stats?.total || 0}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 text-center p-4 rounded-xl">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Drafts</p>
          <p className="text-xl font-bold text-zinc-300 mt-1">{stats?.draft || 0}</p>
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
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Claimed</p>
          <p className="text-lg font-bold text-white mt-1 truncate">
            ₹{parseFloat(stats?.total_claimed || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 overflow-x-auto">
        {['ALL', 'DRAFT', 'PENDING', 'APPROVED', 'REJECTED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition shrink-0 ${
              activeTab === tab
                ? 'bg-white text-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Vouchers Grid */}
      {loading ? (
        <div className="text-center py-16 text-zinc-500 text-xs">Loading vouchers...</div>
      ) : filteredVouchers.length === 0 ? (
        <div className="bg-zinc-900 text-center py-16 border border-dashed border-zinc-800 rounded-xl space-y-2">
          <FileText className="mx-auto text-zinc-600 mb-2" size={32} />
          <p className="text-sm font-bold text-zinc-300">No Vouchers Found</p>
          <p className="text-xs text-zinc-500">Create your first expense reimbursement voucher to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVouchers.map((voucher) => (
            <VoucherCard
              key={voucher.id}
              voucher={voucher}
              userRole="EMPLOYEE"
              onSelect={onSelectVoucher}
              onEdit={onEditVoucher}
              onDelete={deleteVoucher}
            />
          ))}
        </div>
      )}
    </div>
  );
};
