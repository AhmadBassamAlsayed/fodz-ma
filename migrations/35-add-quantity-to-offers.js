'use strict';

module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.addColumn('offers', 'quantity', {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: 'Available quantity for the offer, null means unlimited'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('offers', 'quantity');
  }
};
