'use strict';

module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('paymob_orders', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Reference to Order table (if linked)'
      },
      customerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'customers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Customer who initiated the payment'
      },
      paymobOrderId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'PayMob order ID returned from API'
      },
      amount: {
        type: DataTypes.DECIMAL(16, 2),
        allowNull: false,
        comment: 'Amount in primary currency'
      },
      amountCents: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Amount in cents for PayMob API'
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'EGP',
        comment: 'Currency code (e.g., EGP, USD)'
      },
      paymentKey: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Payment key token for iframe'
      },
      billingData: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Billing information JSON'
      },
      status: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'pending, processing, completed, failed, refunded'
      },
      paymentStatus: {
        type: DataTypes.STRING(32),
        allowNull: true,
        comment: 'PayMob payment status'
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
    await queryInterface.dropTable('paymob_orders');
  }
};
