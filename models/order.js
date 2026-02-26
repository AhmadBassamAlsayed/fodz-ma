'use strict';

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    'Order',
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
      orderNumber: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true
      },
      paymentStatus: {
        type: DataTypes.STRING(32),
        allowNull: false
      },
      paymentMethod: {
        type: DataTypes.STRING(32),
        allowNull: true
      },
      totalAmount: {
        type: DataTypes.DECIMAL(16, 2),
        allowNull: false,
        defaultValue: 0
      },
      subTotal: {
        type: DataTypes.DECIMAL(16, 2),
        allowNull: false,
        defaultValue: 0
      },
      discountAmount: {
        type: DataTypes.DECIMAL(16, 2),
        allowNull: false,
        defaultValue: 0
      },
      shippingAmount: {
        type: DataTypes.DECIMAL(16, 2),
        allowNull: false,
        defaultValue: 0
      },
      cartId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      restaurantId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      restaurantName: {
        type: DataTypes.STRING(160),
        allowNull: true
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      deliveryDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      deliveryStatus: {
        type: DataTypes.STRING(32),
        allowNull: true
      },
      addressId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      deliveryMethod: {
        type: DataTypes.STRING(64),
        allowNull: true
      },
      deliveryManId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      status: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: 'pending'
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },      
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      isPlessing: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      fcode: {
        type: DataTypes.STRING(64),
        allowNull: true,
        unique: true
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
      tableName: 'orders',
      timestamps: true
    }
  );

  Order.associate = (models) => {
    Order.belongsTo(models.Customer, {
      foreignKey: 'customerId',
      as: 'customer'
    });

    Order.belongsTo(models.Restaurant, {
      foreignKey: 'restaurantId',
      as: 'restaurant'
    });
    
    Order.belongsTo(models.Cart, {
      foreignKey: 'cartId',
      as: 'cart'
    });

    Order.belongsTo(models.Address, {
      foreignKey: 'addressId',
      as: 'address'
    });

    Order.belongsTo(models.DeliveryMan, {
      foreignKey: 'deliveryManId',
      as: 'deliveryMan'
    });

    Order.hasMany(models.OrderItem, {
      foreignKey: 'orderId',
      as: 'items'
    });

    Order.hasOne(models.Rate, {
      foreignKey: 'orderId',
      as: 'rate'
    });
  };

  return Order;
};
