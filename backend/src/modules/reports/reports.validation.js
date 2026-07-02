const { z } = require('zod');

const revenueReportSchema = z.object({
  startDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: "Invalid start date format",
  }),
  endDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: "Invalid end date format",
  }),
});

exports.validateRevenueReport = (req, res, next) => {
  try {
    req.query = revenueReportSchema.parse(req.query);
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.errors[0].message || 'Validation failed',
      errors: error.errors,
    });
  }
};
