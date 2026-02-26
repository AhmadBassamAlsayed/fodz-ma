'use strict';

module.exports = (sequelize, DataTypes) => {
  const Warning = sequelize.define(
    'Warning',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      deliveryManId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'deliveryMen',
          key: 'id'
        }
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false
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
      tableName: 'warnings',
      timestamps: true
    }
  );

  Warning.associate = (models) => {
    Warning.belongsTo(models.DeliveryMan, {
      foreignKey: 'deliveryManId',
      as: 'deliveryMan'
    });
  };

  return Warning;
};
