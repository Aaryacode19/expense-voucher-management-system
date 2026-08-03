import React from 'react';
import { Search, Filter, X, RefreshCw, Calendar, IndianRupee, Building2, Tag } from 'lucide-react';
import { useVouchers } from '../context/VoucherContext';

export const FilterDrawer = ({ isOpen, onClose }) => {
  const { filters, setFilters, fetchVouchers } = useVouchers();

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    const updated = { ...filters, [field]: value };
    setFilters(updated);
    fetchVouchers(updated);
  };

  const resetFilters = () => {
    const reset = {
      search: '',
      department: '',
      category: '',
      status: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      sortBy: 'created_at',
      order: 'DESC'
    };
    setFilters(reset);
    fetchVouchers(reset);
  };

  const departments = ['', 'Engineering', 'Executive', 'Finance', 'Marketing', 'Sales', 'Human Resources', 'Operations'];
  const categories = ['', 'Travel', 'Meals', 'Software & Tools', 'Office Supplies', 'Client Entertainment', 'Training & Courses', 'Miscellaneous'];
  const statuses = ['', 'DRAFT', 'SUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content max-w-lg bg-slate-900 border border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-indigo-400" />
            <h2 className="text-base font-bold text-white">Search & Filter Vouchers</h2>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-lg">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Keyword Search */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Search Keywords</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Voucher #, Employee Name, Title..."
                value={filters.search}
                onChange={(e) => handleChange('search', e.target.value)}
                className="pl-9 w-full bg-slate-950 border border-gray-800"
              />
            </div>
          </div>

          {/* Department & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1 flex items-center gap-1">
                <Building2 size={12} /> Department
              </label>
              <select
                value={filters.department}
                onChange={(e) => handleChange('department', e.target.value)}
                className="w-full bg-slate-950 border border-gray-800 p-2 rounded-lg text-gray-200"
              >
                <option value="">All Departments</option>
                {departments.filter(Boolean).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1 flex items-center gap-1">
                <Tag size={12} /> Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full bg-slate-950 border border-gray-800 p-2 rounded-lg text-gray-200"
              >
                <option value="">All Categories</option>
                {categories.filter(Boolean).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Voucher Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full bg-slate-950 border border-gray-800 p-2 rounded-lg text-gray-200"
            >
              <option value="">All Statuses</option>
              {statuses.filter(Boolean).map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1 flex items-center gap-1">
                <Calendar size={12} /> From Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="w-full bg-slate-950 border border-gray-800"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1 flex items-center gap-1">
                <Calendar size={12} /> To Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                className="w-full bg-slate-950 border border-gray-800"
              />
            </div>
          </div>

          {/* Amount Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1 flex items-center gap-1">
                <IndianRupee size={12} /> Min Amount (₹)
              </label>
              <input
                type="number"
                placeholder="0"
                value={filters.minAmount}
                onChange={(e) => handleChange('minAmount', e.target.value)}
                className="w-full bg-slate-950 border border-gray-800"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1 flex items-center gap-1">
                <IndianRupee size={12} /> Max Amount (₹)
              </label>
              <input
                type="number"
                placeholder="10000"
                value={filters.maxAmount}
                onChange={(e) => handleChange('maxAmount', e.target.value)}
                className="w-full bg-slate-950 border border-gray-800"
              />
            </div>
          </div>

          {/* Sort Options */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-800">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleChange('sortBy', e.target.value)}
                className="w-full bg-slate-950 border border-gray-800 p-2 rounded-lg text-gray-200"
              >
                <option value="created_at">Created Date</option>
                <option value="expense_date">Expense Date</option>
                <option value="amount">Amount</option>
                <option value="voucher_number">Voucher #</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Order</label>
              <select
                value={filters.order}
                onChange={(e) => handleChange('order', e.target.value)}
                className="w-full bg-slate-950 border border-gray-800 p-2 rounded-lg text-gray-200"
              >
                <option value="DESC">Descending (Newest first)</option>
                <option value="ASC">Ascending (Oldest first)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-4 border-t border-gray-800 flex items-center justify-between">
          <button
            onClick={resetFilters}
            className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
          >
            <RefreshCw size={12} /> Reset Filters
          </button>
          <button
            onClick={onClose}
            className="btn btn-primary text-xs py-1.5 px-4"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
