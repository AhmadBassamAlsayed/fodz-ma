'use strict';

module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('paymob_transactions', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      paymobOrderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'paymob_orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Reference to PayMobOrder table'
      },
      transactionId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'PayMob transaction ID'
      },
      amount: {
        type: DataTypes.DECIMAL(16, 2),
        allowNull: false,
        comment: 'Transaction amount'
      },
      amountCents: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Amount in cents'
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'EGP'
      },
      status: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'success, failed, pending, refunded'
      },
      paymentMethod: {
        type: DataTypes.STRING(64),
        allowNull: true,
        comment: 'Payment method used (card, wallet, etc.)'
      },
      responseData: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Full response from PayMob API'
      },
      webhookData: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Webhook payload from PayMob'
      },
      verifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When transaction was verified'
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
    await queryInterface.dropTable('paymob_transactions');
  }
};
