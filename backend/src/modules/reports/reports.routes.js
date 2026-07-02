const express = require('express');
const router = express.Router();
const reportsController = require('./reports.controller');
const authMiddleware = require('../../shared/middleware/auth.middleware');
const authorizeRoles = require('../../shared/middleware/role.middleware');
const { validateRevenueReport } = require('./reports.validation');

// All report routes are protected and restricted to SUPER_ADMIN and ADMIN
router.use(authMiddleware);
router.use(authorizeRoles('SUPER_ADMIN', 'ADMIN'));

router.get('/revenue', validateRevenueReport, reportsController.getRevenueReport);
router.get('/loans', reportsController.getLoanReport);
router.get('/payments', reportsController.getPaymentReport);
router.get('/customers', reportsController.getCustomerReport);

module.exports = router;
