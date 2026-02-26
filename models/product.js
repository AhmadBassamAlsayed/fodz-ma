'use strict';

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    'Product',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
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
      name: {
        type: DataTypes.STRING(160),
        allowNull: false
      },
      slug: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      salePrice: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
        defaultValue: 0
      },
      forSale:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },

      barcode: {
        type: DataTypes.STRING(120),
        allowNull: true
      },
      costPrice: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
        defaultValue: 0
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      minStock: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      maxStock: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
      prepTimeMinutes: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      restaurantId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      rate: {
        type: DataTypes.DECIMAL(5, 2),
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
      photoUrl: {
        type: DataTypes.STRING(500),
        allowNull: true
      }
    },
    {
      tableName: 'products',
      timestamps: true
    }
  );

  Product.associate = (models) => {
    Product.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'category'
    });

    Product.belongsTo(models.Restaurant, {
      foreignKey: 'restaurantId',
      as: 'restaurant'
    });

    Product.hasMany(models.CartItem, {
      foreignKey: 'productId',
      as: 'cartItems'
    });

    Product.hasMany(models.OrderItem, {
      foreignKey: 'productId',
      as: 'orderItems'
    });

    Product.hasMany(models.Offer, {
      foreignKey: 'productId',
      as: 'offers'
    });

    Product.hasMany(models.Offer, {
      foreignKey: 'productId',
      as: 'plessingOffers'
    });

    Product.hasMany(models.AddonPerProduct, {
      foreignKey: 'productId',
      as: 'productAddons'
    });

    Product.hasMany(models.ComboItem, {
      foreignKey: 'productId',
      as: 'comboItems'
    });

    Product.hasMany(models.Favorite, {
      foreignKey: 'productId',
      as: 'favorites'
    });

    Product.hasMany(models.Rate, {
      foreignKey: 'productId',
      as: 'rates'
    });
  };

  return Product;
};
