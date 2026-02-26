'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    
    return queryInterface.bulkInsert('combos', [
      {
        id: 1,
        name: 'Pizza Party Combo',
        restaurantId: 1,
        price: 35.99,
        startDate: new Date('2024-01-01'),
        expireDate: futureDate,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        name: 'Family Pizza Deal',
        restaurantId: 1,
        price: 45.99,
        startDate: new Date('2024-01-01'),
        expireDate: futureDate,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        name: 'Burger Meal Deal',
        restaurantId: 2,
        price: 15.99,
        startDate: new Date('2024-01-01'),
        expireDate: futureDate,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 4,
        name: 'Double Burger Combo',
        restaurantId: 2,
        price: 24.99,
        startDate: new Date('2024-01-01'),
        expireDate: futureDate,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 5,
        name: 'Sushi Platter',
        restaurantId: 3,
        price: 29.99,
        startDate: new Date('2024-01-01'),
        expireDate: futureDate,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 6,
        name: 'Taco Tuesday Special',
        restaurantId: 4,
        price: 12.99,
        startDate: new Date('2024-01-01'),
        expireDate: futureDate,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 7,
        name: 'Expired Combo',
        restaurantId: 1,
        price: 20.00,
        startDate: new Date('2023-06-01'),
        expireDate: new Date('2023-12-31'),
        status: 'inactive',
        createdBy: 'restaurant',
        updatedBy: 'admin',
        createdAt: new Date('2023-06-01'),
        updatedAt: now
      },
      {
        id: 8,
        name: 'Deleted Combo',
        restaurantId: 2,
        price: 0.00,
        startDate: new Date('2023-05-01'),
        expireDate: new Date('2023-08-31'),
        status: 'deleted',
        createdBy: 'restaurant',
        updatedBy: 'admin',
        createdAt: new Date('2023-05-01'),
        updatedAt: now
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('combos', null, {});
  }
};
