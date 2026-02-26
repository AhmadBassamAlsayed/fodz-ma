'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    
    return queryInterface.bulkInsert('carts', [
      {
        id: 1,
        customerId: 1,
        restaurantId: 1,
        totalAmount: 45.97,
        totalItems: 3,
        isActive: true,
        expiresAt: futureDate,
        notes: 'Please deliver before 6 PM',
        addressId: 1,
        status: 'active',
        createdBy: 'customer',
        updatedBy: 'customer',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        customerId: 2,
        restaurantId: 2,
        totalAmount: 31.98,
        totalItems: 2,
        isActive: true,
        expiresAt: futureDate,
        notes: null,
        addressId: 3,
        status: 'active',
        createdBy: 'customer',
        updatedBy: 'customer',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        customerId: 3,
        restaurantId: 3,
        totalAmount: 15.99,
        totalItems: 2,
        isActive: true,
        expiresAt: futureDate,
        notes: 'Extra napkins please',
        addressId: 4,
        status: 'active',
        createdBy: 'customer',
        updatedBy: 'customer',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 4,
        customerId: 1,
        restaurantId: 1,
        totalAmount: 35.99,
        totalItems: 1,
        isActive: false,
        expiresAt: new Date('2024-01-10'),
        notes: 'Converted to order',
        addressId: 2,
        status: 'converted',
        createdBy: 'customer',
        updatedBy: 'system',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-10')
      },
      {
        id: 5,
        customerId: 4,
        restaurantId: 1,
        totalAmount: 0.00,
        totalItems: 0,
        isActive: false,
        expiresAt: new Date('2023-12-01'),
        notes: 'Abandoned cart',
        addressId: 5,
        status: 'abandoned',
        createdBy: 'customer',
        updatedBy: 'system',
        createdAt: new Date('2023-11-15'),
        updatedAt: new Date('2023-12-01')
      },
      {
        id: 6,
        customerId: 5,
        restaurantId: 2,
        totalAmount: 0.00,
        totalItems: 0,
        isActive: false,
        expiresAt: new Date('2023-10-01'),
        notes: 'Deleted cart',
        addressId: 6,
        status: 'deleted',
        createdBy: 'customer',
        updatedBy: 'admin',
        createdAt: new Date('2023-09-15'),
        updatedAt: now
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('carts', null, {});
  }
};
