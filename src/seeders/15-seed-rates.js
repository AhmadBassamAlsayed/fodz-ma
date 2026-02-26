'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    
    return queryInterface.bulkInsert('rates', [
      {
        id: 1,
        restaurantId: 1,
        orderId: 1,
        deliveryManId: 1,
        totalAmount: 6.00,
        rating: 4.50,
        notes: 'Standard delivery rate',
        status: 'active',
        isActive: true,
        createdBy: 'system',
        updatedBy: 'system',
        createdAt: new Date('2024-11-01'),
        updatedAt: new Date('2024-11-01')
      },
      {
        id: 2,
        restaurantId: 2,
        orderId: 2,
        deliveryManId: 2,
        totalAmount: 6.00,
        rating: 4.80,
        notes: 'Express delivery rate',
        status: 'active',
        isActive: true,
        createdBy: 'system',
        updatedBy: 'system',
        createdAt: new Date('2024-11-02'),
        updatedAt: new Date('2024-11-02')
      },
      {
        id: 3,
        restaurantId: 1,
        orderId: 3,
        deliveryManId: 1,
        totalAmount: 6.00,
        rating: 5.00,
        notes: 'Standard delivery rate',
        status: 'active',
        isActive: true,
        createdBy: 'system',
        updatedBy: 'system',
        createdAt: new Date('2024-11-03'),
        updatedAt: new Date('2024-11-03')
      },
      {
        id: 4,
        restaurantId: 3,
        orderId: 4,
        deliveryManId: 3,
        totalAmount: 6.00,
        rating: 3.75,
        notes: 'Standard delivery rate',
        status: 'active',
        isActive: true,
        createdBy: 'system',
        updatedBy: 'system',
        createdAt: new Date('2024-11-04'),
        updatedAt: new Date('2024-11-04')
      },
      {
        id: 5,
        restaurantId: 2,
        orderId: 5,
        deliveryManId: 2,
        totalAmount: 11.00,
        rating: 4.20,
        notes: 'Express delivery rate - long distance',
        status: 'active',
        isActive: true,
        createdBy: 'system',
        updatedBy: 'system',
        createdAt: new Date('2024-11-05'),
        updatedAt: new Date('2024-11-05')
      },
      {
        id: 6,
        restaurantId: 1,
        orderId: 1,
        deliveryManId: 1,
        totalAmount: 5.50,
        rating: 4.70,
        notes: 'Additional service charge',
        status: 'active',
        isActive: true,
        createdBy: 'system',
        updatedBy: 'system',
        createdAt: new Date('2024-11-01'),
        updatedAt: new Date('2024-11-01')
      },
      {
        id: 7,
        restaurantId: 3,
        orderId: 4,
        deliveryManId: 3,
        totalAmount: 4.50,
        rating: 4.00,
        notes: 'Peak hour surcharge',
        status: 'active',
        isActive: true,
        createdBy: 'system',
        updatedBy: 'system',
        createdAt: new Date('2024-11-04'),
        updatedAt: new Date('2024-11-04')
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('rates', null, {});
  }
};
