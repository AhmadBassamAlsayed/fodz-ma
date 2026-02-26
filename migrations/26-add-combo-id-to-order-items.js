'use strict';

module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.addColumn('orderItems', 'comboId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'combos',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('orderItems', 'comboId');
  }
};
