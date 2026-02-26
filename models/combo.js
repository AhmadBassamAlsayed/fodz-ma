'use strict';

module.exports = (sequelize, DataTypes) => {
  const Combo = sequelize.define(
    'Combo',
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
      status: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: 'inactive'
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
      restaurantId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      price: {
        type: DataTypes.DECIMAL(16, 2),
        allowNull: false,
        defaultValue: 0
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      expireDate: {
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
      description:{
        type: DataTypes.STRING(160),
        allowNull: true
      },
      photoUrl: {
        type: DataTypes.STRING(500),
        allowNull: true
      }
    },
    {
      tableName: 'combos',
      timestamps: true
    }
  );

  Combo.associate = (models) => {
    Combo.belongsTo(models.Restaurant, {
      foreignKey: 'restaurantId',
      as: 'restaurant'
    });

    Combo.hasMany(models.ComboItem, {
      foreignKey: 'comboId',
      as: 'items'
    });

    Combo.hasMany(models.CartItem, {
      foreignKey: 'comboId',
      as: 'cartItems'
    });
  };

  return Combo;
};
