'use strict';

module.exports = {
  async up(queryInterface, DataTypes) {
    // Add fcm_token to customers table
    await queryInterface.addColumn('customers', 'fcmToken', {
      type: DataTypes.TEXT,
      allowNull: true,
      after: 'password'
    });

    // Add fcm_token to restaurants table
    await queryInterface.addColumn('restaurants', 'fcmToken', {
      type: DataTypes.TEXT,
      allowNull: true,
      after: 'password'
    });

    // Add fcm_token to deliveryMen table
    await queryInterface.addColumn('deliveryMen', 'fcmToken', {
      type:DataTypes.TEXT,
      allowNull: true,
      after: 'password'
    });
  },

  async down(queryInterface) {
    // Remove fcm_token from customers table
    await queryInterface.removeColumn('customers', 'fcmToken');

    // Remove fcm_token from restaurants table
    await queryInterface.removeColumn('restaurants', 'fcmToken');

    // Remove fcm_token from deliveryMen table
    await queryInterface.removeColumn('deliveryMen', 'fcmToken');
  }
};
