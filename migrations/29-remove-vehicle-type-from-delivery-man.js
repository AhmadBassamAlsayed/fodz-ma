'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('deliveryMen', 'vehicleType');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('deliveryMen', 'vehicleType', {
      type: Sequelize.STRING(64),
      allowNull: false,
      defaultValue: 'motorcycle'
    });
  }
};
