import React, { useState } from 'react';
import { X, Save, Send, AlertCircle } from 'lucide-react';
import { SignaturePad } from './SignaturePad';

export const VoucherFormModal = ({ voucher, onClose, onSubmit }) => {
  const isEditing = !!voucher;

  const [department, setDepartment] = useState(voucher?.department || 'Engineering');
  const [expenseTitle, setExpenseTitle] = useState(voucher?.expense_title || '');
  const [expenseCategory, setExpenseCategory] = useState(voucher?.expense_category || 'Travel');
  const [expenseDescription, setExpenseDescription] = useState(voucher?.expense_description || '');
  const [expenseDate, setExpenseDate] = useState(voucher?.expense_date || new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState(voucher?.amount || '');
  
  const [signatureData, setSignatureData] = useState(voucher?.employee_signature || null);
  const [signatureFile, setSignatureFile] = useState(null);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const departments = ['Engineering', 'Executive', 'Finance', 'Marketing', 'Sales', 'Human Resources', 'Operations'];
  const categories = ['Travel', 'Meals', 'Software & Tools', 'Office Supplies', 'Client Entertainment', 'Training & Courses', 'Miscellaneous'];

  const handleSubmit = async (action) => {
    setError('');

    // Field Validations
    if (!department) {
      setError('Department is mandatory.');
      return;
    }
    if (!expenseTitle.trim()) {
      setError('Expense Title is mandatory.');
      return;
    }
    if (!expenseDate) {
      setError('Expense Date is mandatory.');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Amount is mandatory and must be greater than 0.');
      return;
    }

    if (action === 'SUBMIT' && !signatureData && !signatureFile) {
      setError('Employee signature is mandatory before submitting a voucher for approval.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('department', department);
      formData.append('expense_title', expenseTitle);
      formData.append('expense_category', expenseCategory);
      formData.append('expense_description', expenseDescription);
      formData.append('expense_date', expenseDate);
      formData.append('amount', amount);
      formData.append('action', action);

      if (signatureFile) {
        formData.append('signature', signatureFile);
      } else if (signatureData) {
        formData.append('employee_signature', signatureData);
      }

      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to process voucher.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
          <h2 className="text-lg font-bold text-white">
            {isEditing ? `Edit Draft (${voucher.voucher_number})` : 'Create New Expense Voucher'}
          </h2>
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

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          {/* Department & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-900 border border-gray-700 text-gray-200 text-xs rounded-lg p-2.5"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Expense Category</label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className="w-full bg-slate-900 border border-gray-700 text-gray-200 text-xs rounded-lg p-2.5"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Expense Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Expense Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={expenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
              placeholder="e.g. AWS Hosting July Invoice / Flight to Chicago"
              className="w-full"
            />
          </div>

          {/* Date & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Expense Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Expense Description</label>
            <textarea
              rows={3}
              value={expenseDescription}
              onChange={(e) => setExpenseDescription(e.target.value)}
              placeholder="Detailed justification or list of items included in this expense request..."
              className="w-full"
            />
          </div>

          {/* Signature Pad */}
          <SignaturePad
            label="Employee Digital Signature"
            required={false}
            onSignatureChange={(base64, file) => {
              setSignatureData(base64);
              setSignatureFile(file);
            }}
          />

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-gray-800 flex items-center justify-end gap-3">
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
              onClick={() => handleSubmit('DRAFT')}
              className="btn btn-secondary text-xs flex items-center gap-1.5"
              disabled={submitting}
            >
              <Save size={14} /> Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('SUBMIT')}
              className="btn btn-primary text-xs flex items-center gap-1.5"
              disabled={submitting}
            >
              <Send size={14} /> Submit for Approval
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
