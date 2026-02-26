'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('deliveryMen', 'isVerified', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('deliveryMen', 'pdf1Url', {
      type: Sequelize.STRING(500),
      allowNull: true
    });

    await queryInterface.addColumn('deliveryMen', 'pdf2Url', {
      type: Sequelize.STRING(500),
      allowNull: true
    });

    await queryInterface.addColumn('deliveryMen', 'pdf3Url', {
      type: Sequelize.STRING(500),
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('deliveryMen', 'isVerified');
    await queryInterface.removeColumn('deliveryMen', 'pdf1Url');
    await queryInterface.removeColumn('deliveryMen', 'pdf2Url');
    await queryInterface.removeColumn('deliveryMen', 'pdf3Url');
  }
};
