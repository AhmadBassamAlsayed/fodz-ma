'use strict';

module.exports = (sequelize, DataTypes) => {
  const Rate = sequelize.define(
    'Rate',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      customerId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      restaurantId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      deliveryManId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      totalAmount: {
        type: DataTypes.DECIMAL(16, 2),
        allowNull: true,
        defaultValue: 0
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
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
      tableName: 'rates',
      timestamps: true
    }
  );

  Rate.associate = (models) => {
    Rate.belongsTo(models.Customer, {
      foreignKey: 'customerId',
      as: 'customer'
    });

    Rate.belongsTo(models.Restaurant, {
      foreignKey: 'restaurantId',
      as: 'restaurant'
    });

    Rate.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product'
    });

    Rate.belongsTo(models.Order, {
      foreignKey: 'orderId',
      as: 'order'
    });

    Rate.belongsTo(models.DeliveryMan, {
      foreignKey: 'deliveryManId',
      as: 'deliveryMan'
    });
  };

  return Rate;
};
