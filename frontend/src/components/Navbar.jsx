import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Receipt, LogOut, Filter, Plus, User } from 'lucide-react';

export const Navbar = ({ onOpenCreateModal, onToggleFilter }) => {
  const { user, logout } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'EMPLOYEE':
        return <span className="bg-zinc-900 text-zinc-300 border border-zinc-700 text-xs px-2.5 py-0.5 rounded font-mono font-semibold">Employee</span>;
      case 'DIRECTOR':
        return <span className="bg-zinc-900 text-zinc-200 border border-zinc-600 text-xs px-2.5 py-0.5 rounded font-mono font-semibold">Director (Admin)</span>;
      case 'ACCOUNTS':
        return <span className="bg-zinc-900 text-zinc-300 border border-zinc-700 text-xs px-2.5 py-0.5 rounded font-mono font-semibold">Accounts Team</span>;
      default:
        return null;
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-zinc-950 border-b border-zinc-800 px-6 md:px-10 py-4 flex items-center justify-between">
      {/* Brand Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-white text-black flex items-center justify-center font-black">
          <Receipt size={20} />
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight leading-tight flex items-center gap-2">
            VoucherHub
            <span className="text-[10px] font-mono text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded bg-zinc-900">ABC Corp</span>
          </h1>
          <p className="text-xs text-zinc-500 hidden sm:block">Expense Voucher Management System</p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Search/Filter Trigger */}
        {onToggleFilter && (
          <button
            onClick={onToggleFilter}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-3.5 py-2 rounded-lg text-xs font-semibold transition"
          >
            <Filter size={14} className="text-zinc-400" />
            <span className="hidden md:inline">Filter & Search</span>
          </button>
        )}

        {/* Employee Create Button */}
        {user?.role === 'EMPLOYEE' && onOpenCreateModal && (
          <button
            onClick={onOpenCreateModal}
            className="btn btn-primary text-xs py-2 px-4 flex items-center gap-1.5 font-bold"
          >
            <Plus size={16} />
            <span>New Voucher</span>
          </button>
        )}

        {/* Active User Badge & Logout */}
        <div className="flex items-center gap-3 border-l border-zinc-800 pl-4">
          <div className="flex items-center gap-2 text-xs">
            <User size={14} className="text-zinc-400" />
            <span className="font-semibold text-zinc-200 hidden sm:inline">{user?.name}</span>
            {getRoleBadge(user?.role)}
          </div>

          <button
            onClick={logout}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
};
