'use strict';

module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.addColumn('rates', 'rating', {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      defaultValue: null,
      comment: 'Rating value from 0.00 to 5.00'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('rates', 'rating');
  }
};
