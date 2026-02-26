'use strict';

module.exports = (sequelize, DataTypes) => {
  const CartItem = sequelize.define(
    'CartItem',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      restaurantId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      cartId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      addonId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      comboId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      parentCartItemId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      type: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: 'product'
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      unitPrice: {
        type: DataTypes.DECIMAL(16, 2),
        allowNull: false,
        defaultValue: 0
      },
      totalPrice: {
        type: DataTypes.DECIMAL(16, 2),
        allowNull: false,
        defaultValue: 0
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: 'active'
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
      }
    },
    {
      tableName: 'cartItems',
      timestamps: true
    }
  );

  CartItem.associate = (models) => {
    CartItem.belongsTo(models.Cart, {
      foreignKey: 'cartId',
      as: 'cart'
    });
    CartItem.belongsTo(models.Restaurant,{
      foreignKey: 'restaurantId',
      as: 'restaurant'
    });
    CartItem.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product'
    });

    CartItem.belongsTo(models.Addon, {
      foreignKey: 'addonId',
      as: 'addon'
    });

    CartItem.belongsTo(models.Combo, {
      foreignKey: 'comboId',
      as: 'combo'
    });

    CartItem.belongsTo(models.CartItem, {
      foreignKey: 'parentCartItemId',
      as: 'parentItem'
    });

    CartItem.hasMany(models.CartItem, {
      foreignKey: 'parentCartItemId',
      as: 'childItems'
    });
  };

  return CartItem;
};
