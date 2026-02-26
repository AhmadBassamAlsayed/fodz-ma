'use strict';

module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    'Category',
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
      shortName: {
        type: DataTypes.STRING(60),
        allowNull: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      restaurantId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      parentCategoryId: {
        type: DataTypes.INTEGER,
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
      tableName: 'categories',
      timestamps: true
    }
  );

  Category.associate = (models) => {
    Category.hasMany(models.Category, {
      foreignKey: 'parentCategoryId',
      as: 'children'
    });

    Category.belongsTo(models.Category, {
      foreignKey: 'parentCategoryId',
      as: 'parent'
    });

    Category.belongsTo(models.Restaurant, {
      foreignKey: 'restaurantId',
      as: 'restaurant'
    });

    Category.hasMany(models.Product, {
      foreignKey: 'categoryId',
      as: 'products'
    });
  };

  return Category;
};
