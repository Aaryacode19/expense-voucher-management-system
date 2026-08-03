import React from 'react';
import { X, Printer, Calendar, Building2, User, AlertTriangle, FileText, IndianRupee } from 'lucide-react';

export const VoucherDetailModal = ({ voucher, onClose }) => {
  if (!voucher) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4 no-print">
          <div className="flex items-center gap-2">
            <FileText className="text-zinc-300" size={20} />
            <h2 className="text-lg font-bold text-white">Voucher Details</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <Printer size={14} /> Print / Export PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Receipt Layout */}
        <div className="space-y-6 text-zinc-200">
          {/* Top Banner / Company Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-400 font-bold">ABC Company Reimbursement Voucher</p>
              <h1 className="text-2xl font-extrabold text-white mt-0.5">{voucher.voucher_number}</h1>
            </div>
            <div className="text-left sm:text-right">
              <span className={`badge ${
                voucher.status === 'APPROVED' ? 'badge-approved' :
                voucher.status === 'REJECTED' ? 'badge-rejected' :
                voucher.status === 'DRAFT' ? 'badge-draft' : 'badge-pending'
              }`}>
                {voucher.status.replace('_', ' ')}
              </span>
              <p className="text-xs text-zinc-400 mt-1">Voucher Date: {voucher.voucher_date}</p>
            </div>
          </div>

          {/* Rejection Reason Alert if Rejected */}
          {voucher.status === 'REJECTED' && (
            <div className="bg-red-950/40 border border-red-900/80 rounded-xl p-4 text-red-200 flex items-start gap-3">
              <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-sm font-bold text-red-300">Voucher Rejected by Director</h4>
                <p className="text-xs mt-1 text-red-200/90">{voucher.rejection_reason || 'No reason specified.'}</p>
              </div>
            </div>
          )}

          {/* Grid Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Employee Box */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <User size={14} className="text-zinc-300" /> Employee Information
              </h3>
              <div className="text-sm">
                <p className="font-semibold text-white">{voucher.employee_name}</p>
                <p className="text-xs text-zinc-400">ID: {voucher.employee_code || 'N/A'}</p>
                <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
                  <Building2 size={12} /> {voucher.department}
                </p>
              </div>
            </div>

            {/* Expense Summary Box */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <IndianRupee size={14} className="text-emerald-400" /> Claim Summary
              </h3>
              <div>
                <p className="text-xs text-zinc-400">Total Claim Amount</p>
                <p className="text-2xl font-extrabold text-emerald-400">
                  ₹{parseFloat(voucher.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
                  <Calendar size={12} /> Expense Date: {voucher.expense_date}
                </p>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Expense Details</h3>
            <div>
              <p className="text-sm font-semibold text-white">{voucher.expense_title}</p>
              <p className="text-xs text-zinc-400 font-medium my-1">Category: {voucher.expense_category}</p>
              <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900 p-3 rounded-lg border border-zinc-800 mt-2">
                {voucher.expense_description || 'No description provided.'}
              </p>
            </div>
          </div>

          {/* Digital Signatures Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Employee Signature */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
              <p className="text-xs font-bold text-zinc-400 uppercase mb-2">Employee Signature</p>
              {voucher.employee_signature ? (
                <div className="bg-zinc-900 p-2 rounded-lg border border-zinc-800 flex items-center justify-center min-h-[90px]">
                  <img
                    src={voucher.employee_signature}
                    alt="Employee Signature"
                    className="max-h-20 object-contain filter invert"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <span className="text-xs text-emerald-400 hidden">✓ Digitally Signed</span>
                </div>
              ) : (
                <div className="bg-zinc-900/50 p-4 rounded-lg text-xs text-zinc-500 border border-dashed border-zinc-800">
                  No signature attached
                </div>
              )}
            </div>

            {/* Director Signature */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
              <p className="text-xs font-bold text-zinc-400 uppercase mb-2">Director Approval Signature</p>
              {voucher.director_signature ? (
                <div className="bg-zinc-900 p-2 rounded-lg border border-zinc-800 flex items-center justify-center min-h-[90px]">
                  <img
                    src={voucher.director_signature}
                    alt="Director Signature"
                    className="max-h-20 object-contain filter invert"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <span className="text-xs text-emerald-400 hidden">✓ Digitally Approved</span>
                </div>
              ) : (
                <div className="bg-zinc-900/50 p-4 rounded-lg text-xs text-zinc-500 border border-dashed border-zinc-800">
                  {voucher.status === 'APPROVED' ? 'Approved (Digital Record)' : 'Pending Director Signature'}
                </div>
              )}
              {voucher.approval_date && (
                <p className="text-[10px] text-emerald-400 mt-1">Approved on: {voucher.approval_date}</p>
              )}
            </div>
          </div>

          {/* Audit Info Footer */}
          <div className="border-t border-zinc-800 pt-3 text-[11px] text-zinc-500 flex justify-between">
            <span>Created At: {new Date(voucher.created_at).toLocaleString()}</span>
            <span>Last Updated: {new Date(voucher.updated_at).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
