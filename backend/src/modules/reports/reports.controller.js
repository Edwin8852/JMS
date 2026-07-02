const reportsService = require('./reports.service');

const getRevenueReport = async (req, res, next) => {
  try {
    const data = await reportsService.generateRevenueReport(req.query);
    return res.status(200).json({
      success: true,
      message: 'Revenue report fetched successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

const getLoanReport = async (req, res, next) => {
  try {
    const data = await reportsService.generateLoanReport(req.query);
    return res.status(200).json({
      success: true,
      message: 'Loan report fetched successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

const getPaymentReport = async (req, res, next) => {
  try {
    const data = await reportsService.generatePaymentReport(req.query);
    return res.status(200).json({
      success: true,
      message: 'Payment report fetched successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

const getCustomerReport = async (req, res, next) => {
  try {
    const data = await reportsService.generateCustomerReport();
    return res.status(200).json({
      success: true,
      message: 'Customer report fetched successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRevenueReport,
  getLoanReport,
  getPaymentReport,
  getCustomerReport
};
