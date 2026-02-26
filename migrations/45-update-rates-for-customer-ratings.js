'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('DELETE FROM rates;');

    await queryInterface.changeColumn('rates', 'restaurantId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'restaurants',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await queryInterface.changeColumn('rates', 'orderId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'orders',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await queryInterface.changeColumn('rates', 'deliveryManId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'deliveryMen',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await queryInterface.changeColumn('rates', 'totalAmount', {
      type: Sequelize.DECIMAL(16, 2),
      allowNull: true,
      defaultValue: 0
    });

    await queryInterface.changeColumn('rates', 'rating', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null
    });

    await queryInterface.addColumn('rates', 'customerId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await queryInterface.addColumn('rates', 'productId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'products',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('rates', 'customerId');
    await queryInterface.removeColumn('rates', 'productId');

    await queryInterface.changeColumn('rates', 'restaurantId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'restaurants',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await queryInterface.changeColumn('rates', 'orderId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await queryInterface.changeColumn('rates', 'deliveryManId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'deliveryMen',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await queryInterface.changeColumn('rates', 'totalAmount', {
      type: Sequelize.DECIMAL(16, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.changeColumn('rates', 'rating', {
      type: Sequelize.DECIMAL(3, 2),
      allowNull: true,
      defaultValue: null
    });
  }
};
