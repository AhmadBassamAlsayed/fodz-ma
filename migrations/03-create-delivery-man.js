'use strict';

module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('deliveryMen', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false
      },      
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      phoneNumber: {
        type: DataTypes.STRING(32),
        allowNull: false
      },
      vehicleType: {
        type: DataTypes.STRING(64),
        allowNull: false
      },
      rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
      },
      account: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      wallet: {
        type: DataTypes.DECIMAL(16, 2),
        allowNull: false,
        defaultValue: 0
      },
      deliveredOrders: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      createdBy: {
        type: DataTypes.STRING(120),
        allowNull: true
      },
      updatedBy: {
        type: DataTypes.STRING(120),
        allowNull: true
      },
      status: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: 'active'
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('deliveryMen');
  }
};
