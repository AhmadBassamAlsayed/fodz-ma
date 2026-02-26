'use strict';

module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.addColumn('customers', 'banReason', {
      type: DataTypes.TEXT,
      allowNull: true
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('customers', 'banReason');
  }
};
