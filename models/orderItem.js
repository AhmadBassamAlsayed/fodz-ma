'use strict';

module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define(
    'OrderItem',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      orderId: {
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
      offerId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      parentOrderItemId: {
        type: DataTypes.INTEGER,
        allowNull: true
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
      discountAmount: {
        type: DataTypes.DECIMAL(16, 2),
        allowNull: false,
        defaultValue: 0
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      type: {
        type: DataTypes.STRING(32),
        allowNull: true
      },
      productName: {
        type: DataTypes.STRING(160),
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
      tableName: 'orderItems',
      timestamps: true
    }
  );

  OrderItem.associate = (models) => {
    OrderItem.belongsTo(models.Order, {
      foreignKey: 'orderId',
      as: 'order'
    });

    OrderItem.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product'
    });

    OrderItem.belongsTo(models.Addon, {
      foreignKey: 'addonId',
      as: 'addon'
    });

    OrderItem.belongsTo(models.Combo, {
      foreignKey: 'comboId',
      as: 'combo'
    });

    OrderItem.belongsTo(models.Offer, {
      foreignKey: 'offerId',
      as: 'offer'
    });

    // Self-referential association for parent-child relationship
    OrderItem.belongsTo(models.OrderItem, {
      foreignKey: 'parentOrderItemId',
      as: 'parentOrderItem'
    });

    OrderItem.hasMany(models.OrderItem, {
      foreignKey: 'parentOrderItemId',
      as: 'childOrderItems'
    });
  };

  return OrderItem;
};
