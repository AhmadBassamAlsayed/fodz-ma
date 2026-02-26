'use strict';

module.exports = (sequelize, DataTypes) => {
  const Offer = sequelize.define(
    'Offer',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(160),
        allowNull: true
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      type: {
        type: DataTypes.STRING(32),
        allowNull: false
      },
      amount: {
        type: DataTypes.DECIMAL(16, 2),
        allowNull: true
      },
      percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
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
      isPleassing: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        comment: 'Available quantity for the offer, null means unlimited'
      },
      plessingPrice: {
        type: DataTypes.DECIMAL(16, 2),
        allowNull: true
      },
      startDate: {
        allowNull: true,
        type: DataTypes.DATE
      },
      endDate: {
        allowNull: true,
        type: DataTypes.DATE
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
      tableName: 'offers',
      timestamps: true
    }
  );

  Offer.associate = (models) => {
    Offer.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product'
    });
  };

  return Offer;
};
