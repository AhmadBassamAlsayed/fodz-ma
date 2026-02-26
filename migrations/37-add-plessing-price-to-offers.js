'use strict';

module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.addColumn('offers', 'plessingPrice', {
      type: DataTypes.DECIMAL(16, 2),
      allowNull: true
    });
  },

  async down(queryInterface, DataTypes) {
    await queryInterface.removeColumn('offers', 'plessingPrice');
  }
};
