'use strict';

module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('products', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      status: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: 'active'
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
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'categories',
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
      forSale:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      barcode: {
        type: DataTypes.STRING(120),
        allowNull: true
      },
      costPrice: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        defaultValue: 0
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      minStock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      maxStock: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      prepTimeMinutes: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      restaurantId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'restaurants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      rate: {
        type: DataTypes.DECIMAL(5, 2),
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
    await queryInterface.dropTable('products');
  }
};
