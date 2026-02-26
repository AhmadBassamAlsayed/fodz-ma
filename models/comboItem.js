'use strict';

module.exports = (sequelize, DataTypes) => {
  const ComboItem = sequelize.define(
    'ComboItem',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      comboId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
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
      tableName: 'comboItems',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['comboId', 'productId']
        }
      ]
    }
  );

  ComboItem.associate = (models) => {
    ComboItem.belongsTo(models.Combo, {
      foreignKey: 'comboId',
      as: 'combo'
    });

    ComboItem.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product'
    });
  };

  return ComboItem;
};
