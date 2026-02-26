'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // This migration documents the 'unpaid' status for orders
    // No schema changes needed - status field already exists as STRING(32)
    // Valid statuses: 'unpaid', 'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled', 'failed'
    console.log('Migration: Added support for unpaid order status');
  },

  down: async (queryInterface, Sequelize) => {
    // No rollback needed
    console.log('Migration: Removed unpaid status support');
  }
};
