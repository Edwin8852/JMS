require('dotenv').config();
const db = require('./src/models');
const { sequelize } = db;
const bcrypt = require('bcryptjs');

/**
 * Reusable helper function to seed data without creating duplicates.
 */
async function seedIfNotExists(Model, condition, defaultData, transaction, entityName) {
  const [record, created] = await Model.findOrCreate({
    where: condition,
    defaults: defaultData,
    transaction
  });

  if (created) {
    console.log(`\x1b[32m✓ ${entityName} Seeded\x1b[0m`);
  } else {
    console.log(`\x1b[33m✓ ${entityName} Already Exists\x1b[0m`);
  }
  return record;
}

async function runSeed() {
  console.log('\n--- Starting Master Data Seed Process ---\n');

  // Wrapping everything in a transaction for atomicity
  const transaction = await sequelize.transaction();

  try {
    // 1. Roles
    const roles = [
      { name: 'SUPER_ADMIN' },
      { name: 'ADMIN' },
      { name: 'CUSTOMER' }
    ];

    for (const role of roles) {
      await seedIfNotExists(
        db.Role,
        { name: role.name },
        { name: role.name },
        transaction,
        `Role: ${role.name}`
      );
    }

    // 2. Users
    const users = [
      {
        firstName: 'Super',
        lastName: 'Admin',
        email: 'super@gmail.com',
        mobile: '9876543210',
        password: 'admin@321',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        isKycVerified: true,
        isFirstLogin: false
      },
      {
        firstName: 'System',
        lastName: 'Admin',
        email: 'admin@gmail.com',
        mobile: '9876543211',
        password: 'admin@321',
        role: 'ADMIN',
        status: 'ACTIVE',
        isKycVerified: true,
        isFirstLogin: false
      },
      {
        firstName: 'Customer',
        lastName: 'User',
        email: 'kcpavithra23@gmail.com',
        mobile: '9876543212',
        password: 'pavi2321',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        isKycVerified: true,
        isFirstLogin: false
      }
    ];

    for (const user of users) {
      await seedIfNotExists(
        db.User,
        { email: user.email },
        user,
        transaction,
        `${user.role} User: ${user.email}`
      );
    }

    // 3. Generic Configurations via SystemSetting
    // For entities that lack dedicated models in src/models, we utilize SystemSettings.
    const systemSettings = [
      { key: 'DEFAULT_COMPANY_NAME', value: 'SDRS Gold ERP', description: 'Default Company' },
      { key: 'DEFAULT_BRANCH_NAME', value: 'Headquarters', description: 'Default Branch' },
      { key: 'LOAN_TYPES', value: 'GOLD,SILVER,PROPERTY', description: 'Available Loan Types' },
      { key: 'LOAN_STATUSES', value: 'PENDING,APPROVED,ACTIVE,CLOSED,DEFAULTED', description: 'Loan Statuses' },
      { key: 'PAYMENT_STATUSES', value: 'PENDING,SUCCESS,FAILED,REFUNDED', description: 'Payment Statuses' },
      { key: 'REVENUE_CATEGORIES', value: 'INTEREST,FEE,COMMISSION', description: 'Revenue Categories' },
      { key: 'EXPENSE_CATEGORIES', value: 'SALARY,RENT,UTILITIES,MISC', description: 'Expense Categories' },
      { key: 'CUSTOMER_CATEGORIES', value: 'REGULAR,VIP,CORPORATE', description: 'Customer Categories' },
      { key: 'JEWELRY_CATEGORIES', value: 'RING,CHAIN,BANGLE,NECKLACE', description: 'Jewelry Categories' },
      { key: 'ORDER_STATUSES', value: 'PENDING,PROCESSING,COMPLETED,CANCELLED', description: 'Order Statuses' },
      { key: 'NOTIFICATION_TEMPLATES', value: 'WELCOME,PAYMENT_SUCCESS,LOAN_APPROVAL', description: 'Notification Templates' },
    ];

    for (const setting of systemSettings) {
      await seedIfNotExists(
        db.SystemSetting,
        { settingKey: setting.key },
        { settingKey: setting.key, settingValue: setting.value, description: setting.description },
        transaction,
        `System Setting: ${setting.key}`
      );
    }

    // 4. Gold Purity & Silver Rate
    const today = new Date().toISOString().split('T')[0];
    await seedIfNotExists(
      db.GoldRate,
      { rateDate: today },
      {
        gold18k: 4500.00,
        gold22k: 5500.00,
        gold24k: 6000.00,
        silverRate: 80.00,
        rateDate: today,
        city: 'Chennai',
        source: 'System_Default',
        fetchedAt: new Date()
      },
      transaction,
      'Gold Purity & Silver Rate (Today)'
    );

    // 5. Gold Loan Scheme
    await seedIfNotExists(
      db.GoldLoanScheme,
      { schemeName: 'Standard Gold Loan' },
      {
        schemeName: 'Standard Gold Loan',
        interestRate: 1.5,
        ltvPercentage: 75,
        durationMonths: 12,
        penaltyRate: 2,
        processingFee: 500,
        minimumAmount: 1000,
        status: 'ACTIVE'
      },
      transaction,
      'Standard Gold Loan Scheme'
    );

    // 6. Chit Fund Plan
    await seedIfNotExists(
      db.ChitScheme,
      { schemeName: 'Standard 1L Chit (20 Months)' },
      {
        schemeName: 'Standard 1L Chit (20 Months)',
        totalAmount: 100000,
        monthlyInstallment: 5000,
        durationMonths: 20,
        maxSubscribers: 20,
        startDate: today,
        status: 'ACTIVE',
        commissionPercentage: 5.00,
        description: 'Standard chit fund plan for 20 months.',
        isActive: true
      },
      transaction,
      'Standard 1L Chit Scheme'
    );

    // Commit transaction if all succeeded
    await transaction.commit();

    console.log('\n\x1b[32m✅ Seed Completed Successfully\x1b[0m\n');
    process.exit(0);

  } catch (error) {
    // Rollback transaction if there was an error
    await transaction.rollback();
    
    console.error('\n\x1b[31m❌ Seed Failed! Transaction rolled back.\x1b[0m');
    console.error(error.message);
    if (error.errors) {
       console.error(error.errors.map(e => e.message));
    }
    process.exit(1);
  }
}

// Execute the seed script
runSeed();
