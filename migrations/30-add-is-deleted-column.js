'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add isDeleted column to all tables
    const tables = [
      'products',
      'categories',
      'combos',
      'comboItems',
      'addons',
      'addonsPerProduct',
      'offers',
      'addresses',
      'favorites',
      'customers',
      'restaurants',
      'deliveryMen',
      'admins',
      'orders'
    ];

    for (const table of tables) {
      await queryInterface.addColumn(table, 'isDeleted', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });
    }

    // Update existing records: set isDeleted = true where status = 'deleted'
    for (const table of tables) {
      await queryInterface.sequelize.query(
        `UPDATE "${table}" SET "isDeleted" = true WHERE status = 'deleted'`
      );
    }
  },

  async down(queryInterface, Sequelize) {
    const tables = [
      'products',
      'categories',
      'combos',
      'comboItems',
      'addons',
      'addonsPerProduct',
      'offers',
      'addresses',
      'favorites',
      'customers',
      'restaurants',
      'deliveryMen',
      'admins',
      'orders'
    ];

    for (const table of tables) {
      await queryInterface.removeColumn(table, 'isDeleted');
    }
  }
};
