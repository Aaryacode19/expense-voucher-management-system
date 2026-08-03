import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const VoucherContext = createContext();

export const VoucherProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [vouchers, setVouchers] = useState([]);
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
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
  });

  const fetchVouchers = useCallback(async (customFilters = filters) => {
    if (!token) return;
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(customFilters).forEach(([key, val]) => {
        if (val !== '' && val !== null && val !== undefined) {
          queryParams.append(key, val);
        }
      });

      const res = await fetch(`/api/vouchers?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setVouchers(data.vouchers || []);
      }
    } catch (err) {
      console.error('Failed to fetch vouchers:', err);
    } finally {
      setLoading(false);
    }
  }, [token, filters]);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/vouchers/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setStats(data.stats);
        if (data.recentActivity) setRecentActivity(data.recentActivity);
        if (data.recentApproved) setRecentActivity(data.recentApproved);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [token]);

  const createVoucher = async (formData) => {
    const res = await fetch('/api/vouchers', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
        // Content-Type is auto set by fetch when passing FormData or JSON
      },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create voucher');
    await fetchVouchers();
    await fetchStats();
    return data.voucher;
  };

  const updateVoucher = async (id, formData) => {
    const res = await fetch(`/api/vouchers/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update voucher');
    await fetchVouchers();
    await fetchStats();
    return data.voucher;
  };

  const deleteVoucher = async (id) => {
    const res = await fetch(`/api/vouchers/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete voucher');
    await fetchVouchers();
    await fetchStats();
  };

  const approveVoucher = async (id, formData) => {
    const res = await fetch(`/api/vouchers/${id}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to approve voucher');
    await fetchVouchers();
    await fetchStats();
    return data.voucher;
  };

  const rejectVoucher = async (id, rejection_reason) => {
    const res = await fetch(`/api/vouchers/${id}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ rejection_reason })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reject voucher');
    await fetchVouchers();
    await fetchStats();
    return data.voucher;
  };

  return (
    <VoucherContext.Provider value={{
      vouchers,
      stats,
      recentActivity,
      loading,
      filters,
      setFilters,
      fetchVouchers,
      fetchStats,
      createVoucher,
      updateVoucher,
      deleteVoucher,
      approveVoucher,
      rejectVoucher
    }}>
      {children}
    </VoucherContext.Provider>
  );
};

export const useVouchers = () => useContext(VoucherContext);
