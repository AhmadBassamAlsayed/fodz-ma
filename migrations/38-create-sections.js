'use strict';

module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('sections', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
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
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sections');
  }
};
