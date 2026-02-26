'use strict';

module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.addColumn('deliveryMen', 'city', {
      type: DataTypes.STRING(120),
      allowNull: true,
      after: 'emailAddress'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('deliveryMen', 'city');
  }
};
