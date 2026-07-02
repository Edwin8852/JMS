const { z } = require('zod');

const ledgerSchema = z.object({
  transactionType: z.enum(['DEBIT', 'CREDIT'], {
    required_error: 'Transaction type is required',
  }),
  category: z.enum(['LOAN_DISBURSEMENT', 'LOAN_REPAYMENT', 'INTEREST_PAYMENT', 'EXPENSE', 'INCOME', 'OTHER'], {
    required_error: 'Category is required',
  }),
  amount: z.number({
    required_error: 'Amount is required',
    invalid_type_error: 'Amount must be a number',
  }).positive('Amount must be positive'),
  customerId: z.string().uuid('Invalid Customer ID').optional(),
  loanId: z.string().uuid('Invalid Loan ID').optional(),
  paymentId: z.string().uuid('Invalid Payment ID').optional(),
  description: z.string().min(1, 'Description is required'),
});

exports.validateLedger = (req, res, next) => {
  try {
    req.body = ledgerSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: req.t ? req.t('validationFailed', { ns: 'validation' }) : 'Validation failed',
        errors: error.errors,
      });
    }
    next(error);
  }
};
