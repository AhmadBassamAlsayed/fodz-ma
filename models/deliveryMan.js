'use strict';

module.exports = (sequelize, DataTypes) => {
  const DeliveryMan = sequelize.define(
    'DeliveryMan',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      fcmToken: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      phoneNumber: {
        type: DataTypes.STRING(32),
        allowNull: false
      },
      emailAddress: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      city: {
        type: DataTypes.STRING(120),
        allowNull: true
      },
      pdfPath: {
        type: DataTypes.STRING(500),
        allowNull: false
      },
      pdf1Url: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      pdf2Url: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      pdf3Url: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
      },
      account: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      deliveredOrders: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
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
      tableName: 'deliveryMen',
      timestamps: true
    }
  );

  DeliveryMan.associate = (models) => {
    DeliveryMan.hasMany(models.Order, {
      foreignKey: 'deliveryManId',
      as: 'orders'
    });

    DeliveryMan.hasMany(models.Rate, {
      foreignKey: 'deliveryManId',
      as: 'ratings'
    });

    DeliveryMan.hasMany(models.Warning, {
      foreignKey: 'deliveryManId',
      as: 'warnings'
    });
  };

  return DeliveryMan;
};
