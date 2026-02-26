'use strict';

module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.addColumn('deliveryMen', 'emailAddress', {
      type: DataTypes.STRING(255),
      allowNull: true,
      after: 'phoneNumber'
    });

    await queryInterface.addColumn('deliveryMen', 'pdfPath', {
      type: DataTypes.STRING(500),
      allowNull: false,
      after: 'emailAddress'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('deliveryMen', 'emailAddress');
    await queryInterface.removeColumn('deliveryMen', 'pdfPath');
  }
};
