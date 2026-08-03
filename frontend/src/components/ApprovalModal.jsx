import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { SignaturePad } from './SignaturePad';

export const ApprovalModal = ({ voucher, actionType, onClose, onApprove, onReject }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [directorSigData, setDirectorSigData] = useState(null);
  const [directorSigFile, setDirectorSigFile] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isApprove = actionType === 'APPROVE';

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);

    try {
      if (isApprove) {
        if (!directorSigData && !directorSigFile) {
          setError('Director signature is mandatory to approve this voucher.');
          setSubmitting(false);
          return;
        }

        const formData = new FormData();
        if (directorSigFile) {
          formData.append('signature', directorSigFile);
        } else if (directorSigData) {
          formData.append('director_signature', directorSigData);
        }

        await onApprove(voucher.id, formData);
      } else {
        if (!rejectionReason.trim()) {
          setError('Rejection reason is mandatory when rejecting a voucher.');
          setSubmitting(false);
          return;
        }

        await onReject(voucher.id, rejectionReason.trim());
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to complete action.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            {isApprove ? (
              <CheckCircle2 className="text-emerald-400" size={20} />
            ) : (
              <XCircle className="text-rose-400" size={20} />
            )}
            <h2 className="text-lg font-bold text-white">
              {isApprove ? 'Approve Voucher' : 'Reject Voucher'} ({voucher.voucher_number})
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-lg">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-rose-950/60 border border-rose-800 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Voucher Brief */}
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-gray-800 text-xs mb-4 space-y-1 text-gray-300">
          <p><span className="text-gray-400">Employee:</span> <strong className="text-white">{voucher.employee_name}</strong> ({voucher.department})</p>
          <p><span className="text-gray-400">Title:</span> {voucher.expense_title}</p>
          <p><span className="text-gray-400">Claim Amount:</span> <strong className="text-emerald-400">₹{parseFloat(voucher.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></p>
        </div>

        {isApprove ? (
          <div className="space-y-4">
            <p className="text-xs text-gray-300">
              Please sign below to authorize reimbursement approval for this expense voucher.
            </p>
            <SignaturePad
              label="Director Authorization Signature"
              required={true}
              onSignatureChange={(base64, file) => {
                setDirectorSigData(base64);
                setDirectorSigFile(file);
              }}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-300">
              Rejection Reason Remarks <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="State the reason for rejecting this voucher (e.g. Missing receipts, exceeds department budget policy)..."
              className="w-full"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 mt-4 border-t border-gray-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary text-xs"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={`btn ${isApprove ? 'btn-emerald' : 'btn-rose'} text-xs flex items-center gap-1.5`}
            disabled={submitting}
          >
            {isApprove ? (
              <>
                <CheckCircle2 size={14} /> Confirm & Approve
              </>
            ) : (
              <>
                <XCircle size={14} /> Confirm & Reject
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
