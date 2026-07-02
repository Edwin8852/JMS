'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('gold_loans');

    if (!tableInfo['total_accrued_interest']) {
      await queryInterface.addColumn('gold_loans', 'total_accrued_interest', {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0,
      });
    }

    if (!tableInfo['last_interest_calculated_at']) {
      await queryInterface.addColumn('gold_loans', 'last_interest_calculated_at', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('gold_loans', 'total_accrued_interest');
    await queryInterface.removeColumn('gold_loans', 'last_interest_calculated_at');
  }
};
