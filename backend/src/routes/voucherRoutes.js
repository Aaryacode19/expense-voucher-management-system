const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Protect all voucher endpoints
router.use(authenticateToken);

// Dashboard metrics per role
router.get('/dashboard/stats', voucherController.getDashboardStats);

// Vouchers CRUD & Search/Filter
router.get('/', voucherController.getVouchers);
router.get('/:id', voucherController.getVoucherById);

// Employee operations
router.post('/', authorizeRoles('EMPLOYEE'), upload.single('signature'), voucherController.createVoucher);
router.put('/:id', authorizeRoles('EMPLOYEE'), upload.single('signature'), voucherController.updateVoucher);
router.delete('/:id', authorizeRoles('EMPLOYEE'), voucherController.deleteVoucher);

// Director approval/rejection operations
router.put('/:id/approve', authorizeRoles('DIRECTOR'), upload.single('signature'), voucherController.approveVoucher);
router.put('/:id/reject', authorizeRoles('DIRECTOR'), voucherController.rejectVoucher);

module.exports = router;
