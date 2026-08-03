import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VoucherProvider, useVouchers } from './context/VoucherContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { DirectorDashboard } from './pages/DirectorDashboard';
import { AccountsDashboard } from './pages/AccountsDashboard';
import { VoucherFormModal } from './components/VoucherFormModal';
import { VoucherDetailModal } from './components/VoucherDetailModal';
import { ApprovalModal } from './components/ApprovalModal';
import { FilterDrawer } from './components/FilterDrawer';

function MainApp() {
  const { user } = useAuth();
  const { createVoucher, updateVoucher, approveVoucher, rejectVoucher } = useVouchers();

  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [approvalModalVoucher, setApprovalModalVoucher] = useState(null);
  const [approvalActionType, setApprovalActionType] = useState('APPROVE');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 flex flex-col">
      <Navbar
        onOpenCreateModal={() => setIsCreateOpen(true)}
        onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 lg:p-12">
        {user.role === 'EMPLOYEE' && (
          <EmployeeDashboard
            onOpenCreateModal={() => setIsCreateOpen(true)}
            onSelectVoucher={(v) => setSelectedVoucher(v)}
            onEditVoucher={(v) => setEditingVoucher(v)}
          />
        )}

        {user.role === 'DIRECTOR' && (
          <DirectorDashboard
            onSelectVoucher={(v) => setSelectedVoucher(v)}
            onOpenApproveModal={(v) => {
              setApprovalModalVoucher(v);
              setApprovalActionType('APPROVE');
            }}
            onOpenRejectModal={(v) => {
              setApprovalModalVoucher(v);
              setApprovalActionType('REJECT');
            }}
          />
        )}

        {user.role === 'ACCOUNTS' && (
          <AccountsDashboard
            onSelectVoucher={(v) => setSelectedVoucher(v)}
          />
        )}
      </main>

      {/* Modals */}
      {isCreateOpen && (
        <VoucherFormModal
          onClose={() => setIsCreateOpen(false)}
          onSubmit={(formData) => createVoucher(formData)}
        />
      )}

      {editingVoucher && (
        <VoucherFormModal
          voucher={editingVoucher}
          onClose={() => setEditingVoucher(null)}
          onSubmit={(formData) => updateVoucher(editingVoucher.id, formData)}
        />
      )}

      {selectedVoucher && (
        <VoucherDetailModal
          voucher={selectedVoucher}
          onClose={() => setSelectedVoucher(null)}
        />
      )}

      {approvalModalVoucher && (
        <ApprovalModal
          voucher={approvalModalVoucher}
          actionType={approvalActionType}
          onClose={() => setApprovalModalVoucher(null)}
          onApprove={approveVoucher}
          onReject={rejectVoucher}
        />
      )}

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <VoucherProvider>
        <MainApp />
      </VoucherProvider>
    </AuthProvider>
  );
}
