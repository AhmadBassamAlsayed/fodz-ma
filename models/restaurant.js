'use strict';

module.exports = (sequelize, DataTypes) => {
  const Restaurant = sequelize.define(
    'Restaurant',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(160),
        allowNull: false
      },
      emailAddress: {
        type: DataTypes.STRING(160),
        allowNull: true
      },
      phoneNumber: {
        type: DataTypes.STRING(32),
        allowNull: false
      },
      slug: {
        type: DataTypes.STRING(200),
        allowNull: true,
        unique: true
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      fcmToken: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      deliveryDistanceKm: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: true
      },
      longitude: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: true
      },
      city: {
        type: DataTypes.STRING(120),
        allowNull: true
      },
      country: {
        type: DataTypes.STRING(120),
        allowNull: true
      },
      street: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      neighborhood: {
        type: DataTypes.STRING(160),
        allowNull: true
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      pdfUrl: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      type: {
        type: DataTypes.STRING(64),
        allowNull: true,
        defaultValue: 'restaurant'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: 'pending'
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
      },
      stateRegion: {
        type: DataTypes.STRING(120),
        allowNull: true
      },
      photoUrl: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      coverUrl: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      wallet: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0
      }
    },
    {
      tableName: 'restaurants',
      timestamps: true
    }
  );

  Restaurant.associate = (models) => {
    Restaurant.hasMany(models.Product, {
      foreignKey: 'restaurantId',
      as: 'products'
    });
    Restaurant.hasMany(models.Combo, {
      foreignKey: 'restaurantId',
      as: 'combos'
    });
    Restaurant.hasMany(models.Order, {
      foreignKey: 'restaurantId',
      as: 'orders'
    });
    Restaurant.hasMany(models.Rate, {
      foreignKey: 'restaurantId',
      as: 'ratings'
    });
    Restaurant.hasMany(models.Category, {
      foreignKey: 'restaurantId',
      as: 'categories'
    });
    Restaurant.hasMany(models.Addon, {
      foreignKey: 'restaurantId',
      as: 'addons'
    });
    Restaurant.hasMany(models.Address, {
      foreignKey: 'restaurantId',
      as: 'addresses'
    });
  };

  return Restaurant;
};
