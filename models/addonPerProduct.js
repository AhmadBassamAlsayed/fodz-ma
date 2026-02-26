'use strict';

module.exports = (sequelize, DataTypes) => {
  const AddonPerProduct = sequelize.define(
    'AddonPerProduct',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      addonId: {
        type: DataTypes.INTEGER,
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
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      updatedBy: {
        type: DataTypes.STRING(120),
        allowNull: true
      }
    },
    {
      tableName: 'addonsPerProduct',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['productId', 'addonId']
        }
      ]
    }
  );

  AddonPerProduct.associate = (models) => {
    AddonPerProduct.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product'
    });

    AddonPerProduct.belongsTo(models.Addon, {
      foreignKey: 'addonId',
      as: 'addon'
    });
  };

  return AddonPerProduct;
};
