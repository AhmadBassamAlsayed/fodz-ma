'use strict';

module.exports = (sequelize, DataTypes) => {
  const Section = sequelize.define(
    'Section',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      screen: {
        type: DataTypes.STRING(120),
        allowNull: true
      },
      type: {
        type: DataTypes.STRING(120),
        allowNull: true
      },
      name: {
        type: DataTypes.STRING(120),
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
      tableName: 'sections',
      timestamps: true
    }
  );

  Section.associate = (models) => {
    Section.hasMany(models.SectionItem, {
      foreignKey: 'sectionId',
      as: 'items'
    });
  };

  return Section;
};
