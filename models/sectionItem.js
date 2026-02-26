'use strict';

module.exports = (sequelize, DataTypes) => {
  const SectionItem = sequelize.define(
    'SectionItem',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      sectionId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      restaurantId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      famId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true
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
      tableName: 'sectionItems',
      timestamps: true
    }
  );

  SectionItem.associate = (models) => {
    SectionItem.belongsTo(models.Section, {
      foreignKey: 'sectionId',
      as: 'section'
    });

    SectionItem.belongsTo(models.Restaurant, {
      foreignKey: 'restaurantId',
      as: 'restaurant'
    });

    SectionItem.belongsTo(models.Restaurant, {
      foreignKey: 'famId',
      as: 'familyRestaurant'
    });

    SectionItem.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product'
    });

    SectionItem.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'category'
    });
  };

  return SectionItem;
};
