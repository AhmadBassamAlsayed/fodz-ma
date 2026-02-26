'use strict';

module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define(
    'Customer',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false
      },
      phoneNumber: {
        type: DataTypes.STRING(32),
        allowNull: false
      },
      emailAddress: {
        type: DataTypes.STRING(160),
        allowNull: true
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      fcmToken: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      emailVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      lastLogin: {
        type: DataTypes.DATE,
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
      status: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: 'active'
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      banReason: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      tableName: 'customers',
      timestamps: true
    }
  );

  Customer.associate = (models) => {
    Customer.hasMany(models.Cart, {
      foreignKey: 'customerId',
      as: 'carts'
    });

    Customer.hasMany(models.Address, {
      foreignKey: 'customerId',
      as: 'addresses'
    });

    Customer.hasMany(models.Order, {
      foreignKey: 'customerId',
      as: 'orders'
    });

    Customer.hasMany(models.Favorite, {
      foreignKey: 'customerId',
      as: 'favorites'
    });
  };

  return Customer;
};
