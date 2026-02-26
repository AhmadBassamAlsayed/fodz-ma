'use strict';

module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.changeColumn('offers', 'startDate', {
      type: DataTypes.DATE,
      allowNull: true
    });

    await queryInterface.changeColumn('offers', 'endDate', {
      type: DataTypes.DATE,
      allowNull: true
    });
  },

  async down(queryInterface, DataTypes) {
    await queryInterface.changeColumn('offers', 'startDate', {
      type: DataTypes.DATE(6),
      allowNull: true
    });

    await queryInterface.changeColumn('offers', 'endDate', {
      type: DataTypes.DATE(6),
      allowNull: true
    });
  }
};
