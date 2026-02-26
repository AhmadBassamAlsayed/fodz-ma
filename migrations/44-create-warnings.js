'use strict';

module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('warnings', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      deliveryManId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'deliveryMen',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      status: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: 'active'
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

    // Add index on deliveryManId for faster queries
    await queryInterface.addIndex('warnings', ['deliveryManId']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('warnings');
  }
};
