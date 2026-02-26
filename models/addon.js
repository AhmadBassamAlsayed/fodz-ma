'use strict';

module.exports = (sequelize, DataTypes) => {
  const Addon = sequelize.define(
    'Addon',
    {
      id: {
        type: DataTypes.INTEGER,
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
        allowNull: false
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
      }
    },
    {
      tableName: 'addons',
      timestamps: true
    }
  );

  Addon.associate = (models) => {
    Addon.belongsTo(models.Restaurant, {
      foreignKey: 'restaurantId',
      as: 'restaurant'
    });

    Addon.hasMany(models.CartItem, {
      foreignKey: 'addonId',
      as: 'cartItems'
    });

    Addon.hasMany(models.OrderItem, {
      foreignKey: 'addonId',
      as: 'orderItems'
    });

    Addon.hasMany(models.AddonPerProduct, {
      foreignKey: 'addonId',
      as: 'addonProducts'
    });
  };

  return Addon;
};
