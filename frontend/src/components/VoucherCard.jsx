import React from 'react';
import { Clock, Building2, Tag, Edit, Trash2, Eye, CheckCircle2, XCircle } from 'lucide-react';

export const VoucherCard = ({ voucher, onSelect, onEdit, onDelete, onApprove, onReject, userRole }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'DRAFT':
        return <span className="badge badge-draft">Draft</span>;
      case 'SUBMITTED':
      case 'PENDING_APPROVAL':
        return <span className="badge badge-pending"><Clock size={12} /> Pending</span>;
      case 'APPROVED':
        return <span className="badge badge-approved"><CheckCircle2 size={12} /> Approved</span>;
      case 'REJECTED':
        return <span className="badge badge-rejected"><XCircle size={12} /> Rejected</span>;
      default:
        return null;
    }
  };

  const isEditable = userRole === 'EMPLOYEE' && voucher.status === 'DRAFT';

  return (
    <div className="glass-card glass-card-hover flex flex-col justify-between transition-all border border-zinc-800 p-6 rounded-xl space-y-4 bg-zinc-900/90">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <span className="text-xs font-mono font-semibold text-zinc-400 bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded">
              {voucher.voucher_number}
            </span>
            <h3 className="text-base font-bold text-white line-clamp-1 mt-2.5">
              {voucher.expense_title}
            </h3>
          </div>
          <div className="shrink-0">
            {getStatusBadge(voucher.status)}
          </div>
        </div>

        {/* Claim Amount */}
        <div className="flex items-center justify-between my-4 bg-zinc-950 px-4 py-3 rounded-lg border border-zinc-800">
          <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Amount</span>
          <span className="text-lg font-bold text-white">
            ₹{parseFloat(voucher.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Info Grid */}
        <div className="space-y-2 text-xs text-zinc-400">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
            <span className="flex items-center gap-1.5 text-zinc-500">
              <Building2 size={13} /> Dept
            </span>
            <span className="font-medium text-zinc-300">{voucher.department}</span>
          </div>

          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
            <span className="flex items-center gap-1.5 text-zinc-500">
              <Tag size={13} /> Category
            </span>
            <span className="font-medium text-zinc-300">{voucher.expense_category || 'General'}</span>
          </div>

          <div className="flex items-center justify-between pt-1 text-zinc-500">
            <span>{voucher.expense_date}</span>
            <span className="text-zinc-400">By {voucher.employee_name}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-3">
        <button
          onClick={() => onSelect(voucher)}
          className="text-xs text-zinc-300 hover:text-white font-semibold flex items-center gap-1.5 py-1 px-2.5 rounded hover:bg-zinc-800 transition"
        >
          <Eye size={14} /> Details
        </button>

        <div className="flex items-center gap-2">
          {isEditable && (
            <>
              <button
                onClick={() => onEdit(voucher)}
                className="p-1.5 text-zinc-400 hover:text-white bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded transition"
                title="Edit Draft"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={() => onDelete(voucher.id)}
                className="p-1.5 text-zinc-400 hover:text-red-400 bg-zinc-950 border border-zinc-800 hover:border-red-900/60 rounded transition"
                title="Delete Draft"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}

          {userRole === 'DIRECTOR' && (voucher.status === 'PENDING_APPROVAL' || voucher.status === 'SUBMITTED') && (
            <>
              <button
                onClick={() => onApprove(voucher)}
                className="btn btn-emerald text-xs py-1.5 px-3 rounded flex items-center gap-1 font-bold"
              >
                <CheckCircle2 size={14} /> Approve
              </button>
              <button
                onClick={() => onReject(voucher)}
                className="btn btn-rose text-xs py-1.5 px-3 rounded flex items-center gap-1 font-bold"
              >
                <XCircle size={14} /> Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
