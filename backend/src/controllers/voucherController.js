const db = require('../db');
const path = require('path');
const fs = require('fs');

// Helper to generate unique voucher number e.g. VCH-2026-0004
function generateVoucherNumber() {
  const year = new Date().getFullYear();
  const lastVoucher = db.prepare(`
    SELECT voucher_number FROM vouchers 
    WHERE voucher_number LIKE ? 
    ORDER BY id DESC LIMIT 1
  `).get(`VCH-${year}-%`);

  let nextSeq = 1;
  if (lastVoucher && lastVoucher.voucher_number) {
    const parts = lastVoucher.voucher_number.split('-');
    if (parts.length === 3) {
      nextSeq = parseInt(parts[2], 10) + 1;
    }
  }
  return `VCH-${year}-${String(nextSeq).padStart(4, '0')}`;
}

// ----------------------------------------------------------------------
// GET ALL VOUCHERS (With Role Access Control, Search, Filter & Sort)
// ----------------------------------------------------------------------
exports.getVouchers = (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const {
      search,
      department,
      category,
      status,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sortBy = 'created_at',
      order = 'DESC'
    } = req.query;

    let query = 'SELECT * FROM vouchers WHERE 1=1';
    const params = [];

    // Role Restrictions: Employees see only their own vouchers
    if (role === 'EMPLOYEE') {
      query += ' AND user_id = ?';
      params.push(userId);
    }

    // Search by Voucher Number or Employee Name or Expense Title
    if (search) {
      query += ' AND (voucher_number LIKE ? OR employee_name LIKE ? OR expense_title LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // Filters
    if (department) {
      query += ' AND department = ?';
      params.push(department);
    }
    if (category) {
      query += ' AND expense_category = ?';
      params.push(category);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (startDate) {
      query += ' AND expense_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND expense_date <= ?';
      params.push(endDate);
    }
    if (minAmount) {
      query += ' AND amount >= ?';
      params.push(parseFloat(minAmount));
    }
    if (maxAmount) {
      query += ' AND amount <= ?';
      params.push(parseFloat(maxAmount));
    }

    // Safe Sorting
    const validSortFields = ['created_at', 'voucher_date', 'expense_date', 'amount', 'voucher_number', 'status'];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${safeSortBy} ${safeOrder}`;

    const vouchers = db.prepare(query).all(...params);
    res.json({ vouchers, count: vouchers.length });
  } catch (err) {
    console.error('Get Vouchers Error:', err);
    res.status(500).json({ error: 'Failed to retrieve vouchers.' });
  }
};

// ----------------------------------------------------------------------
// GET SINGLE VOUCHER DETAILS
// ----------------------------------------------------------------------
exports.getVoucherById = (req, res) => {
  try {
    const { id } = req.params;
    const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);

    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found.' });
    }

    // Role-based visibility check
    if (req.user.role === 'EMPLOYEE' && voucher.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. You can only view your own vouchers.' });
    }

    res.json({ voucher });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching voucher details.' });
  }
};

// ----------------------------------------------------------------------
// CREATE VOUCHER (EMPLOYEE)
// ----------------------------------------------------------------------
exports.createVoucher = (req, res) => {
  try {
    if (req.user.role !== 'EMPLOYEE') {
      return res.status(403).json({ error: 'Only Employees can create vouchers.' });
    }

    const {
      department,
      expense_title,
      expense_category,
      expense_description,
      expense_date,
      amount,
      action = 'DRAFT', // 'DRAFT' or 'SUBMIT'
      employee_signature // Can be uploaded file path or base64
    } = req.body;

    // Handle File Upload if signature is passed in req.file
    let sigPath = employee_signature || null;
    if (req.file) {
      sigPath = `/uploads/${req.file.filename}`;
    }

    // Validation
    if (!department || !expense_title || !expense_date || amount === undefined || amount === null) {
      return res.status(400).json({ error: 'Department, Expense Title, Expense Date, and Amount are mandatory fields.' });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number greater than 0.' });
    }

    // Determine initial status
    let status = 'DRAFT';
    if (action.toUpperCase() === 'SUBMIT') {
      if (!sigPath) {
        return res.status(400).json({ error: 'Employee signature is mandatory before submitting a voucher for approval.' });
      }
      status = 'PENDING_APPROVAL';
    }

    const voucherNumber = generateVoucherNumber();
    const currentDate = new Date().toISOString().split('T')[0];

    const stmt = db.prepare(`
      INSERT INTO vouchers (
        voucher_number, user_id, employee_name, employee_code, department,
        expense_title, expense_category, expense_description, expense_date,
        voucher_date, amount, status, employee_signature
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      voucherNumber,
      req.user.id,
      req.user.name,
      req.user.employee_code || null,
      department,
      expense_title,
      expense_category || 'General',
      expense_description || '',
      expense_date,
      currentDate,
      numericAmount,
      status,
      sigPath
    );

    const newVoucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      message: status === 'DRAFT' ? 'Voucher saved as draft successfully.' : 'Voucher submitted for approval successfully.',
      voucher: newVoucher
    });
  } catch (err) {
    console.error('Create Voucher Error:', err);
    res.status(500).json({ error: 'Failed to create voucher.' });
  }
};

// ----------------------------------------------------------------------
// UPDATE DRAFT VOUCHER (EMPLOYEE)
// ----------------------------------------------------------------------
exports.updateVoucher = (req, res) => {
  try {
    const { id } = req.params;
    const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);

    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found.' });
    }

    if (req.user.role !== 'EMPLOYEE' || voucher.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the creator can edit this voucher.' });
    }

    if (voucher.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Only Draft vouchers can be edited. Submitted or processed vouchers are read-only.' });
    }

    const {
      department,
      expense_title,
      expense_category,
      expense_description,
      expense_date,
      amount,
      action = 'DRAFT',
      employee_signature
    } = req.body;

    let sigPath = employee_signature || voucher.employee_signature;
    if (req.file) {
      sigPath = `/uploads/${req.file.filename}`;
    }

    if (amount !== undefined) {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ error: 'Amount must be greater than 0.' });
      }
    }

    let newStatus = 'DRAFT';
    if (action.toUpperCase() === 'SUBMIT') {
      if (!sigPath) {
        return res.status(400).json({ error: 'Employee signature is mandatory before submitting a voucher for approval.' });
      }
      newStatus = 'PENDING_APPROVAL';
    }

    const updatedDept = department || voucher.department;
    const updatedTitle = expense_title || voucher.expense_title;
    const updatedCat = expense_category || voucher.expense_category;
    const updatedDesc = expense_description !== undefined ? expense_description : voucher.expense_description;
    const updatedExpDate = expense_date || voucher.expense_date;
    const updatedAmt = amount !== undefined ? parseFloat(amount) : voucher.amount;
    const updatedTimestamp = new Date().toISOString();

    const stmt = db.prepare(`
      UPDATE vouchers
      SET department = ?,
          expense_title = ?,
          expense_category = ?,
          expense_description = ?,
          expense_date = ?,
          amount = ?,
          status = ?,
          employee_signature = ?,
          updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      updatedDept,
      updatedTitle,
      updatedCat,
      updatedDesc,
      updatedExpDate,
      updatedAmt,
      newStatus,
      sigPath,
      updatedTimestamp,
      id
    );

    const updatedVoucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);

    res.json({
      message: newStatus === 'DRAFT' ? 'Draft voucher updated.' : 'Voucher submitted for approval.',
      voucher: updatedVoucher
    });
  } catch (err) {
    console.error('Update Voucher Error:', err);
    res.status(500).json({ error: 'Failed to update voucher.' });
  }
};

// ----------------------------------------------------------------------
// DELETE DRAFT VOUCHER (EMPLOYEE)
// ----------------------------------------------------------------------
exports.deleteVoucher = (req, res) => {
  try {
    const { id } = req.params;
    const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);

    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found.' });
    }

    if (req.user.role !== 'EMPLOYEE' || voucher.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the creator can delete this voucher.' });
    }

    if (voucher.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Only Draft vouchers can be deleted.' });
    }

    db.prepare('DELETE FROM vouchers WHERE id = ?').run(id);

    res.json({ message: 'Draft voucher deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete voucher.' });
  }
};

// ----------------------------------------------------------------------
// APPROVE VOUCHER (DIRECTOR)
// ----------------------------------------------------------------------
exports.approveVoucher = (req, res) => {
  try {
    if (req.user.role !== 'DIRECTOR') {
      return res.status(403).json({ error: 'Only the Director can approve vouchers.' });
    }

    const { id } = req.params;
    const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);

    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found.' });
    }

    if (voucher.status !== 'PENDING_APPROVAL' && voucher.status !== 'SUBMITTED') {
      return res.status(400).json({ error: `Cannot approve voucher in '${voucher.status}' status.` });
    }

    let directorSig = req.body.director_signature || null;
    if (req.file) {
      directorSig = `/uploads/${req.file.filename}`;
    }

    if (!directorSig) {
      return res.status(400).json({ error: 'Director signature is mandatory to approve a voucher.' });
    }

    const approvalDate = new Date().toISOString().split('T')[0];
    const updatedTimestamp = new Date().toISOString();

    const stmt = db.prepare(`
      UPDATE vouchers
      SET status = 'APPROVED',
          director_signature = ?,
          approval_date = ?,
          rejection_reason = NULL,
          updated_at = ?
      WHERE id = ?
    `);

    stmt.run(directorSig, approvalDate, updatedTimestamp, id);

    const approvedVoucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);

    res.json({
      message: 'Voucher approved successfully.',
      voucher: approvedVoucher
    });
  } catch (err) {
    console.error('Approve Error:', err);
    res.status(500).json({ error: 'Failed to approve voucher.' });
  }
};

// ----------------------------------------------------------------------
// REJECT VOUCHER (DIRECTOR)
// ----------------------------------------------------------------------
exports.rejectVoucher = (req, res) => {
  try {
    if (req.user.role !== 'DIRECTOR') {
      return res.status(403).json({ error: 'Only the Director can reject vouchers.' });
    }

    const { id } = req.params;
    const { rejection_reason } = req.body;

    const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);

    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found.' });
    }

    if (voucher.status !== 'PENDING_APPROVAL' && voucher.status !== 'SUBMITTED') {
      return res.status(400).json({ error: `Cannot reject voucher in '${voucher.status}' status.` });
    }

    if (!rejection_reason || !rejection_reason.trim()) {
      return res.status(400).json({ error: 'Rejection reason is mandatory when rejecting a voucher.' });
    }

    const updatedTimestamp = new Date().toISOString();

    const stmt = db.prepare(`
      UPDATE vouchers
      SET status = 'REJECTED',
          rejection_reason = ?,
          updated_at = ?
      WHERE id = ?
    `);

    stmt.run(rejection_reason.trim(), updatedTimestamp, id);

    const rejectedVoucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);

    res.json({
      message: 'Voucher rejected successfully.',
      voucher: rejectedVoucher
    });
  } catch (err) {
    console.error('Reject Error:', err);
    res.status(500).json({ error: 'Failed to reject voucher.' });
  }
};

// ----------------------------------------------------------------------
// DASHBOARD STATS PER ROLE
// ----------------------------------------------------------------------
exports.getDashboardStats = (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const todayStr = new Date().toISOString().split('T')[0];

    if (role === 'EMPLOYEE') {
      const stats = db.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'DRAFT' THEN 1 ELSE 0 END) as draft,
          SUM(CASE WHEN status IN ('SUBMITTED', 'PENDING_APPROVAL') THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected,
          COALESCE(SUM(amount), 0) as total_claimed
        FROM vouchers
        WHERE user_id = ?
      `).get(userId);

      return res.json({ stats });
    }

    if (role === 'DIRECTOR') {
      const stats = db.prepare(`
        SELECT 
          SUM(CASE WHEN status IN ('SUBMITTED', 'PENDING_APPROVAL') THEN 1 ELSE 0 END) as pending_approval_count,
          COALESCE(SUM(CASE WHEN status IN ('SUBMITTED', 'PENDING_APPROVAL') THEN amount ELSE 0 END), 0) as total_pending_amount,
          SUM(CASE WHEN status = 'APPROVED' AND approval_date = ? THEN 1 ELSE 0 END) as approved_today,
          SUM(CASE WHEN status = 'REJECTED' AND DATE(updated_at) = ? THEN 1 ELSE 0 END) as rejected_today,
          COUNT(*) as total_vouchers
        FROM vouchers
      `).get(todayStr, todayStr);

      const recentActivity = db.prepare(`
        SELECT * FROM vouchers ORDER BY updated_at DESC LIMIT 5
      `).all();

      return res.json({ stats, recentActivity });
    }

    if (role === 'ACCOUNTS') {
      const stats = db.prepare(`
        SELECT 
          COUNT(*) as total_vouchers,
          SUM(CASE WHEN status IN ('SUBMITTED', 'PENDING_APPROVAL') THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected,
          COALESCE(SUM(CASE WHEN status = 'APPROVED' THEN amount ELSE 0 END), 0) as total_approved_amount
        FROM vouchers
      `).get();

      const recentApproved = db.prepare(`
        SELECT * FROM vouchers WHERE status = 'APPROVED' ORDER BY approval_date DESC LIMIT 5
      `).all();

      return res.json({ stats, recentApproved });
    }

    res.status(400).json({ error: 'Invalid role for dashboard stats.' });
  } catch (err) {
    console.error('Dashboard Stats Error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics.' });
  }
};
