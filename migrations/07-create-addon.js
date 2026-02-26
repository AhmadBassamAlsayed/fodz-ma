'use strict';

module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('addons', {
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
      slug: {
        type: DataTypes.STRING(200),
        allowNull: true,
        unique: true
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
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      salePrice: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        defaultValue: 0
      },
      costPrice: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
        defaultValue: 0
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      minStock: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      maxStock: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      weight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      dimensions: {
        type: DataTypes.STRING(160),
        allowNull: true
      },
      brand: {
        type: DataTypes.STRING(120),
        allowNull: true
      },
      unit: {
        type: DataTypes.STRING(32),
        allowNull: true
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
    await queryInterface.dropTable('addons');
  }
};
