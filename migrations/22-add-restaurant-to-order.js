'use strict';

module.exports = {
  async up(queryInterface, DataTypes) {
    // Add restaurantId column to orders table
    await queryInterface.addColumn('orders', 'restaurantId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'restaurants',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add restaurantName column to orders table
    await queryInterface.addColumn('orders', 'restaurantName', {
      type: DataTypes.STRING(160),
      allowNull: true
    });
  },

  async down(queryInterface) {
    // Remove restaurantId column from orders table
    await queryInterface.removeColumn('orders', 'restaurantId');

    // Remove restaurantName column from orders table
    await queryInterface.removeColumn('orders', 'restaurantName');
  }
};
