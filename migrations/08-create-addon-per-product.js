'use strict';

module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('addonsPerProduct', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
      addonId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'addons',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: 'active'
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

    await queryInterface.addConstraint('addonsPerProduct', {
      fields: ['productId', 'addonId'],
      type: 'unique',
      name: 'addonsPerProduct_unique_product_addon'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('addonsPerProduct');
  }
};
