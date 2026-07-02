'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add INTEREST_ACCRUAL to the enum if it doesn't exist
    // In PostgreSQL, we can use ALTER TYPE
    try {
      await queryInterface.sequelize.query(
        "ALTER TYPE enum_loan_ledger_entries_transaction_type ADD VALUE 'INTEREST_ACCRUAL';"
      );
    } catch (error) {
      console.log('Enum value might already exist, skipping.', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Removing an enum value is not supported directly in standard Postgres without recreating the type.
    // For rollback purposes, it's safer to leave it or do nothing in a simple down script.
  }
};
