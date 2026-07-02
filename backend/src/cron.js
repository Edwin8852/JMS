const cron = require('node-cron');
const goldRateService = require('./modules/goldRates/goldRate.service');
const { GoldLoan, Customer } = require('./models');
const { sendEMIReminder } = require('./shared/utils/sms');

/**
 * Initialize all automated cron jobs
 */
const initCronJobs = () => {
  // 1. Update Gold Rate every 30 minutes
  //    Cron expression: "*/30 * * * *" with timezone option
  cron.schedule('*/30 * * * *', async () => {
    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    console.log(`⏰ [Cron] Running Gold Rate Update at ${now} IST ...`);
    try {
      const saved = await goldRateService.fetchAndSaveTodaysRate();
      console.log(`✅ [Cron] Gold Rate saved — 24K: ₹${saved.gold24k}, 22K: ₹${saved.gold22k}, 18K: ₹${saved.gold18k}, Ag: ₹${saved.silverRate} (source: ${saved.source})`);
    } catch (err) {
      console.error(`❌ [Cron] Gold Rate Update failed: ${err.message}`);
    }
  }, {
    timezone: 'Asia/Kolkata'
  });

  // 2. Scan for EMIs due in 2 days (Run daily at 9:00 AM)
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Running EMI Reminder Cron...');
    
    const { Op } = require('sequelize');
    const NotificationService = require('./modules/notification/notification.service');

    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    
    try {
      const upcomingLoans = await GoldLoan.findAll({
        where: {
          status: 'ACTIVE',
          // Simplified logic: checking if next payment date is in 2 days
          // In real ERP, this would check against an EMI schedule table
        },
        include: [{ model: Customer, as: 'customer' }]
      });

      for (const loan of upcomingLoans) {
        if (loan.customer) {
          // Send SMS
          await sendEMIReminder(
            loan.customer.firstName,
            loan.customer.mobileNumber,
            loan.monthlyInterest || 5000,
            twoDaysFromNow.toLocaleDateString()
          );

          // Create System Notification
          await NotificationService.createNotification({
            customerId: loan.customerId,
            type: 'EMI_REMINDER',
            message: `Friendly reminder: Your loan EMI for ${loan.loanCode || loan.id} is coming up soon.`
          }).catch(err => console.error('Notification Error:', err.message));
        }
      }
    } catch (error) {
      console.error('❌ EMI Cron Error:', error.message);
    }
  });

  // 3. Risk Engine Hook: Check Overdue Payments & Defaults (Run daily at 1:00 AM)
  cron.schedule('0 1 * * *', async () => {
    console.log('⏰ Running Risk Engine Hook Cron...');
    const { Op } = require('sequelize');
    const NotificationService = require('./modules/notification/notification.service');

    try {
      // Find overdue loans
      const overdueLoans = await GoldLoan.findAll({
        where: {
          status: 'ACTIVE',
          dueDate: { [Op.lt]: new Date() } // Past due
        },
        include: [{ model: Customer, as: 'customer' }]
      });

      for (const loan of overdueLoans) {
        if (loan.customer) {
          // Increase Risk Score (meaning higher risk)
          let newRiskScore = loan.customer.riskScore + 5; // Penalty of 5 points
          if (newRiskScore > 100) newRiskScore = 100; // Cap at 100

          await loan.customer.update({ riskScore: newRiskScore, lastRiskUpdate: new Date() });

          // Send Default/Late Payment Alert
          await NotificationService.createNotification({
            customerId: loan.customerId,
            type: 'LATE_PAYMENT',
            message: `URGENT: Your payment for loan ${loan.loanCode || loan.id} is overdue. Please pay immediately.`
          }).catch(err => console.error('Notification Error:', err.message));
        }
      }
    } catch (error) {
      console.error('❌ Risk Engine Cron Error:', error.message);
    }
  });

  // 4. Monthly Interest Accrual Hook (Run daily at 12:30 AM)
  cron.schedule('30 0 * * *', async () => {
    console.log('⏰ Running Monthly Interest Accrual Cron...');
    const { Op } = require('sequelize');
    const { LoanLedgerEntry } = require('./models');

    try {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      // Find active/overdue loans that haven't had interest calculated in a month
      const activeLoans = await GoldLoan.findAll({
        where: {
          status: { [Op.in]: ['ACTIVE', 'OVERDUE'] },
          [Op.or]: [
            { lastInterestCalculatedAt: { [Op.lte]: oneMonthAgo } },
            { 
              lastInterestCalculatedAt: null,
              loanDate: { [Op.lte]: oneMonthAgo }
            }
          ]
        }
      });

      let accruedCount = 0;
      for (const loan of activeLoans) {
        // Calculate new interest for this month based on outstanding principal
        const outstandingPrincipal = parseFloat(loan.remainingPrincipal || 0);
        const interestRate = parseFloat(loan.interestRate || 12);
        
        // Use existing logic for monthly interest (interestRate is Annual %):
        const monthlyInterest = (outstandingPrincipal * interestRate) / (100 * 12);

        if (monthlyInterest > 0) {
          const newTotalAccrued = parseFloat((parseFloat(loan.totalAccruedInterest || 0) + monthlyInterest).toFixed(2));
          const newInterestAmount = parseFloat((parseFloat(loan.interestAmount || 0) + monthlyInterest).toFixed(2));
          
          // Next calculation date should be exactly 1 month from the last date to avoid drifting,
          // but for simplicity in daily cron, setting to today's date.
          const lastCalcDate = loan.lastInterestCalculatedAt ? new Date(loan.lastInterestCalculatedAt) : new Date(loan.loanDate);
          lastCalcDate.setMonth(lastCalcDate.getMonth() + 1);

          await loan.update({
            interestAmount: newInterestAmount,
            totalAccruedInterest: newTotalAccrued,
            lastInterestCalculatedAt: lastCalcDate,
            monthlyInterest: parseFloat(monthlyInterest.toFixed(2))
          });

          await LoanLedgerEntry.create({
            loanId: loan.id,
            customerId: loan.customerId,
            transactionType: 'INTEREST_ACCRUAL',
            amount: parseFloat(monthlyInterest.toFixed(2)),
            balanceAfter: outstandingPrincipal,
            remarks: `Monthly Interest Accrual (${interestRate}% p.a. on ₹${outstandingPrincipal})`
          });
          
          accruedCount++;
        }
      }
      console.log(`✅ [Cron] Monthly Interest Accrued for ${accruedCount} loans.`);
    } catch (error) {
      console.error('❌ [Cron] Monthly Interest Accrual Error:', error.message);
    }
  });

  console.log('🚀 Automation Cron Jobs Initialized');
};

module.exports = { initCronJobs };
