'use strict';

module.exports = {
  async up(queryInterface, DataTypes) {
    // Add photoUrl to products
    await queryInterface.addColumn('products', 'photoUrl', {
      type: DataTypes.STRING(500),
      allowNull: true
    });

    // Add photoUrl to combos
    await queryInterface.addColumn('combos', 'photoUrl', {
      type: DataTypes.STRING(500),
      allowNull: true
    });

    // Add photoUrl and coverUrl to restaurants
    await queryInterface.addColumn('restaurants', 'photoUrl', {
      type: DataTypes.STRING(500),
      allowNull: true
    });

    await queryInterface.addColumn('restaurants', 'coverUrl', {
      type: DataTypes.STRING(500),
      allowNull: true
    });

    // Add photoUrl to categories
    await queryInterface.addColumn('categories', 'photoUrl', {
      type: DataTypes.STRING(500),
      allowNull: true
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('products', 'photoUrl');
    await queryInterface.removeColumn('combos', 'photoUrl');
    await queryInterface.removeColumn('restaurants', 'photoUrl');
    await queryInterface.removeColumn('restaurants', 'coverUrl');
    await queryInterface.removeColumn('categories', 'photoUrl');
  }
};
