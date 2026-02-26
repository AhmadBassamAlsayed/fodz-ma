'use strict';

module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define(
    'Address',
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
      streetAddress: {
        type: DataTypes.STRING(255),
        allowNull: true
      },      
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },

      isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      city: {
        type: DataTypes.STRING(120),
        allowNull: false
      },
      country: {
        type: DataTypes.STRING(120),
        allowNull: false
      },
      street: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      stateRegion: {
        type: DataTypes.STRING(120),
        allowNull: true
      },
      phone: {
        type: DataTypes.STRING(32),
        allowNull: true
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      restaurantId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      customerId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      type: {
        type: DataTypes.STRING(64),
        allowNull: false
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: false
      },
      longitude: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: false
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
      tableName: 'addresses',
      timestamps: true
    }
  );

  Address.associate = (models) => {
    Address.belongsTo(models.Customer, {
      foreignKey: 'customerId',
      as: 'customer'
    });

    Address.belongsTo(models.Restaurant, {
      foreignKey: 'restaurantId',
      as: 'restaurant'
    });

    Address.hasMany(models.Cart, {
      foreignKey: 'addressId',
      as: 'carts'
    });

    Address.hasMany(models.Order, {
      foreignKey: 'addressId',
      as: 'orders'
    });
  };

  return Address;
};
