'use strict';

module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('combos', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(160),
        allowNull: false
      },
      status: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: 'inactive'
      },
      restaurantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'restaurants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      price: {
        type: DataTypes.DECIMAL(16, 2),
        allowNull: false,
        defaultValue: 0
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      expireDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      description:{
        type: DataTypes.STRING(160),
        allowNull: true
      },
      createdBy: {
        type: DataTypes.STRING(120),
        allowNull: true
      },
      updatedBy: {
        type: DataTypes.STRING(120),
        allowNull: true
      },      
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
    await queryInterface.dropTable('combos');
  }
};
