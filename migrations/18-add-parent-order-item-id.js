'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('orderItems', 'parentOrderItemId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'orderItems',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('orderItems', 'parentOrderItemId');
  }
};
