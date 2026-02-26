'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('deliveryMen', 'wallet');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('deliveryMen', 'wallet', {
      type: Sequelize.DECIMAL(16, 2),
      allowNull: false,
      defaultValue: 0
    });
  }
};
