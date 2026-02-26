'use strict';

module.exports = {
  async up(queryInterface, DataTypes) {
    // Change fcmToken column type to TEXT in customers table
    await queryInterface.changeColumn('customers', 'fcmToken', {
      type: DataTypes.TEXT,
      allowNull: true
    });

    // Change fcmToken column type to TEXT in restaurants table
    await queryInterface.changeColumn('restaurants', 'fcmToken', {
      type: DataTypes.TEXT,
      allowNull: true
    });

    // Change fcmToken column type to TEXT in deliveryMen table
    await queryInterface.changeColumn('deliveryMen', 'fcmToken', {
      type: DataTypes.TEXT,
      allowNull: true
    });
  },

  async down(queryInterface, DataTypes) {
    // Revert fcmToken column type back to VARCHAR(255) in customers table
    await queryInterface.changeColumn('customers', 'fcmToken', {
      type: DataTypes.STRING(255),
      allowNull: true
    });

    // Revert fcmToken column type back to VARCHAR(255) in restaurants table
    await queryInterface.changeColumn('restaurants', 'fcmToken', {
      type: DataTypes.STRING(255),
      allowNull: true
    });

    // Revert fcmToken column type back to VARCHAR(255) in deliveryMen table
    await queryInterface.changeColumn('deliveryMen', 'fcmToken', {
      type: DataTypes.STRING(255),
      allowNull: true
    });
  }
};
