'use strict';

module.exports = (sequelize, DataTypes) => {
  const PayMobTransaction = sequelize.define(
    'PayMobTransaction',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      paymobOrderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      }
    },
    {
      tableName: 'paymob_transactions',
      timestamps: true
    }
  );

  PayMobTransaction.associate = (models) => {
    PayMobTransaction.belongsTo(models.PayMobOrder, {
      foreignKey: 'paymobOrderId',
      as: 'paymobOrder'
    });
  };

  return PayMobTransaction;
};
