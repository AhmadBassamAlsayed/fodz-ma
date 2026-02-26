'use strict';

module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('addresses', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false
      },
      streetAddress: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      city: {
        type: DataTypes.STRING(120),
        allowNull: false
      },
      country: {
        type: DataTypes.STRING(120),
        allowNull: false
      },      
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      street: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      stateRegion: {
        type: DataTypes.STRING(120),
        allowNull: true
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      phone: {
        type: DataTypes.STRING(32),
        allowNull: true
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      restaurantId:{
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'restaurants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      customerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'customers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: DataTypes.STRING(64),
        allowNull: false
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: false
      },
      longitude: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: false
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('addresses');
  }
};
