'use strict';

module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('offers', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(160),
        allowNull: true
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },      
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      type: {
        type: DataTypes.STRING(32),
        allowNull: false
      },
      amount: {
        type: DataTypes.DECIMAL(16, 2),
        allowNull: true
      },
      percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
      },
      status: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: 'inactive'
      },
      createdBy: {
        type: DataTypes.STRING(120),
        allowNull: true
      },
      updatedBy: {
        type: DataTypes.STRING(120),
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      startDate: {
        allowNull: true,
        type: DataTypes.DATE(6)
      },
      endDate: {
        allowNull: true,
        type: DataTypes.DATE(6)
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('offers');
  }
};
