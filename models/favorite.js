'use strict';

module.exports = (sequelize, DataTypes) => {
  const Favorite = sequelize.define(
    'Favorite',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      customerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'customers',
          key: 'id'
        }
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        }
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
      tableName: 'favorites',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['customerId', 'productId']
        }
      ]
    }
  );

  Favorite.associate = (models) => {
    Favorite.belongsTo(models.Customer, {
      foreignKey: 'customerId',
      as: 'customer'
    });

    Favorite.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product'
    });
  };

  return Favorite;
};
