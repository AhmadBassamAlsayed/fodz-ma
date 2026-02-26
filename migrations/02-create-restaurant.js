'use strict';

module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('restaurants', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(160),
        allowNull: false
      },
      emailAddress: {
        type: DataTypes.STRING(160),
        allowNull: true
      },
      phoneNumber: {
        type: DataTypes.STRING(32),
        allowNull: false
      },
      slug: {
        type: DataTypes.STRING(200),
        allowNull: true,
        unique: true
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      deliveryDistanceKm: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: true
      },
      longitude: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: true
      },
      city: {
        type: DataTypes.STRING(120),
        allowNull: true
      },
      country: {
        type: DataTypes.STRING(120),
        allowNull: true
      },
      street: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      neighborhood: {
        type: DataTypes.STRING(160),
        allowNull: true
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      pdfUrl: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      type: {
        type: DataTypes.STRING(64),
        allowNull: true,
        defaultValue: 'restaurant'

      },      
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: 'pending'
      },
      createdBy: {
        type: DataTypes.STRING(120),
        allowNull: true
      },
      updatedBy: {
        type: DataTypes.STRING(120),
        allowNull: true
      },
      stateRegion: {
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
    await queryInterface.dropTable('restaurants');
  }
};
