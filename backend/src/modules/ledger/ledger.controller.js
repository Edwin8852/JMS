const ledgerService = require('./ledger.service');

exports.createEntry = async (req, res, next) => {
  try {
    const entry = await ledgerService.createEntry(req.body, req.user.id);
    return res.status(201).json({
      success: true,
      message: req.t ? req.t('ledger.created') : 'Ledger entry created successfully',
      data: entry,
    });
  } catch (error) {
    next(error);
  }
};

exports.getLedgers = async (req, res, next) => {
  try {
    const ledgers = await ledgerService.getLedgers(req.query);
    return res.status(200).json({
      success: true,
      message: req.t ? req.t('ledger.fetched') : 'Ledger data fetched successfully',
      data: ledgers,
    });
  } catch (error) {
    next(error);
  }
};

exports.getLedgerById = async (req, res, next) => {
  try {
    const entry = await ledgerService.getLedgerById(req.params.id);
    return res.status(200).json({
      success: true,
      message: req.t ? req.t('ledger.fetched') : 'Ledger data fetched successfully',
      data: entry,
    });
  } catch (error) {
    // Handling not found internally or through global error handler
    if (error.statusCode === 404) {
      error.message = req.t ? req.t('ledger.notFound') : 'Ledger entry not found';
    }
    next(error);
  }
};

exports.getLedgerByCustomer = async (req, res, next) => {
  try {
    const ledgers = await ledgerService.getLedgerByCustomer(req.params.customerId);
    return res.status(200).json({
      success: true,
      data: ledgers,
    });
  } catch (error) {
    next(error);
  }
};

exports.getLedgerByLoan = async (req, res, next) => {
  try {
    const ledgers = await ledgerService.getLedgerByLoan(req.params.loanId);
    return res.status(200).json({
      success: true,
      data: ledgers,
    });
  } catch (error) {
    next(error);
  }
};
