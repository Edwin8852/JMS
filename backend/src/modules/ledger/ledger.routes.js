const express = require('express');
const router = express.Router();
const ledgerController = require('./ledger.controller');
const { validateLedger } = require('./ledger.validation');
const authMiddleware = require('../../shared/middleware/auth.middleware');
const authorizeRoles = require('../../shared/middleware/role.middleware');

router.use(authMiddleware);
router.use(authorizeRoles('SUPER_ADMIN', 'ADMIN'));

router.post('/', validateLedger, ledgerController.createEntry);
router.get('/', ledgerController.getLedgers);
router.get('/:id', ledgerController.getLedgerById);
router.get('/customer/:customerId', ledgerController.getLedgerByCustomer);
router.get('/loan/:loanId', ledgerController.getLedgerByLoan);

module.exports = router;
