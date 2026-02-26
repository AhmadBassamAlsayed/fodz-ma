'use strict';

module.exports = (sequelize, DataTypes) => {
  const HomeAd = sequelize.define(
    'HomeAd',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      resId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      photoUrl: {
        type: DataTypes.STRING(500),
        allowNull: true
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
      tableName: 'home_ads',
      timestamps: true
    }
  );

  HomeAd.associate = (models) => {
    HomeAd.belongsTo(models.Restaurant, {
      foreignKey: 'resId',
      as: 'restaurant'
    });
  };

  return HomeAd;
};
